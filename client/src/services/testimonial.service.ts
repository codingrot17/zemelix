import { functions } from "@/lib/appwrite/client";

export type TestimonialType = "text" | "video";
export interface Testimonial { $id: string; $createdAt: string; name: string; quote: string; type: TestimonialType; videoUrl: string | null; rating: number; }
export interface SubmitTestimonialInput { name: string; quote: string; type: TestimonialType; videoUrl?: string; rating: number; }

async function execute(operation: string, payload: Record<string, unknown> = {}) {
  const result = await functions.createExecution("public-seller-profile", JSON.stringify({ operation, ...payload }));
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(result.responseBody || "{}"); } catch { throw new Error("Unexpected server response. Please try again."); }
  if (result.responseStatusCode < 200 || result.responseStatusCode >= 300 || body.ok !== true) {
    throw new Error(typeof body.error === "string" ? body.error : "Request failed. Please try again.");
  }
  return body;
}
export async function listApprovedTestimonials(): Promise<Testimonial[]> {
  const body = await execute("listApprovedTestimonials");
  if (!Array.isArray(body.testimonials)) throw new Error("Unexpected testimonials response.");
  return body.testimonials as Testimonial[];
}
export async function submitTestimonial(input: SubmitTestimonialInput): Promise<void> {
  await execute("submitTestimonial", input as unknown as Record<string, unknown>);
}
