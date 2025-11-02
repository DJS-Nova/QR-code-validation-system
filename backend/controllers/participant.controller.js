import prisma from "../prismaClient.js";

export const getAllParticipants = async (req, res) => {
  const participants = await prisma.participant.findMany({
    select: { id: true, name: true, year: true, branch: true },
    orderBy: { registrationTime: "desc" },
  });

  res.json(participants);
};

