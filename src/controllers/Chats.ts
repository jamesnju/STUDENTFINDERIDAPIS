import express from "express";
import { prisma } from "../conn/connection";

// Create a chat between two users
export async function createChat(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.method !== "POST") {
     res.status(405).json({ error: "Method not allowed" });
     return;
  }

  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
     res
      .status(400)
      .json({ error: "Both user1Id and user2Id are required" });
      return
  }

  try {
    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });
    if (existingChat) {
       res.status(200).json(existingChat);
       return;
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        user1Id,
        user2Id,
      },
    });

     res.status(201).json(chat);
     return;
  } catch (error) {
    console.error("Error creating chat:", error);
     res.status(500).json({ error: "Failed to create chat" });
     return;
  }
}

// Send a message in a chat
export async function sendMessage(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.method !== "POST") {
     res.status(405).json({ error: "Method not allowed" });
     return;
  }

  const { senderId, receiverId, text } = req.body;

  if (!senderId || !receiverId || !text) {
     res.status(400).json({ error: "Missing required fields" });
     return;
  }

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    if (!chat) {
       res.status(404).json({ error: "Chat not found" });
       return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        chatId: chat.id,
      },
    });

     res.status(201).json(message);
     return;
  } catch (error) {
    console.error("Error sending message:", error);
     res.status(500).json({ error: "Failed to send message" });
     return;
  }
}

// Fetch chat history
export async function chatHistory(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.method !== "GET") {
     res.status(405).json({ error: "Method not allowed" });
     return;
  }

  const { chatId } = req.query;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      orderBy: { sentAt: "asc" },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

     res.status(200).json(messages);
     return;
  } catch (error) {
    console.error("Error fetching chat history:", error);
     res.status(500).json({ error: "Failed to fetch messages" });
     return;
  }
}

// Fetch messages received by a user
export async function receivedMessages(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const messages = await prisma.message.findMany({
      where: { receiverId: Number(userId) },
      orderBy: { sentAt: "desc" },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    res.status(200).json(messages);
    return;
  } catch (error) {
    console.error("Error fetching received messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
    return;
  }
}

// Get messages for a single user
export async function getUserMessages(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: Number(userId) },
          { receiverId: Number(userId) },
        ],
      },
      orderBy: { sentAt: "desc" },
      include: {
        sender: {
          select: {
            name: true, // Assuming the user table has a 'name' field
          },
        },
      },
    });

    res.status(200).json(messages);
    return;
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
    return;
  }
}

// Get notifications for a user
export async function getNotifications(req: express.Request,
  res: express.Response,
  next: express.NextFunction) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(notifications);
    return;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
    return;
  }
}

