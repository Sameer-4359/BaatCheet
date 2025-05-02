const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const { Server } = require("socket.io");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app and middleware
const app = express();
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Create HTTP server and bind with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// === WebRTC Signaling Logic ===
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("offer", ({ roomId, from, offer }) => {
    socket.to(roomId).emit("offer", { from, offer });
  });

  socket.on("answer", ({ roomId, from, answer }) => {
    socket.to(roomId).emit("answer", { from, answer });
  });

  socket.on("ice-candidate", ({ roomId, from, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { from, candidate });
  });

  socket.on("chat-message", ({ roomId, from, message, timestamp }) => {
    socket.to(roomId).emit("chat-message", { from, message, timestamp });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
