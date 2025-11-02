import prisma from "../prismaClient.js";
import { getSocketIO } from "../utils/socket.js";

export const createCheckpoint = async (req, res) => {
  const { name, type } = req.body;

  try {
    const checkpoint = await prisma.checkpoint.create({
      data: { name, type },
    });
    
    const io = getSocketIO();
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
};

export const getAllCheckpoints = async (req, res) => {
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(checkpoints);
  } catch (err) {
    console.error("Fetch Checkpoints Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCheckpoint = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    const updated = await prisma.checkpoint.update({
      where: { id },
      data: { name, type },
    });
    
    const io = getSocketIO();
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
};

export const deleteCheckpoint = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.checkpoint.delete({ where: { id } });
    
    const io = getSocketIO();
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
};

