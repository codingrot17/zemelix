import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

// ✅ Register user with Appwrite Auth + Database Profile
export async function registerUser({
  email,
  password,
  fullName,
  role = "customer",
  country = "Nigeria"
}: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  country?: string;
}) {
  try {
    // 1️⃣ Create Appwrite Account
    const userAccount = await account.create(ID.unique(), email, password, fullName);

    // 2️⃣ Login session for immediate authentication
    await account.createEmailPasswordSession(email, password);

    // 3️⃣ Create database user profile in Appwrite Collection
    await databases.createDocument(DB_ID, USERS_COLLECTION_ID, userAccount.$id, {
      email,                      // required string
      fullName,                  // required string
      role,                      // enum: customer | vendor | admin
      country,                   // region-based UI/logic
      accountStatus: "active",   // enum: active | suspended | banned
      verificationStatus: "unverified", // enum
      phoneNumber: "",           // optional default
      vendorType: null,          // optional until vendor setup
      businessName: "",
      businessDescription: "",
      businessCategory: null,     // used to shape dashboard UI later
      logo: "",
      coverImage: "",
      documents: [],              // vendor uploaded docs (array)
      featuresEnabled: [],        // for future modular feature toggles
      subscriptionPlan: "free",
      storeStatus: "closed",    // vendor store not active by default
      currency: "NGN",
      $createdAt: new Date().toISOString() // ✅ datetime format
    });

    return userAccount;
  } catch (error: any) {
    console.error("Appwrite Registration Error:", error?.message || error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
}

export async function logoutUser() {
  await account.deleteSessions();
}
