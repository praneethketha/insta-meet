const socketio = require("socket.io");
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();
const expressServer = require("http").createServer(app);
const originURL = process.env.ORIGIN_URL;

const io = socketio(expressServer, {
  cors: {
    origin: originURL,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: originURL, methods: ["GET", "POST"] }));
app.use(express.json());

expressServer.listen(process.env.PORT || 8181, () => {
  console.log("Server is listening port 8181");
});

const rooms = [];

app.post("/room", (req, res) => {
  const roomId = req.body?.roomId;
  if (!roomId) {
    return res.status(400).send("Invalid roomId");
  }
  if (rooms.includes(roomId)) {
    return res.status(500).send("Room already exists!");
  }
  rooms.push(roomId);
  return res.status(201).send("room created successfully!");
});

app.get("/room/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  if (!rooms.includes(roomId)) {
    return res.status(404).send("room doesn't exist");
  }

  return res.status(200).send("room exists in the rooms");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, data) => {
    socket.join(roomId);

    socket.broadcast.to(roomId).emit("user-connected", { userId, ...data });
  });

  socket.on("user-toggle-audio", (userId, roomId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
  });

  socket.on("user-toggle-video", (userId, roomId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-toggle-video", userId);
  });

  socket.on("user-leave", (userId, roomId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-leave", userId);
  });
});
