import prisma from "../prismaClient.js";

export const getAllParticipants = async (req, res) => {
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
};

