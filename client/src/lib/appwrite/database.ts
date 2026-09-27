import { Permission, Role } from "appwrite";
import type { UserProfile } from "@/types/user";
import {
    account,
    databases,
    DB_ID,
    USERS_COLLECTION_ID,
} from "./client";

type UserProfileDocument = {
    $id: string;
    email?: unknown;
    fullName?: unknown;
    role?: unknown;
    accountStatus?: unknown;
    country?: unknown;
    phoneNumber?: unknown;
    vendorType?: unknown;
    businessCategory?: unknown;
    verificationStatus?: unknown;
    documents?: unknown;
    businessName?: unknown;
    businessDescription?: unknown;
    logo?: unknown;
    coverImage?: unknown;
    slogan?: unknown;
    storeStatus?: unknown;
    currency?: unknown;
    featuresEnabled?: unknown;
    dashboardLayout?: unknown;
    subscriptionPlan?: unknown;
    vendorStatus?: unknown;
    onboardingStep?: unknown;
    socialLinks?: unknown;
    primaryColor?: unknown;
};

function toNullableString(value: unknown): string | null {
    return typeof value === "string" ? value : value == null ? null : String(value);
}

function toStringArray(value: unknown): string[] | undefined {
    return Array.isArray(value) && value.every(item => typeof item === "string")
        ? value
        : undefined;
}

function toDashboardLayout(
    value: unknown
): Record<string, unknown> | null | undefined {
    if (value === null) return null;
    if (typeof value !== "object" || Array.isArray(value)) return undefined;
    return value as Record<string, unknown>;
}

function toOnboardingStep(value: unknown): number | null | undefined {
    if (value === null) return null;
    return typeof value === "number" ? value : undefined;
}

function docToUserProfile(doc: UserProfileDocument): UserProfile {
    return {
        email: toNullableString(doc.email),
        fullName: toNullableString(doc.fullName),
        role: toNullableString(doc.role),
        accountStatus: toNullableString(doc.accountStatus),
        country: toNullableString(doc.country),
        phoneNumber: toNullableString(doc.phoneNumber),
        vendorType: toNullableString(doc.vendorType),
        businessCategory: toNullableString(doc.businessCategory),
        verificationStatus: toNullableString(doc.verificationStatus),
        documents: toStringArray(doc.documents),
        businessName: toNullableString(doc.businessName),
        businessDescription: toNullableString(doc.businessDescription),
        logo: toNullableString(doc.logo),
        coverImage: toNullableString(doc.coverImage),
        slogan: toNullableString(doc.slogan),
        storeStatus: toNullableString(doc.storeStatus),
        currency: toNullableString(doc.currency),
        featuresEnabled: toStringArray(doc.featuresEnabled),
        dashboardLayout: toDashboardLayout(doc.dashboardLayout),
        subscriptionPlan: toNullableString(doc.subscriptionPlan),
        vendorStatus: toNullableString(doc.vendorStatus),
        onboardingStep: toOnboardingStep(doc.onboardingStep),
        socialLinks:
            typeof doc.socialLinks === "string"
                ? doc.socialLinks
                : doc.socialLinks && typeof doc.socialLinks === "object" && !Array.isArray(doc.socialLinks)
                    ? Object.fromEntries(
                          Object.entries(doc.socialLinks).filter(
                              ([, value]) => typeof value === "string"
                          )
                      )
                    : null,
        primaryColor: toNullableString(doc.primaryColor),
    };
}

export async function createUserProfile(
    userId: string,
    email: string,
    name: string
): Promise<UserProfile | null> {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured, skipping profile creation");
        return null;
    }

    try {
        const document = await databases.createDocument(
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
                            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        );

        return docToUserProfile(document as unknown as UserProfileDocument);
    } catch (error: unknown) {
        console.error("Profile creation failed:", error);
        throw error;
    }
}

export async function getUserProfile(
    userId: string
): Promise<UserProfile | null> {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured");
        return null;
    }

    try {
        const document = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION_ID,
            userId
        );

        return docToUserProfile(document as unknown as UserProfileDocument);
    } catch (error: unknown) {
        const code =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            typeof error.code === "number"
                ? error.code
                : undefined;

        if (code === 404) {
            try {
                const currentAccount = await account.get();
                return await createUserProfile(
                    currentAccount.$id,
                    currentAccount.email,
                    currentAccount.name
                );
            } catch {
                // Preserve the original profile lookup error if recovery fails.
            }
        }
        throw error;
    }
}

export async function updateUserProfile(
    userId: string,
    data: Partial<UserProfile>
) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        throw new Error("Database not configured");
    }

    const currentAccount = await account.get();
    if (currentAccount.$id !== userId) {
        throw new Error("You can only update your own profile.");
    }

    return await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION_ID,
        userId,
        data
    );
}
