const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { supabase } = require("./authMiddleware");

const validateRoutes = require("./validateRoutes");
const chatRoutes = require("./chatRoutes");

const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("io", io);

app.use(cors());
app.use(express.json());

// Existing routes
app.use("/", validateRoutes);

// Chat API routes
app.use("/api", chatRoutes);

// ──────────────────────────────────────
// SOCKET.IO EVENT HANDLERS
// ──────────────────────────────────────

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Authenticate: client sends userId after connecting
  socket.on("authenticate", (userId) => {
    if (!userId) return;
    socket.userId = userId;

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit("user_online", { userId });
    console.log(`[Socket] User ${userId} authenticated (socket ${socket.id})`);

    // Send list of currently online users to this socket
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineList);
  });

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(`convo:${conversationId}`);
    console.log(`[Socket] ${socket.userId || socket.id} joined convo:${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`convo:${conversationId}`);
  });

  // Send message via socket
  socket.on("send_message", async (data) => {
    const { conversationId, text, tempId } = data;
    if (!socket.userId || !conversationId) return;

    try {
      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: socket.userId,
          text: text || "",
        })
        .select()
        .single();

      if (error) {
        socket.emit("message_error", { tempId, error: error.message });
        return;
      }

      // Broadcast to everyone in the conversation room (including sender for confirmation)
      io.to(`convo:${conversationId}`).emit("receive_message", {
        ...message,
        tempId, // so sender can match optimistic message
      });
    } catch (err) {
      socket.emit("message_error", { tempId, error: err.message });
    }
  });

  // Typing indicators
  socket.on("typing", ({ conversationId }) => {
    if (!socket.userId) return;
    socket.to(`convo:${conversationId}`).emit("typing", {
      conversationId,
      userId: socket.userId,
    });
  });

  socket.on("stop_typing", ({ conversationId }) => {
    if (!socket.userId) return;
    socket.to(`convo:${conversationId}`).emit("stop_typing", {
      conversationId,
      userId: socket.userId,
    });
  });

  // Mark messages as read
  socket.on("message_read", async ({ conversationId }) => {
    if (!socket.userId || !conversationId) return;

    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", socket.userId)
      .is("read_at", null);

    socket.to(`convo:${conversationId}`).emit("message_read", {
      conversationId,
      readBy: socket.userId,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user_offline", { userId: socket.userId });
        }
      }
    }
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for connections`);
});