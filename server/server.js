import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { Server } from "socket.io";
import Group from "./models/Groups.js"; // ✅ USE lowercase filename to avoid issues

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`🔌 User connected: ${userId}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // ✅ Join group
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 User ${userId} joined group ${groupId}`);
  });

  // ✅ Handle group messages
  socket.on("groupMessage", async (message) => {
    const { groupId, senderId, text, image, createdAt } = message;

    try {
      const group = await Group.findById(groupId);
      if (!group) {
        console.warn(`⚠️ Group not found: ${groupId}`);
        return;
      }

      if (!Array.isArray(group.messages)) {
        console.error("❌ group.messages is not an array!", group.messages);
        return;
      }

      const newMsg = {
        senderId,
        text,
        image,
        createdAt: createdAt || new Date(),
      };

      group.messages.push(newMsg);
      await group.save();

      console.log(`📨 New group message saved in group ${groupId} by ${senderId}`);

      io.to(groupId).emit("groupMessage", {
        ...newMsg,
        groupId,
      });
    } catch (err) {
      console.error("❌ Error saving group message:", err.message);
    }
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${userId}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.use("/api/status", (req, res) => res.send("✅ Server is live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRoutes);

// Database connection
await connectDB();

// Start server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

export default server;
