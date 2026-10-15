import { useCallback, useEffect, useState } from "react";
import { MessageSquareReply, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listReviewsForVendor, replyToReview, type Review } from "@/services/review.service";

export default function VendorReviewsPanel() {
 const [items,setItems]=useState<Review[]>([]);
 const [drafts,setDrafts]=useState<Record<string,string>>({});
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{setItems(await listReviewsForVendor())}catch(e){setError(e instanceof Error?e.message:"Unable to load reviews.")}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 async function submit(item:Review){const value=(drafts[item.$id]??"").trim();if(!value){setError("Write a reply before submitting.");return;}setBusy(item.$id);setError("");setNotice("");try{const updated=await replyToReview(item.$id,value);setItems(old=>old.map(x=>x.$id===item.$id?updated:x));setDrafts(old=>({...old,[item.$id]:""}));setNotice("Reply posted.");}catch(e){setError(e instanceof Error?e.message:"Unable to post reply.")}finally{setBusy(null)}}
 return <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Customer reviews</h2><p className="mt-1 text-sm text-muted-foreground">Reviews from confirmed purchases and completed bookings.</p></div><Button variant="outline" size="sm" onClick={()=>void load()} disabled={loading} className="min-h-10"><RefreshCw className={`mr-2 h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</Button></div>
 {error&&<p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
 {loading?<p className="py-6 text-center text-sm text-muted-foreground">Loading reviews…</p>:items.length===0?<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No customer reviews yet.</p>:<div className="space-y-4">{items.map(item=><article key={item.$id} className="space-y-3 rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs capitalize text-muted-foreground">{item.listingType} · {item.status}</span><span className="flex items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>{item.rating}/5</span></div><p className="text-sm">{item.reviewText||"Star rating only."}</p>{item.vendorReply?<div className="rounded-md bg-muted p-3"><p className="text-xs font-semibold">Your reply</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.vendorReply}</p></div>:item.status==="published"?<div className="space-y-2"><textarea value={drafts[item.$id]??""} onChange={e=>setDrafts(old=>({...old,[item.$id]:e.target.value}))} maxLength={2000} rows={2} placeholder="Write a public response…" className="w-full rounded-md border bg-background px-3 py-2 text-sm"/><Button size="sm" className="min-h-10" disabled={busy===item.$id||!(drafts[item.$id]??"").trim()} onClick={()=>void submit(item)}><MessageSquareReply className="mr-2 h-4 w-4"/>{busy===item.$id?"Posting…":"Reply to review"}</Button></div>:<p className="text-xs text-muted-foreground">Replies are available for published reviews.</p>}</article>)}</div>}
 </section>;
}
