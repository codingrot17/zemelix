import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

const ENDPOINT =
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!PROJECT_ID) {
    throw new Error("VITE_APPWRITE_PROJECT_ID is required");
}

export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;
export const STORAGE_BUCKET_ID =
    import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default";
export const APPWRITE_ENDPOINT = ENDPOINT;
export const APPWRITE_PROJECT_ID = PROJECT_ID;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };
