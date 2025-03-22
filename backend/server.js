const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const userRoutes= require("./routes/userRoutes")
require("./config/passport")
const authRoutes = require("./routes/authRoutes");


// loading environment variables
dotenv.config();


// conncet to the database

connectDB();



const app=express();

app.use(express.json());
app.use("/api/users",userRoutes)


// app.use(passport.initialize());
app.use("/api/auth", authRoutes);

const PORT= process.env.PORT;
app.listen(PORT,()=> console.log(`server is listening on port ${PORT}`));