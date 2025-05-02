const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const userRoutes= require("./routes/userRoutes")
const passport = require("./config/passport")
const authRoutes = require("./routes/authRoutes");
const corsOptions = require('./config/corsOptions')
const cors = require('cors')


// socket.io


// loading environment variables
dotenv.config();

// conncet to the database
connectDB();

const app=express();

app.use(express.json());

// setting up corsOptions to allow communcaiton between frontend and backend
app.use(cors(corsOptions))


app.use("/api/users",userRoutes)


app.use(passport.initialize());
app.use("/api/auth", authRoutes);

const PORT= process.env.PORT;
app.listen(PORT,()=> console.log(`server is listening on port ${PORT}`));