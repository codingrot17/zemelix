import { Permission, Role } from "appwrite";
import {
    databases,
    DB_ID,
    USERS_COLLECTION_ID,
} from "./client";
import { getCurrentAccount } from "./account";

export async function createUserProfile(
    userId: string,
    email: string,
    name: string
) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured, skipping profile creation");
        return null;
    }

    try {
        return await databases.createDocument(
            DB_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                email,
                fullName: name || "",
                role: "customer",
                accountStatus: "active",
                country: "Nigeria",
                phoneNumber: "",
                vendorType: null,
                businessCategory: null,
                verificationStatus: "unverified",
                documents: [],
                businessName: null,
                businessDescription: null,
                logo: null,
                coverImage: null,
                slogan: null,
                storeStatus: "closed",
                currency: "NGN",
                featuresEnabled: [],
                dashboardLayout: null,
                subscriptionPlan: "free",
                vendorStatus: "draft",
                onboardingStep: null,
                socialLinks: null,
                primaryColor: null,
                $createdAt: new Date().toISOString(),
            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        );
    } catch (error: any) {
        console.error("Profile creation failed:", error);
        throw error;
    }
}

export async function getUserProfile(userId: string) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured");
        return null;
    }

    try {
        return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
    } catch (error: any) {
        if (error?.code === 404) {
            const account = await getCurrentAccount();
            if (account) {
                return await createUserProfile(
                    account.$id,
                    account.email,
                    account.name
                );
            }
        }
        throw error;
    }
}

export async function updateUserProfile(
    userId: string,
    data: Record<string, any>
) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        throw new Error("Database not configured");
    }

    return await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION_ID,
        userId,
        data
    );
}
