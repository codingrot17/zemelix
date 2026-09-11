import {
    verifyEmail as verifyAppwriteEmail
} from "@/lib/appwrite";

export async function verifyEmail(userId: string, secret: string) {
    return verifyAppwriteEmail(userId, secret);
}
