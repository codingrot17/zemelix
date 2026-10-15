import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReview, type ReviewListingType } from "@/services/review.service";

export default function ReviewForm({ listingId, listingType, orderId, bookingId }: { listingId: string; listingType: ReviewListingType; orderId?: string; bookingId?: string }) {
 const [rating,setRating]=useState(0); const [reviewText,setReviewText]=useState(""); const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const [done,setDone]=useState(false);
 async function save(){ if(!rating){setError("Choose a star rating first.");return;} setSaving(true);setError("");try{await submitReview({listingId,listingType,rating,reviewText:reviewText.trim(),orderId,bookingId});setDone(true);}catch(e){setError(e instanceof Error?e.message:"Unable to submit review.");}finally{setSaving(false);} }
 if(done)return <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Thanks — your review was submitted.</p>;
 return <div className="mt-3 space-y-3 rounded-lg border p-3"><p className="text-sm font-semibold">Rate this {listingType}</p><div className="flex gap-1">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={n+" stars"} aria-pressed={rating===n} onClick={()=>setRating(n)}><Star className={`h-6 w-6 ${n<=rating?"fill-yellow-400 text-yellow-400":"text-gray-300"}`}/></button>)}</div><textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} maxLength={3000} rows={3} placeholder="Share your experience (optional)" className="w-full rounded-md border bg-background px-3 py-2 text-sm"/>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<Button size="sm" onClick={()=>void save()} disabled={saving||rating===0}>{saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:null}Submit review</Button></div>;
}
