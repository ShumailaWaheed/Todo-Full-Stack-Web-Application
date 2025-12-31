// frontend/lib/chat/chatApi.ts
/**
 * Chat API client for AI chatbot backend communication.
 */

// Chat API uses a separate backend URL (Phase III backend)
const CHAT_API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  conversation_id?: number;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: Array<{
    tool: string;
    parameters: Record<string, unknown>;
    result: Record<string, unknown>;
  }>;
}

/**
 * Chat API client class.
 */
export class ChatApiClient {
  private userId: number;
  private authToken: string;

  constructor(userId: number, authToken: string) {
    this.userId = userId;
    this.authToken = authToken;
  }

  /**
   * Build the chat API URL for this user.
   */
  private buildUrl(): string {
    return `${CHAT_API_BASE_URL}/api/${this.userId}/chat`;
  }

  /**
   * Send a chat message to the backend.
   */
  async sendMessage(message: string, conversationId?: number): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      conversation_id: conversationId,
    };

    const response = await fetch(this.buildUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const status = response.status;
      let detail = response.statusText;

      try {
        const errorData = await response.json();
        detail = errorData.detail || errorData.message || detail;
      } catch {
        // Ignore JSON parse errors
      }

      if (status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (status === 403) {
        throw new Error("You don't have permission to access this conversation.");
      } else if (status === 404) {
        throw new Error('Conversation not found.');
      } else {
        throw new Error(`Chat API error: ${detail}`);
      }
    }

    return response.json();
  }

  /**
   * Update authentication token.
   */
  updateAuthToken(newToken: string): void {
    this.authToken = newToken;
  }
}

/**
 * Create a chat API client instance.
 */
export function createChatApiClient(userId: number, authToken: string): ChatApiClient {
  return new ChatApiClient(userId, authToken);
}
