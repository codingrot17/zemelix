import { Client, Account, Databases, ID } from "appwrite";

// ✅ Initialize Appwrite Client
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!) 
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID!); 
    
// ✅ Export Appwrite services used
export const account = new Account(client);
export const databases = new Databases(client);
export { ID };
export default client;
