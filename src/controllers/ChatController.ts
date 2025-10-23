import type { Request, Response } from "express";
import OpenAI from "openai";
import { BusinessError } from "../middleware/errorHandler.js";

export class ChatController {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI client only if API key is provided
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // POST /chat - Send a message to the chatbot
  async sendMessage(req: Request, res: Response): Promise<void> {
    if (!this.openai) {
      throw new BusinessError(
        "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
        503
      );
    }

    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      throw new BusinessError("Message is required and must be a string", 400);
    }

    if (conversationHistory && !Array.isArray(conversationHistory)) {
      throw new BusinessError("conversationHistory must be an array", 400);
    }

    try {
      // Build messages array with system prompt, conversation history, and new message
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "You are a helpful assistant for a job application platform. You help users with questions about job applications, job listings, application status, and general platform navigation. Be professional, concise, and friendly.",
        },
      ];

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      // Add the new user message
      messages.push({
        role: "user",
        content: message,
      });

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new BusinessError("No response received from AI service", 500);
      }

      res.status(200).json({
        success: true,
        message: "Response generated successfully",
        data: {
          response: assistantMessage,
          role: "assistant",
        },
      });
    } catch (error) {
      // Handle OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        throw new BusinessError(
          `OpenAI API error: ${error.message}`,
          error.status || 500
        );
      }
      throw error;
    }
  }
}
