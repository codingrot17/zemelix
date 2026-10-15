import { functions } from "@/lib/appwrite/client";

export type ReviewListingType = "product" | "service";
export type ReviewStatus = "published" | "hidden" | "removed";

export interface Review {
  $id: string;
  $createdAt: string;
  listingId: string;
  listingType: ReviewListingType;
  vendorId: string;
  reviewerId: string;
  orderId?: string | null;
  bookingId?: string | null;
  rating: number;
  reviewText: string | null;
  status: ReviewStatus;
  vendorReply: string | null;
  vendorReplyAt: string | null;
  editedAt: string | null;
}

async function execute(operation: string, payload: Record<string, unknown> = {}) {
  const result = await functions.createExecution(
    "public-seller-profile",
    JSON.stringify({ operation, ...payload })
  );
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(result.responseBody || "{}");
  } catch {
    throw new Error("Unexpected server response. Please try again.");
  }
  if (result.responseStatusCode < 200 || result.responseStatusCode >= 300 || body.ok !== true) {
    throw new Error(typeof body.error === "string" ? body.error : "Review request failed.");
  }
  return body;
}

export async function listReviewsForListing(listingId: string): Promise<Review[]> {
  const body = await execute("listReviewsForListing", { listingId });
  if (!Array.isArray(body.reviews)) throw new Error("Unexpected reviews response.");
  return body.reviews as Review[];
}

export async function submitReview(input: {
  listingId: string;
  listingType: ReviewListingType;
  rating: number;
  reviewText?: string;
  orderId?: string;
  bookingId?: string;
}): Promise<Review> {
  const body = await execute("submitReview", input);
  if (!body.review || typeof body.review !== "object") throw new Error("Unexpected review response.");
  return body.review as Review;
}

export async function replyToReview(reviewId: string, vendorReply: string): Promise<Review> {
  const body = await execute("replyToReview", { reviewId, vendorReply });
  if (!body.review || typeof body.review !== "object") throw new Error("Unexpected review response.");
  return body.review as Review;
}

export async function listReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
  const body = await execute("listReviewsForAdmin", status ? { status } : {});
  if (!Array.isArray(body.reviews)) throw new Error("Unexpected reviews response.");
  return body.reviews as Review[];
}

export async function moderateReview(reviewId: string, status: ReviewStatus): Promise<Review> {
  const body = await execute("moderateReview", { reviewId, status });
  if (!body.review || typeof body.review !== "object") throw new Error("Unexpected review response.");
  return body.review as Review;
}

export async function listReviewsForVendor(): Promise<Review[]> {
  const body = await execute("listReviewsForVendor");
  if (!Array.isArray(body.reviews)) throw new Error("Unexpected reviews response.");
  return body.reviews as Review[];
}

export async function listPublishedReviewsForVendor(vendorId: string): Promise<Review[]> {
  const body = await execute("listPublishedReviewsForVendor", { vendorId });
  if (!Array.isArray(body.reviews)) throw new Error("Unexpected reviews response.");
  return body.reviews as Review[];
}

export async function editReview(reviewId: string, rating: number, reviewText: string): Promise<Review> {
  const body = await execute("editReview", { reviewId, rating, reviewText });
  if (!body.review || typeof body.review !== "object") throw new Error("Unexpected review response.");
  return body.review as Review;
}

export async function getMyReview(input: { listingId: string; listingType: ReviewListingType; orderId?: string; bookingId?: string }): Promise<Review | null> {
  const body = await execute("getMyReview", input);
  if (body.review === null) return null;
  if (!body.review || typeof body.review !== "object") throw new Error("Unexpected review response.");
  return body.review as Review;
}
