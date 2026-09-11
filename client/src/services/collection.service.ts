import { databases, DB_ID, Query } from "@/lib/appwrite/client";
import type {
    Collection,
    CollectionBadge,
    CollectionType
} from "@/types/collection";

const COLLECTIONS_COLLECTION_ID =
    import.meta.env.VITE_APPWRITE_COLLECTIONS_COLLECTION_ID ?? "";

export interface ListCollectionsOptions {
    limit?: number;
    orderDesc?: string;
}

type CollectionDocument = {
    $id: string;
    title?: string;
    slug?: string;
    description?: string;
    longDescription?: string;
    imageUrl?: string;
    badge?: string;
    tags?: unknown;
    type?: string;
    itemCount?: number;
    priceFrom?: string | number;
    curatorName?: string;
    curatorAvatar?: string;
    curatorRating?: number;
    exampleServiceTitle?: string;
    exampleServiceDescription?: string;
    exampleServicePrice?: string;
};

const COLLECTION_BADGES: CollectionBadge[] = [
    "Hot",
    "Trending",
    "Featured",
    "Popular",
    "New"
];

function isCollectionBadge(value: string): value is CollectionBadge {
    return COLLECTION_BADGES.includes(value as CollectionBadge);
}

function isCollectionType(value: string): value is CollectionType {
    return value === "goods" || value === "services";
}

function assertCollectionsConfig() {
    if (!DB_ID || !COLLECTIONS_COLLECTION_ID) {
        throw new Error(
            "Collections are not configured. Set VITE_APPWRITE_DB_ID and VITE_APPWRITE_COLLECTIONS_COLLECTION_ID."
        );
    }
}

export function docToCollection(doc: CollectionDocument): Collection {
    return {
        id: doc.$id,
        title: doc.title ?? "",
        slug: doc.slug ?? doc.$id,
        description: doc.description ?? "",
        longDescription: doc.longDescription ?? undefined,
        imageUrl: doc.imageUrl ?? "",
        badge:
            doc.badge && isCollectionBadge(doc.badge)
                ? doc.badge
                : undefined,
        tags: Array.isArray(doc.tags)
            ? doc.tags.filter(
                  (tag): tag is string => typeof tag === "string"
              )
            : [],
        type: doc.type && isCollectionType(doc.type) ? doc.type : "goods",
        itemCount: doc.itemCount ?? undefined,
        priceFrom:
            typeof doc.priceFrom === "number"
                ? String(doc.priceFrom)
                : doc.priceFrom ?? undefined,
        curator: doc.curatorName
            ? {
                  name: doc.curatorName,
                  avatar: doc.curatorAvatar ?? "",
                  rating: doc.curatorRating ?? undefined
              }
            : undefined,
        exampleService: doc.exampleServiceTitle
            ? {
                  title: doc.exampleServiceTitle,
                  description: doc.exampleServiceDescription ?? "",
                  price: doc.exampleServicePrice ?? ""
              }
            : undefined
    };
}

export async function listCollections({
    limit = 50,
    orderDesc = "$createdAt"
}: ListCollectionsOptions = {}): Promise<Collection[]> {
    assertCollectionsConfig();

    const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS_COLLECTION_ID,
        [Query.orderDesc(orderDesc), Query.limit(limit)]
    );

    return response.documents.map(doc => docToCollection(doc));
}

export async function getCollectionBySlugOrId(
    slugOrId: string
): Promise<Collection | null> {
    assertCollectionsConfig();

    const response = await databases.listDocuments(
        DB_ID,
        COLLECTIONS_COLLECTION_ID,
        [Query.equal("slug", slugOrId), Query.limit(1)]
    );

    if (response.documents.length > 0) {
        return docToCollection(response.documents[0]);
    }

    try {
        const document = await databases.getDocument(
            DB_ID,
            COLLECTIONS_COLLECTION_ID,
            slugOrId
        );
        return docToCollection(document);
    } catch (error: unknown) {
        const code =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            typeof error.code === "number"
                ? error.code
                : undefined;

        if (code === 404) return null;
        throw error;
    }
}

export function getCollectionErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return "Failed to load collections.";
}
