import { ID, Permission, Query, Role } from "appwrite";
import { databases, DB_ID, functions } from "@/lib/appwrite/client";
import { getCurrentAccount } from "@/lib/appwrite/account";
import { getUserProfile } from "@/lib/appwrite/database";

export type FeedbackType = "feedback" | "complaint";
export type FeedbackStatus = "open" | "in-review" | "resolved";
export type FeedbackSubmitterRole = "user" | "vendor";

export interface Feedback {
    $id: string;
    $createdAt: string;
    userId: string;
    userName: string;
    userEmail: string;
    submitterRole: FeedbackSubmitterRole;
    submitterId: string;
    type: FeedbackType;
    subject: string;
    message: string;
    orderId: string | null;
    bookingId: string | null;
    status: FeedbackStatus;
    adminNote: string | null;
    resolvedAt: string | null;
}

export interface CreateFeedbackInput {
    type: FeedbackType;
    subject: string;
    message: string;
    orderId?: string | null;
    bookingId?: string | null;
}

const TABLE = "feedback";
const FN = "public-seller-profile";

async function getSubmitter() {
    const account = await getCurrentAccount();
    if (!account?.$id) throw new Error("You must be signed in.");

    const profile = await getUserProfile(account.$id);
    if (!profile || !["customer", "seller"].includes(profile.role)) {
        throw new Error("Only customer and vendor accounts can submit feedback.");
    }

    return {
        account,
        submitterRole: profile.role === "seller" ? "vendor" as const : "user" as const,
    };
}

const status = (value: unknown): FeedbackStatus =>
    value === "in-review" || value === "resolved" ? value : "open";

const map = (document: Record<string, unknown>): Feedback => ({
    $id: String(document.$id ?? ""),
    $createdAt: String(document.$createdAt ?? ""),
    userId: String(document.userId ?? document.submitterId ?? ""),
    userName: String(document.userName ?? ""),
    userEmail: String(document.userEmail ?? ""),
    submitterRole: document.submitterRole === "vendor" ? "vendor" : "user",
    submitterId: String(document.submitterId ?? document.userId ?? ""),
    type: document.type === "complaint" ? "complaint" : "feedback",
    subject: String(document.subject ?? ""),
    message: String(document.message ?? ""),
    orderId: typeof document.orderId === "string" && document.orderId ? document.orderId : null,
    bookingId: typeof document.bookingId === "string" && document.bookingId ? document.bookingId : null,
    status: status(document.status),
    adminNote: typeof document.adminNote === "string" && document.adminNote ? document.adminNote : null,
    resolvedAt: typeof document.resolvedAt === "string" && document.resolvedAt ? document.resolvedAt : null,
});

export async function createFeedback(input: CreateFeedbackInput) {
    const { account, submitterRole } = await getSubmitter();
    const subject = input.subject.trim();
    const message = input.message.trim();

    if (!subject || subject.length > 180) throw new Error("Subject is required and must be 180 characters or fewer.");
    if (!message || message.length > 5000) throw new Error("Message is required and must be 5,000 characters or fewer.");

    const document = await databases.createDocument(
        DB_ID,
        TABLE,
        ID.unique(),
        {
            userId: account.$id,
            submitterId: account.$id,
            submitterRole,
            userName: account.name ?? "",
            userEmail: account.email ?? "",
            type: input.type,
            subject,
            message,
            orderId: input.orderId?.trim() || null,
            bookingId: input.bookingId?.trim() || null,
            status: "open",
            adminNote: null,
            resolvedAt: null,
        },
        [Permission.read(Role.user(account.$id))]
    );

    return map(document as unknown as Record<string, unknown>);
}

export async function listMyFeedback() {
    const { account } = await getSubmitter();
    const result = await databases.listDocuments(DB_ID, TABLE, [
        Query.equal("userId", account.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
    ]);
    return result.documents.map((document) => map(document as unknown as Record<string, unknown>));
}

async function admin(operation: string, payload: Record<string, unknown> = {}) {
    const execution = await functions.createExecution(FN, JSON.stringify({ operation, ...payload }));
    if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
        throw new Error("Could not process the feedback request.");
    }
    const body = JSON.parse(execution.responseBody || "{}");
    if (!body.ok) throw new Error(body.error || "Could not process the feedback request.");
    return body;
}

export async function listAllFeedback() {
    const body = await admin("listFeedback");
    return Array.isArray(body.feedback)
        ? body.feedback.map((item: Record<string, unknown>) => map(item))
        : [];
}

export async function updateFeedbackStatus(id: string, nextStatus: FeedbackStatus, note?: string) {
    const body = await admin("updateFeedbackStatus", {
        feedbackId: id,
        status: nextStatus,
        adminNote: note?.trim() || null,
    });
    return map(body.feedback as Record<string, unknown>);
}
