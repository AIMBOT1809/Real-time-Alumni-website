require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { supabase } = require("./authMiddleware");

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:5187",
     "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000", "http://127.0.0.1:5187"];

const validateRoutes = require("./validateRoutes");
const chatRoutes = require("./chatRoutes");

const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("io", io);

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Existing routes
app.use("/", validateRoutes);

// Chat API routes
app.use("/api", chatRoutes);

// Delete post
app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("delete_post", { id });
  res.status(204).end();
});

// Like post (increment likes)
app.post("/api/posts/:id/like", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("posts")
    .update({ likes: supabase.raw("likes + 1") })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("update_post", data);
  res.json(data);
});

// Comment on post
app.post("/api/posts/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { content, userId } = req.body;
  // Insert comment record (assumes a comments table exists)
  const { data: commentData, error: commentError } = await supabase
    .from("comments")
    .insert({ post_id: id, user_id: userId, content })
    .select()
    .single();
  if (commentError) return res.status(500).json({ error: commentError.message });
  // Increment comment count on post
  await supabase.from("posts").update({ comments: supabase.raw("comments + 1") }).eq("id", id);
  if (req.app.get("io")) req.app.get("io").emit("new_comment", commentData);
  res.json(commentData);
});

// Share post (increment share count)
app.post("/api/posts/:id/share", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("posts")
    .update({ shares: supabase.raw("shares + 1") })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("update_post", data);
  res.json(data);
});

// Edit post (partial update)
app.patch("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("update_post", data);
  res.json(data);
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("delete_event", { id });
  res.status(204).end();
});

// Like event
app.post("/api/events/:id/like", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("events")
    .update({ likes: supabase.raw("likes + 1") })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("update_event", data);
  res.json(data);
});

// Edit event (partial)
app.patch("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("update_event", data);
  res.json(data);
});
app.get("/api/posts", async (req, res) => {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post("/api/posts", async (req, res) => {
  const { title, content, role } = req.body;
  const userId = req.userId;
  const { data, error } = await supabase.from("posts").insert({ title, content, user_id: userId, role }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("new_post", data);
  res.status(201).json(data);
});

// Events API routes
app.get("/api/events", async (req, res) => {
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post("/api/events", async (req, res) => {
  const { title, description, location, start_time, end_time, role } = req.body;
  const userId = req.userId;
  const { data, error } = await supabase.from("events").insert({ title, description, location, start_time, end_time, user_id: userId, role }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (req.app.get("io")) req.app.get("io").emit("new_event", data);
  res.status(201).json(data);
});

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for connections`);
});
