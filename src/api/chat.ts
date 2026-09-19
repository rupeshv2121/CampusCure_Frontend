import { api } from "./auth";

export interface ChatReply {
  reply: string;
  /** Tools the assistant actually used, so the UI can show its working. */
  toolsUsed: string[];
  degraded: boolean;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * CC-15: ask the assistant.
 *
 * No user identity is sent — the backend derives it from the token, and its
 * tools are bound to that user. There is deliberately no way for this client to
 * ask about anyone else.
 *
 * Never throws: chat is allowed to fail, and a broken assistant must not
 * produce an error boundary in the middle of the app.
 */
export const askAssistant = async (
  message: string,
  history: ChatTurn[],
  signal?: AbortSignal,
): Promise<ChatReply> => {
  try {
    const response = await api.post(
      "/chat",
      { message, history },
      signal ? { signal } : undefined,
    );
    return response.data;
  } catch {
    return {
      reply: "The assistant is unavailable right now. Please try again later.",
      toolsUsed: [],
      degraded: true,
    };
  }
};
