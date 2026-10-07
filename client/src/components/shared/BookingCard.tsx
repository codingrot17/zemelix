import { CalendarClock, CheckCircle, UserCircle } from "lucide-react";
import type { Booking } from "@/services/booking.service";

const statusStyles: Record<string,string> = {
 requested:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
 accepted:"bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
 declined:"bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
 cancelled:"bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
 completed:"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
 no_show:"bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
 expired:"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
};
export function BookingCard({booking,provider,actions}:{booking:Booking;provider?:boolean;actions?:React.ReactNode}) {
 const label=booking.status==="no_show"?"No-show":booking.status.replace("_"," ");
 return <div className="p-5 space-y-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
   <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-2">
     <h2 className="font-semibold text-gray-900 dark:text-white truncate">{booking.serviceTitleSnapshot}</h2>
     <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[booking.status] ?? statusStyles.cancelled}`}>{label}</span>
    </div>
    {provider ? <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1"><UserCircle className="w-4 h-4"/> {booking.customerName} · {booking.customerPhone}</p> : null}
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><CalendarClock className="w-4 h-4"/> {new Date(booking.requestedDateTime).toLocaleString()}</p>
   </div>
   <p className="text-lg font-semibold text-gray-900 dark:text-white">₦{booking.priceSnapshot.toLocaleString()}</p>
  </div>
  {booking.serviceMode && <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Mode:</span> {booking.serviceMode}{booking.serviceLocation ? ` · ${booking.serviceLocation}` : ""}</p>}
  {booking.notes && <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3 text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Notes:</span> {booking.notes}</div>}
  {booking.status==="accepted" && !provider && <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Provider accepted your request.</p>}
  {actions && <div className="flex flex-col sm:flex-row sm:justify-end gap-2">{actions}</div>}
 </div>;
}
