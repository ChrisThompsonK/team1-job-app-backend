import type { Request, Response } from "express";
import { BusinessError } from "../middleware/errorHandler.js";

export class ChatController {
  private apiKey: string | null = null;

  constructor() {
    // Store API key if provided
    this.apiKey = process.env.GEMINI_API_KEY || null;
  }

  // POST /chat - Send a message to the chatbot
  async sendMessage(req: Request, res: Response): Promise<void> {
    if (!this.apiKey) {
      throw new BusinessError(
        "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.",
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
      // Build conversation prompt
      let prompt =
        "You are a helpful assistant for a job application platform. You help users with questions about job applications, job listings, application status, and general platform navigation. Be professional, concise, and friendly.\n\n";

      // Add conversation history if provided
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          if (msg.role === "user") {
            prompt += `User: ${msg.content}\n`;
          } else if (msg.role === "assistant") {
            prompt += `Assistant: ${msg.content}\n`;
          }
        }
      }

      // Add the new user message
      prompt += `User: ${message}\nAssistant:`;

      console.log("Calling Gemini API via REST...");

      // Call Gemini REST API directly (using v1 endpoint with gemini-2.5-flash)
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

      // Disable SSL verification for development (native fetch respects NODE_TLS_REJECT_UNAUTHORIZED)
      const originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      let response: globalThis.Response;
      let responseText: string;

      try {
        // Use native fetch (Node.js 18+)
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048, // Increased to allow for internal reasoning + response
            },
          }),
        });

        console.log("Gemini API response status:", response.status);

        responseText = await response.text();
        console.log("Gemini API raw response:", responseText);
      } catch (fetchError) {
        // Restore original TLS setting on error
        if (originalTlsReject !== undefined) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
        } else {
          delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        }
        throw fetchError;
      } finally {
        // Restore original TLS setting
        if (originalTlsReject !== undefined) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
        } else {
          delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        }
      }

      if (!response.ok) {
        console.error("Gemini API error response:", responseText);
        throw new BusinessError(
          `Gemini API error (${response.status}): ${responseText}`,
          503
        );
      }

      const data = JSON.parse(responseText);
      const assistantMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!assistantMessage) {
        console.error(
          "No text in Gemini response. Full response:",
          JSON.stringify(data, null, 2)
        );
        console.error("Finish reason:", data.candidates?.[0]?.finishReason);
        throw new BusinessError(
          `No response text from AI service. Finish reason: ${data.candidates?.[0]?.finishReason || "unknown"}`,
          500
        );
      }

      console.log("Successfully generated response");

      res.status(200).json({
        success: true,
        message: "Response generated successfully",
        data: {
          response: assistantMessage,
          role: "assistant",
        },
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);

      if (error instanceof BusinessError) {
        throw error;
      }

      throw new BusinessError(
        `AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
        500
      );
    }
  }
}
