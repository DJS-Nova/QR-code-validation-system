import prisma from "../prismaClient.js";
import { getSocketIO } from "../utils/socket.js";
import { ExpressError } from "../utils/expressError.js";

export const scanQR = async (req, res) => {
  const { token, checkpointId, action } = req.body;

  const participant = await prisma.participant.findUnique({ where: { token } });
  if (!participant) {
    throw new ExpressError("Participant not found", 404);
  }

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
    throw new ExpressError("Invalid action", 400);
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

  const io = getSocketIO();
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
};

