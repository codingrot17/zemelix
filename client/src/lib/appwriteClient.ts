// ─────────────────────────────────────────────────────────────────────────────
// This file exists purely as a compatibility shim.
// The canonical Appwrite setup lives in ./appwrite.ts
// Any file that imports from "@/lib/appwriteClient" will get the same
// instances — no duplicate clients, no duplicate connections.
// ─────────────────────────────────────────────────────────────────────────────
export {
    account,
    databases,
    storage,
    ID,
    DB_ID,
    USERS_COLLECTION_ID,
    STORAGE_BUCKET_ID,
    getCurrentAccount,
    getUserProfile,
    createSession,
    deleteSession,
    registerUser,
    sendVerificationEmail,
    verifyEmail,
    validateSession,
    startSessionMonitor,
    uploadFile,
    getFilePreviewUrl,
    deleteFile
} from "@/lib/appwrite";
