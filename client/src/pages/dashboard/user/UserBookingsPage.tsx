import { useEffect,useMemo,useState } from "react";
import { RefreshCw,XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listBuyerBookings,updateBookingStatus,type Booking } from "@/services/booking.service";
import { BookingCard } from "@/components/shared/BookingCard";
import { BookingStatusTabs,type BookingView } from "@/components/shared/BookingStatusTabs";

const activeStatuses=["requested","accepted"];
const historyStatuses=["declined","cancelled","completed","no_show","expired"];

export default function UserBookingsPage(){
 const {user}=useAuth();
 const [items,setItems]=useState<Booking[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 const [view,setView]=useState<BookingView>("active");

 async function load(){
  if(!user?.$id)return;
  setLoading(true);setError("");
  try{setItems(await listBuyerBookings(user.$id));}
  catch(e){console.error(e);setError("Unable to load your bookings right now.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[user?.$id]);

 const active=useMemo(()=>items.filter(b=>!b.isArchived&&activeStatuses.includes(b.status)),[items]);
 const history=useMemo(()=>items.filter(b=>!b.isArchived&&historyStatuses.includes(b.status)),[items]);
 const archived=useMemo(()=>items.filter(b=>b.isArchived),[items]);
 const visible=view==="active"?active:view==="history"?history:archived;

 async function cancel(id:string){
  if(!window.confirm("Cancel this booking request?"))return;
  setBusy(id);setError("");
  try{const u=await updateBookingStatus(id,"cancelBooking");setItems(x=>x.map(b=>b.$id===id?u:b));}
  catch(e){console.error(e);setError("Unable to cancel this booking. Please try again.");}
  finally{setBusy(null);}
 }

 return <div className="space-y-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
   <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Track your service requests and provider responses.</p></div>
   <Button variant="outline" onClick={()=>void load()} disabled={loading||busy!==null} className="w-full sm:w-auto"><RefreshCw className={`w-4 h-4 mr-2 ${loading?"animate-spin":""}`}/>Refresh</Button>
  </div>
  {error&&<div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
   <BookingStatusTabs view={view} onChange={setView} counts={{active:active.length,history:history.length,archived:archived.length}}/>
   {loading?<div className="py-16 text-center text-gray-400">Loading bookings…</div>:visible.length===0?
    <div className="p-12 text-center text-gray-500"><p className="font-semibold text-gray-900 dark:text-white">{view==="active"?"No active bookings":view==="history"?"No booking history":"No archived bookings"}</p><p className="text-sm mt-1">{view==="active"?"Your pending and accepted bookings will appear here.":view==="history"?"Declined, cancelled, completed, and no-show bookings will remain here.":"Archived bookings will appear here when available."}</p></div>
    :<div className="divide-y">{visible.map(b=><div key={b.$id} className="p-5"><BookingCard booking={b} actions={b.status==="requested"?<Button size="sm" variant="outline" onClick={()=>void cancel(b.$id)} disabled={busy===b.$id}><XCircle className="w-4 h-4 mr-2"/>Cancel request</Button>:undefined}/></div>)}</div>}
  </div>
 </div>;
}
