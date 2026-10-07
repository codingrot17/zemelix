import { useEffect,useMemo,useState } from "react";
import { Archive,ArchiveRestore,Check,CheckCircle,RefreshCw,X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listProviderBookings,setBookingArchived,updateBookingStatus,type Booking } from "@/services/booking.service";
import { BookingCard } from "@/components/shared/BookingCard";
import { BookingStatusTabs,type BookingView } from "@/components/shared/BookingStatusTabs";

const activeStatuses = ["requested","accepted"];
const historyStatuses = ["declined","cancelled","completed","no_show","expired"];

export default function SellerBookings(){
 const {user}=useAuth();
 const [items,setItems]=useState<Booking[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 const [view,setView]=useState<BookingView>("active");

 async function load(){
  if(!user?.$id)return;
  setLoading(true);setError("");
  try{setItems(await listProviderBookings(user.$id));}
  catch(e){console.error(e);setError("Unable to load bookings right now.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[user?.$id]);

 const active=useMemo(()=>items.filter(b=>!b.isArchived&&activeStatuses.includes(b.status)),[items]);
 const history=useMemo(()=>items.filter(b=>!b.isArchived&&historyStatuses.includes(b.status)),[items]);
 const archived=useMemo(()=>items.filter(b=>b.isArchived),[items]);
 const visible=view==="active"?active:view==="history"?history:archived;

 async function mutate(id:string,a:"acceptBooking"|"declineBooking"|"completeBooking"|"noShowBooking"){
  setBusy(id);setError("");
  try{const u=await updateBookingStatus(id,a);setItems(x=>x.map(b=>b.$id===id?u:b));}
  catch(e){console.error(e);setError("Unable to update this booking. Please try again.");}
  finally{setBusy(null);}
 }
 async function archive(id:string,v:boolean){
  setBusy(id);setError("");
  try{const u=await setBookingArchived(id,v);setItems(x=>x.map(b=>b.$id===id?u:b));}
  catch(e){console.error(e);setError("Unable to update this booking. Please try again.");}
  finally{setBusy(null);}
 }

 return <div className="space-y-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
   <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bookings</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage service requests from customers.</p></div>
   <Button variant="outline" onClick={()=>void load()} disabled={loading||busy!==null} className="w-full sm:w-auto"><RefreshCw className={`w-4 h-4 mr-2 ${loading?"animate-spin":""}`}/>Refresh</Button>
  </div>
  {error&&<div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
   <BookingStatusTabs view={view} onChange={setView} counts={{active:active.length,history:history.length,archived:archived.length}}/>
   {loading?<div className="py-16 text-center text-gray-400">Loading bookings…</div>:visible.length===0?
    <div className="p-12 text-center text-gray-500"><p className="font-semibold text-gray-900 dark:text-white">{view==="active"?"No active bookings":view==="history"?"No booking history":"No archived bookings"}</p><p className="text-sm mt-1">{view==="active"?"New booking requests will appear here.":view==="history"?"Completed, declined, cancelled, and no-show bookings will remain here.":"Archived bookings remain here until you restore them."}</p></div>
    :<div className="divide-y">{visible.map(b=><div key={b.$id} className="p-5"><BookingCard booking={b} provider actions={<>
      {b.status==="requested"&&<><Button size="sm" onClick={()=>void mutate(b.$id,"acceptBooking")} disabled={busy===b.$id}><Check className="w-4 h-4 mr-2"/>Accept</Button><Button size="sm" variant="outline" onClick={()=>void mutate(b.$id,"declineBooking")} disabled={busy===b.$id}><X className="w-4 h-4 mr-2"/>Decline</Button></>}
      {b.status==="accepted"&&<><Button size="sm" onClick={()=>void mutate(b.$id,"completeBooking")} disabled={busy===b.$id}><CheckCircle className="w-4 h-4 mr-2"/>Completed</Button><Button size="sm" variant="outline" onClick={()=>void mutate(b.$id,"noShowBooking")} disabled={busy===b.$id}>No-show</Button></>}
      <Button size="sm" variant="ghost" onClick={()=>void archive(b.$id,!b.isArchived)} disabled={busy===b.$id}>{b.isArchived?<><ArchiveRestore className="w-4 h-4 mr-2"/>Restore</>:<><Archive className="w-4 h-4 mr-2"/>Archive</>}</Button>
    </>}/></div>)}</div>}
  </div>
 </div>;
}
