import { functions } from "@/lib/appwrite/client";

export type SupportStatus = "open" | "in-progress" | "closed";
export type SupportRole = "customer" | "vendor" | "admin";

export interface SupportConversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  ownerId: string;
  ownerRole: "customer" | "vendor";
  ownerName: string;
  ownerEmail: string;
  subject: string;
  category?: string;
  priority?: "normal" | "urgent";
  status: SupportStatus;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  closedAt?: string | null;
}

export interface SupportMessage {
  $id: string;
  $createdAt: string;
  conversationId: string;
  senderId: string;
  senderRole: SupportRole;
  message: string;
  messageType?: string;
  isRead?: boolean;
}

async function execute<T>(operation: string, payload: Record<string, unknown> = {}): Promise<T> {
  const execution = await functions.createExecution(
    "public-seller-profile",
    JSON.stringify({ operation, ...payload })
  );
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(execution.responseBody || "{}"); } catch { /* handled below */ }
  if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300 || body.ok !== true) {
    throw new Error(typeof body.error === "string" ? body.error : "Support is temporarily unavailable. Please try again.");
  }
  return body as T;
}

export async function createSupportConversation(subject: string, message: string, category = "general", priority: "normal" | "urgent" = "normal") {
  return execute<{conversation: SupportConversation; messages: SupportMessage[]}>("createSupportConversation", { subject, message, category, priority });
}
export async function listMySupportConversations() {
  const result = await execute<{conversations: SupportConversation[]}>("listMySupportConversations");
  return result.conversations ?? [];
}
export async function listSupportConversations(status?: SupportStatus | "all") {
  const result = await execute<{conversations: SupportConversation[]}>("listSupportConversations", { status });
  return result.conversations ?? [];
}
export async function listSupportMessages(conversationId: string) {
  const result = await execute<{conversation: SupportConversation; messages: SupportMessage[]}>("listSupportMessages", { conversationId });
  return result;
}
export async function sendSupportMessage(conversationId: string, message: string) {
  return execute<{message: SupportMessage; conversation: SupportConversation}>("sendSupportMessage", { conversationId, message });
}
export async function updateSupportConversation(conversationId: string, status: SupportStatus) {
  return execute<{conversation: SupportConversation}>("updateSupportConversation", { conversationId, status });
}
