/**
 * Backward-compatible Appwrite facade.
 * New code should import from the focused modules under ./appwrite/.
 */

export {
    account,
    databases,
    storage,
    ID,
    Query,
    DB_ID,
    USERS_COLLECTION_ID,
    STORAGE_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
} from "./appwrite/client";

export {
    getCurrentSession,
    validateSession,
    createSession,
    deleteSession,
    refreshSession,
    getCurrentAccount,
    registerUser,
    sendVerificationEmail,
    verifyEmail,
    startSessionMonitor,
} from "./appwrite/account";

export {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
} from "./appwrite/database";

export {
    uploadFile,
    getFilePreviewUrl,
    deleteFile,
} from "./appwrite/storage";
