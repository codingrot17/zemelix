import { Button } from "@/components/ui/button";

export type BookingView = "active" | "history" | "archived";

export function BookingStatusTabs({view,onChange,counts}:{view:BookingView;onChange:(view:BookingView)=>void;counts:Record<BookingView,number>}) {
 return <div className="flex flex-wrap items-center gap-2 border-b p-3">
  {(["active","history","archived"] as BookingView[]).map(key=>
   <Button key={key} variant={view===key?"default":"ghost"} size="sm" onClick={()=>onChange(key)}>
    {key[0].toUpperCase()+key.slice(1)} ({counts[key]})
   </Button>
  )}
 </div>;
}
