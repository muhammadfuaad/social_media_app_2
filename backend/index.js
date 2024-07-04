const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const connectionDB = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 8000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Import routes and controllers
const userRoute = require("./router/userRouter");
const postRoute = require("./router/postRouter");

// Connect to MongoDB
connectionDB();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "public/upload")));

// Route setup
app.use("/api", userRoute);
app.use("/api", postRoute);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on("comment", (data) => {
    socket.broadcast.emit("received-comment", data);
  });

  socket.on("like", (data) => {
   console.log(data)
    socket.broadcast.emit("received-like", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running at the port ${port}`);
});
