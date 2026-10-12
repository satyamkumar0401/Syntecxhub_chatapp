require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

io.on("connection", (socket) => {
  socket.on("join", async ({ username, room }) => {
    socket.username = username.trim().slice(0, 20);
    socket.room = room.trim().toLowerCase().slice(0, 30);
    socket.join(socket.room);

    const history = await Message.find({ room: socket.room })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    socket.emit("history", history.reverse());
    socket.to(socket.room).emit("system", `${socket.username} joined the room`);
  });

  socket.on("message", async (text) => {
    if (!socket.room || !text || !text.trim()) return;
    const msg = await Message.create({
      room: socket.room,
      username: socket.username,
      text: text.trim().slice(0, 1000),
    });
    io.to(socket.room).emit("message", msg);
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.to(socket.room).emit("system", `${socket.username} left the room`);
    }
  });
});

const dist = path.join(__dirname, "../client/dist");
app.use(express.static(dist));
app.use((req, res) => res.sendFile(path.join(dist, "index.html")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
