import prisma from "../prismaClient.js";

export const getParticipantStatus = async (req, res) => {
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
};

export const getLiveStatus = async (req, res) => {
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
};

