import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import checkpointRoutes from "./routes/checkpoint.routes.js";
import participantRoutes from "./routes/participant.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import statusRoutes from "./routes/status.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Import socket utility
import { setSocketIO } from "./utils/socket.js";

// Import error handlers
import { errorHandler, notFoundHandler } from "./utils/expressError.js";

const app = express();
const PORT = 5000;

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set Socket.IO instance for use in controllers
setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/checkpoints", checkpointRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api", statusRoutes);
app.use("/api", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend is live and running on Render!");
});


// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last middleware
app.use(errorHandler);

// ✅ SERVER START
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.IO server ready`);
});


// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fs from "fs";
// import https from "https";
// dotenv.config();
// import { Server } from "socket.io";

// // Import routes
// import authRoutes from "./routes/auth.routes.js";
// import checkpointRoutes from "./routes/checkpoint.routes.js";
// import participantRoutes from "./routes/participant.routes.js";
// import scanRoutes from "./routes/scan.routes.js";
// import statusRoutes from "./routes/status.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";

// // Import socket utility
// import { setSocketIO } from "./utils/socket.js";

// // Import error handlers
// import { errorHandler, notFoundHandler } from "./utils/expressError.js";

// const app = express();
// const PORT = 5000;

// // ✅ Load SSL certificate (make sure cert files exist)
// const key = fs.readFileSync("./cert/key.pem");
// const cert = fs.readFileSync("./cert/cert.pem");

// // ✅ Create HTTPS server
// const httpsServer = https.createServer({ key, cert }, app);

// // ✅ Initialize Socket.IO on HTTPS server
// const io = new Server(httpsServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // ✅ Attach socket to global utility
// setSocketIO(io);

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Socket.IO connection
// io.on("connection", (socket) => {
//   console.log("✅ Client connected:", socket.id);
//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/checkpoints", checkpointRoutes);
// app.use("/api/participants", participantRoutes);
// app.use("/api/scan", scanRoutes);
// app.use("/api", statusRoutes);
// app.use("/api", dashboardRoutes);

// // ✅ Error handlers
// app.use(notFoundHandler);
// app.use(errorHandler);

// // ✅ Start HTTPS server
// httpsServer.listen(PORT, () => {
//   console.log(`🔒 HTTPS server running at https://localhost:${PORT}`);
//   console.log("✅ Socket.IO server ready (HTTPS)");
// });
