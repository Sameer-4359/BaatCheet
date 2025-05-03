const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const userRoutes= require("./routes/userRoutes")
const passport = require("./config/passport")
const authRoutes = require("./routes/authRoutes");
const corsOptions = require('./config/corsOptions')
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/UserModel')

// loading environment variables
dotenv.config();

// connect to the database
connectDB();

const app=express();

app.use(express.json());

// setting up corsOptions to allow communcaiton between frontend and backend (FOR REST API Only!)
app.use(cors(corsOptions))

// ------------------ socket.io - main communication logic BEGIN ------------------------------------------
// First you create an HTTP server
const server = http.createServer(app)

// Then initialize socket.io server (binding it to the http server)
const io = new Server(server, {
    cors: { // separate cors for socket.io server (defaults to same-origin only behavior of socket.io if not specified )
      origin: '*', // In production, restrict to your app's domain
      methods: ['GET', 'POST']
    }
  });

  
// Connected users map: { socketId: { userId, userEmail } }
const connectedUsers = new Map();
// Email to socket ID mapping for easier lookups
const emailToSocketId = new Map();

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    
    // Extract user info from query params
    const { userId, userEmail } = socket.handshake.query;
    
    if (userId && userEmail) {
      // Store user connection info
      connectedUsers.set(socket.id, { userId, userEmail });
      emailToSocketId.set(userEmail, socket.id);
      
      console.log(`User ${userEmail} connected with ID ${socket.id}`);
    }
  
    // Handle call invitation
    socket.on('call-invitation', async (data) => {
      try {
        const { targetEmail, from, fromEmail, fromName, type, roomId } = data;
        
        // Find the socket ID for the target user
        const targetSocketId = emailToSocketId.get(targetEmail);
        
        if (targetSocketId) {
          // Send call invitation to target user
          io.to(targetSocketId).emit('call-invitation', {
            from,
            fromEmail,
            fromName,
            roomId,
            type
          });
          
          console.log(`Call invitation sent to ${targetEmail}`);
        } else {
          // User not connected
          socket.emit('user-unavailable', { targetEmail });
          console.log(`User ${targetEmail} is not connected`);
        }
      } catch (error) {
        console.error('Error in call-invitation:', error);
      }
    });
  
    // Handle room joining
    socket.on('join-room', (data) => {
      const { roomId } = data;
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
  
    // Handle WebRTC offer
    socket.on('offer', (data) => {
      const { roomId, from, offer } = data;
      // Broadcast offer to the room (excluding sender)
      socket.to(roomId).emit('offer', { roomId, from, offer });
      console.log(`Offer sent in room ${roomId}`);
    });
  
    // Handle WebRTC answer
    socket.on('answer', (data) => {
      const { roomId, from, answer } = data;
      // Broadcast answer to the room (excluding sender)
      socket.to(roomId).emit('answer', { roomId, from, answer });
      console.log(`Answer sent in room ${roomId}`);
    });
  
    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
      const { roomId, from, candidate } = data;
      // Broadcast ICE candidate to the room (excluding sender)
      socket.to(roomId).emit('ice-candidate', { roomId, from, candidate });
      console.log(`ICE candidate sent in room ${roomId}`);
    });
  
    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { roomId, from, message, timestamp } = data;
      // Broadcast message to the room (excluding sender)
      socket.to(roomId).emit('chat-message', { roomId, from, message, timestamp });
      console.log(`Chat message sent in room ${roomId}: ${message}`);
    });
  
    // Handle call rejection
    socket.on('call-rejected', (data) => {
      const { roomId } = data;
      // Notify the caller that the call was rejected
      socket.to(roomId).emit('call-rejected');
      console.log(`Call rejected in room ${roomId}`);
    });
  
    // Handle call end
    socket.on('call-ended', (data) => {
      const { roomId } = data;
      // Notify the other user that the call ended
      socket.to(roomId).emit('call-ended');
      console.log(`Call ended in room ${roomId}`);
    });
  
    // Handle disconnect
    socket.on('disconnect', () => {
      // Get user info
      const userInfo = connectedUsers.get(socket.id);
      
      if (userInfo) {
        const { userEmail } = userInfo;
        // Remove user from maps
        emailToSocketId.delete(userEmail);
        connectedUsers.delete(socket.id);
        
        console.log(`User ${userEmail} disconnected`);
      }
      
      console.log('Client disconnected:', socket.id);
    });
  });

  // ------------------ socket.io - main communication logic END ------------------------------------------


app.use("/api/users",userRoutes)


app.use(passport.initialize());
app.use("/api/auth", authRoutes);

const PORT= process.env.PORT;
app.listen(PORT,()=> console.log(`server is listening on port ${PORT}`));