import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "./prismaClient.js";
import dotenv from "dotenv";
dotenv.config();
import { verifyToken, isSuperAdmin } from "./middleware/auth.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});
/* ------------------------- LOGIN ROUTE --------------------------*/ app.post(
  "/api/auth/login",
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token, role: admin.role });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
); 
// ================================================== // CHECKPOINT ROUTES (Only for Super Admin) //
//  ================================================== // ✅ CREATE CHECKPOINT 
// ✅ CHECKPOINT ROUTES
app.post("/api/checkpoints", verifyToken, isSuperAdmin, async (req, res) => {
  const { name, type } = req.body;

  try {
    const checkpoint = await prisma.checkpoint.create({
      data: { name, type },
    });
    
    // Emit socket event for checkpoint creation
    io.emit("checkpoint:created", checkpoint);
    
    // Also emit checkpoint list refresh event
    const allCheckpoints = await prisma.checkpoint.findMany({
      orderBy: { createdAt: "desc" },
    });
    io.emit("checkpoints:updated", allCheckpoints);
    
    res.json(checkpoint);
  } catch (err) {
    console.error("Create Checkpoint Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET ALL CHECKPOINTS
app.get("/api/checkpoints", verifyToken, async (req, res) => {
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(checkpoints);
  } catch (err) {
    console.error("Fetch Checkpoints Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE CHECKPOINT
app.put("/api/checkpoints/:id", verifyToken, isSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    const updated = await prisma.checkpoint.update({
      where: { id },
      data: { name, type },
    });
    
    // Emit socket event for checkpoint update
    io.emit("checkpoint:updated", updated);
    
    // Also emit checkpoint list refresh event
    const allCheckpoints = await prisma.checkpoint.findMany({
      orderBy: { createdAt: "desc" },
    });
    io.emit("checkpoints:updated", allCheckpoints);
    
    res.json(updated);
  } catch (err) {
    console.error("Update Checkpoint Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE CHECKPOINT
app.delete(
  "/api/checkpoints/:id",
  verifyToken,
  isSuperAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.checkpoint.delete({ where: { id } });
      
      // Emit socket event for checkpoint deletion
      io.emit("checkpoint:deleted", { id });
      
      // Also emit checkpoint list refresh event
      const allCheckpoints = await prisma.checkpoint.findMany({
        orderBy: { createdAt: "desc" },
      });
      io.emit("checkpoints:updated", allCheckpoints);
      
      res.json({ message: "Checkpoint deleted successfully" });
    } catch (err) {
      console.error("Delete Checkpoint Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ==================================================
// 👥 PARTICIPANTS ROUTES (Super Admin only)
// ==================================================

// ✅ GET ALL PARTICIPANTS
app.get("/api/participants", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      select: { id: true, name: true, year: true, branch: true },
      orderBy: { registrationTime: "desc" },
    });

    res.json(participants);
  } catch (err) {
    console.error("Fetch Participants Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ SCAN QR (ENTRY / EXIT)
app.post("/api/scan", verifyToken, async (req, res) => {
  const { token, checkpointId, action } = req.body;

  try {
    const participant = await prisma.participant.findUnique({ where: { token } });
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    let visit = await prisma.visit.findFirst({
      where: { participantId: participant.id, checkpointId },
    });

    if (!visit) {
      visit = await prisma.visit.create({
        data: {
          participantId: participant.id,
          checkpointId,
          lastStatus: "NOT_VISITED",
        },
      });
    }

    let updatedVisit;
    if (action === "entry") {
      updatedVisit = await prisma.visit.update({
        where: { id: visit.id },
        data: {
          lastStatus: "INSIDE",
          visitCount: { increment: 1 },
          lastScanTime: new Date(),
        },
      });
    } else if (action === "exit") {
      updatedVisit = await prisma.visit.update({
        where: { id: visit.id },
        data: {
          lastStatus: "EXITED",
          lastScanTime: new Date(),
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const activeCount = await prisma.visit.count({
      where: { checkpointId, lastStatus: "INSIDE" },
    });

    // Get live status for all checkpoints to emit
    const checkpoints = await prisma.checkpoint.findMany({
      include: {
        visits: {
          where: { lastStatus: "INSIDE" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedLiveStatus = checkpoints.map((cp) => ({
      id: cp.id,
      name: cp.name,
      count: cp.visits.length,
    }));

    // Get dashboard stats to emit
    const totalParticipants = await prisma.participant.count();
    const insideVisits = await prisma.visit.findMany({
      where: { lastStatus: "INSIDE" },
      select: { participantId: true, checkpointId: true },
    });
    const checkedIn = new Set(insideVisits.map((v) => v.participantId)).size;
    const exited = totalParticipants - checkedIn;

    const liveByCheckpoint = await prisma.visit.groupBy({
      by: ["checkpointId"],
      where: { lastStatus: "INSIDE" },
      _count: { checkpointId: true },
    });

    const checkpointData = await Promise.all(
      liveByCheckpoint.map(async (c) => {
        const checkpoint = await prisma.checkpoint.findUnique({
          where: { id: c.checkpointId },
        });
        return { name: checkpoint.name, count: c._count.checkpointId };
      })
    );

    // Emit socket events for scan
    io.emit("scan:updated", {
      participant,
      visit: updatedVisit,
      checkpointId,
      action,
      activeCount,
    });

    // Emit live status update
    io.emit("live-status:updated", formattedLiveStatus);

    // Emit dashboard stats update
    io.emit("dashboard-stats:updated", {
      totalParticipants,
      checkedIn,
      exited,
      checkpointData,
    });

    res.json({
      participant,
      visit: updatedVisit,
      activeCount,
      message: action === "entry" ? "Entry validated" : "Exit validated",
    });
  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CHECK PARTICIPANT STATUS AT A CHECKPOINT
app.get("/api/participant-status/:token/:checkpointId", verifyToken, async (req, res) => {
  const { token, checkpointId } = req.params;

  try {
    const participant = await prisma.participant.findUnique({ where: { token } });
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    const visit = await prisma.visit.findFirst({
      where: { participantId: participant.id, checkpointId },
    });

    if (!visit) {
      return res.json({ status: "NOT_VISITED" });
    }

    res.json({ status: visit.lastStatus });
  } catch (err) {
    console.error("Error fetching status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LIVE STATUS (Checkpoints + Active People)
app.get("/api/live-status", verifyToken, async (req, res) => {
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      include: {
        visits: {
          where: { lastStatus: "INSIDE" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = checkpoints.map((cp) => ({
      id: cp.id,
      name: cp.name,
      count: cp.visits.length,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Live Status Error:", err);
    res.status(500).json({ message: "Server error fetching live status" });
  }
});

// ✅ DASHBOARD STATS
app.get("/api/dashboard-stats", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const totalParticipants = await prisma.participant.count();

    const insideVisits = await prisma.visit.findMany({
      where: { lastStatus: "INSIDE" },
      select: { participantId: true, checkpointId: true },
    });

    const checkedIn = new Set(insideVisits.map((v) => v.participantId)).size;
    const exited = totalParticipants - checkedIn;

    const liveByCheckpoint = await prisma.visit.groupBy({
      by: ["checkpointId"],
      where: { lastStatus: "INSIDE" },
      _count: { checkpointId: true },
    });

    const checkpointData = await Promise.all(
      liveByCheckpoint.map(async (c) => {
        const checkpoint = await prisma.checkpoint.findUnique({
          where: { id: c.checkpointId },
        });
        return { name: checkpoint.name, count: c._count.checkpointId };
      })
    );

    res.json({
      totalParticipants,
      checkedIn,
      exited,
      checkpointData,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ SERVER START
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.IO server ready`);
});

