//import express
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const multiparty = require("connect-multiparty");
const cloudinary = require("cloudinary");

//making express app
const app = express();

//dotenv config
dotenv.config();

//cors policy
const corsPolicy = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsPolicy));

app.use(multiparty());

cloudinary.config({
  cloud_name: "de7svewsu",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

connectDB();

//mongodb connection
// mongoose.connect('mongodb+srv://test:test@cluster0.bbukho8.mongodb.net/').then(() => {
//     console.log('Connected to MongoDB');
// })

//JSON middleware to access data
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Hello");
});

// user routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/blog", require("./routes/blogRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));

//our actual routes
// http://localhost:5501/api/user/create
// http://localhost:5501/api/user/login

//defing the port
const PORT = process.env.PORT;

//run the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
