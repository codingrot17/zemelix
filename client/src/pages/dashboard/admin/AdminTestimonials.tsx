import { useCallback,useEffect,useMemo,useState } from "react";
import { AlertCircle,CheckCircle,Clock,Loader2,RefreshCw,Star,Video,MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listTestimonialsForAdmin,moderateTestimonial } from "@/services/admin-testimonial.service";
import type { Testimonial,TestimonialStatus } from "@/services/testimonial.service";

type Filter = TestimonialStatus | "all";
export default function AdminTestimonials(){
 const [items,setItems]=useState<Testimonial[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [filter,setFilter]=useState<Filter>("pending");
 const [busyId,setBusyId]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{setItems(await listTestimonialsForAdmin())}catch(e){setError(e instanceof Error?e.message:"Unable to load testimonials.")}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const counts=useMemo(()=>({pending:items.filter(x=>x.status==="pending").length,approved:items.filter(x=>x.status==="approved").length,rejected:items.filter(x=>x.status==="rejected").length}),[items]);
 const filtered=useMemo(()=>filter==="all"?items:items.filter(x=>x.status===filter),[items,filter]);
 async function update(item:Testimonial,status:TestimonialStatus){setBusyId(item.$id);setError("");try{const updated=await moderateTestimonial(item.$id,status);setItems(prev=>prev.map(x=>x.$id===item.$id?updated:x))}catch(e){setError(e instanceof Error?e.message:"Unable to update testimonial.")}finally{setBusyId("")}}
 return <div className="space-y-6">
  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h1 className="text-2xl font-bold sm:text-3xl">Testimonials</h1><p className="mt-1 text-sm text-muted-foreground">Review community experiences before they appear on the public landing page.</p></div><Button variant="outline" onClick={()=>void load()} disabled={loading} className="min-h-11 self-start"><RefreshCw className={`mr-2 h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</Button></div>
  {error&&<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/><span>{error}</span></div>}
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Pending review" value={counts.pending} icon={<Clock/>}/><Stat label="Approved" value={counts.approved} icon={<CheckCircle/>}/><Stat label="Rejected" value={counts.rejected} icon={<AlertCircle/>}/><Stat label="Total submissions" value={items.length} icon={<MessageSquare/>}/></div>
  <div className="flex flex-wrap gap-2" aria-label="Filter testimonials">{(["pending","approved","rejected","all"] as const).map(v=><button key={v} type="button" onClick={()=>setFilter(v)} aria-pressed={filter===v} className={`min-h-10 rounded-full border px-4 py-2 text-sm capitalize transition ${filter===v?"border-primary bg-primary text-primary-foreground":"border-border hover:bg-muted"}`}>{v==="all"?"All":v}</button>)}</div>
  <div className="overflow-hidden rounded-xl border bg-card">
   {loading?<div className="flex min-h-48 items-center justify-center gap-2 p-8 text-sm text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin"/>Loading testimonial submissions…</div>
   :filtered.length===0?<div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><MessageSquare className="mb-3 h-8 w-8 text-muted-foreground"/><h2 className="font-semibold">No {filter==="all"?"":filter+" "}testimonials</h2><p className="mt-1 text-sm text-muted-foreground">{filter==="pending"?"New submissions will appear here for review.":"There are no submissions in this view."}</p></div>
   :<div className="divide-y">{filtered.map(item=><article key={item.$id} className="space-y-4 p-4 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${item.status==="approved"?"bg-green-100 text-green-800":item.status==="rejected"?"bg-red-100 text-red-800":"bg-amber-100 text-amber-800"}`}>{item.status||"pending"}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground">{item.type==="video"?<Video className="h-3.5 w-3.5"/>:<MessageSquare className="h-3.5 w-3.5"/>}{item.type==="video"?"Video testimonial":"Text testimonial"}</span></div><h2 className="mt-3 break-words text-lg font-semibold">{item.name}</h2><p className="mt-1 text-xs text-muted-foreground">{item.$createdAt?new Date(item.$createdAt).toLocaleString():"Date unavailable"} · ID: {item.$id}</p></div><div className="flex items-center gap-1" aria-label={`${item.rating} out of 5 stars`}>{[1,2,3,4,5].map(n=><Star key={n} className={`h-4 w-4 ${n<=item.rating?"fill-yellow-400 text-yellow-400":"text-muted-foreground/30"}`}/>)}</div></div><p className="whitespace-pre-wrap break-words text-sm leading-6">“{item.quote}”</p>{item.type==="video"&&item.videoUrl&&<a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 break-all text-sm font-medium text-primary underline"><Video className="h-4 w-4 shrink-0"/>Open submitted video link</a>}
   <div className="flex flex-wrap gap-2 border-t pt-4">{item.status!=="approved"&&<Button disabled={busyId===item.$id} onClick={()=>void update(item,"approved")} className="min-h-11">{busyId===item.$id?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<CheckCircle className="mr-2 h-4 w-4"/>}Approve & publish</Button>}{item.status!=="rejected"&&<Button variant="outline" disabled={busyId===item.$id} onClick={()=>void update(item,"rejected")} className="min-h-11">Reject</Button>}{item.status!=="pending"&&<Button variant="ghost" disabled={busyId===item.$id} onClick={()=>void update(item,"pending")} className="min-h-11">Return to pending</Button>}</div>
   </article>)}</div>}
  </div>
 </div>
}
function Stat({label,value,icon}:{label:string;value:number;icon:React.ReactNode}){return <div className="rounded-xl border bg-card p-4 sm:p-5"><div className="mb-3 text-primary">{icon}</div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>}
