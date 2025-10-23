import { Router } from "express";
import type { ChatController } from "../controllers/ChatController.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const createChatRoutes = (chatController: ChatController) => {
  const router = Router();

  // POST /chat - Send a message to the chatbot
  // Requires authentication to prevent abuse
  router.post(
    "/chat",
    requireAuth,
    asyncHandler(chatController.sendMessage.bind(chatController))
  );

  return router;
};
