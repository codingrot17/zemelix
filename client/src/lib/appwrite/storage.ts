import { ID } from "appwrite";
import {
    storage,
    STORAGE_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
} from "./client";

export async function uploadFile(file: File): Promise<string> {
    if (!file) throw new Error("No file provided");

    const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
    );
    return response.$id;
}

export function getFilePreviewUrl(
    fileId: string,
    width = 400,
    height = 400
): string {
    if (!fileId) return "";

    const endpoint = APPWRITE_ENDPOINT.replace(/\/v1\/?$/, "");
    return `${endpoint}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}&width=${width}&height=${height}`;
}

export async function deleteFile(fileId: string) {
    return await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
}
