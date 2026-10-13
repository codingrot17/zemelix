import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Video, MessageCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  type: "text" | "video";
  name: string;
  quote: string;
  videoUrl?: string;
  rating: number;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <div className="flex items-center gap-1">{[1,2,3,4,5].map(star => (
    <button key={star} type="button" className={cn("p-1 transition", value >= star ? "text-yellow-400" : "text-gray-300")} onClick={() => onChange(star)} aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
      <Star className="h-6 w-6" fill={value >= star ? "#facc15" : "none"} />
    </button>
  ))}</div>;
}

function AddTestimonyModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (v: boolean) => void; onAdd: (t: Testimonial) => void }) {
  const [type, setType] = useState<"text" | "video">("text");
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rating, setRating] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedQuote = quote.trim();
    if (!trimmedName || !trimmedQuote) return;
    if (type === "video") {
      try {
        const url = new URL(videoUrl);
        if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be", "vimeo.com", "www.vimeo.com"].includes(url.hostname)) return;
      } catch { return; }
    }
    onAdd({ type, name: trimmedName, quote: trimmedQuote, videoUrl: videoUrl.trim() || undefined, rating });
    setName(""); setQuote(""); setVideoUrl(""); setRating(5); setType("text");
    onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Share Your Experience</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 mb-2">
          <Button type="button" variant={type === "text" ? "default" : "outline"} onClick={() => setType("text")} className="flex-1"><MessageCircle className="mr-1 h-4 w-4"/>Text</Button>
          <Button type="button" variant={type === "video" ? "default" : "outline"} onClick={() => setType("video")} className="flex-1"><Video className="mr-1 h-4 w-4"/>Video link</Button>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Your Name</label><Input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/></div>
        <div><label className="mb-1 block text-sm font-medium">{type === "text" ? "Your Experience" : "Video Description"}</label><Textarea required maxLength={1500} value={quote} onChange={e=>setQuote(e.target.value)} placeholder="Share your experience using Zemelix…"/></div>
        {type === "video" && <div><label className="mb-1 block text-sm font-medium">YouTube or Vimeo URL</label><Input required type="url" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://…"/></div>}
        <div><label className="mb-1 block text-sm font-medium">Your Rating</label><StarRating value={rating} onChange={setRating}/></div>
        <p className="text-xs text-muted-foreground">Submissions are not saved or published yet. Please contact support if you would like to share feedback with the Zemelix team.</p>
        <DialogFooter><DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose><Button type="submit">Preview submission</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return <div className="flex h-72 min-w-[280px] max-w-xs flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md dark:bg-gray-900">
    {t.type === "video" && t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="mb-3 text-sm font-medium text-indigo-600 underline">Watch shared video</a>}
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <p className="mb-2 text-center italic">“{t.quote}”</p>
      <div className="mb-2 flex items-center gap-1">{[1,2,3,4,5].map(star=><Star key={star} className={cn("h-4 w-4",t.rating>=star?"fill-yellow-400 text-yellow-400":"text-gray-300")} fill={t.rating>=star?"#facc15":"none"}/>)}</div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.name}</span>
      <span className="mt-1 text-xs text-amber-700 dark:text-amber-300">Preview only · Not published</span>
    </div>
  </div>;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  function handleAddTestimony(newTestimony: Testimonial) {
    setTestimonials(current => [newTestimony, ...current]);
    setNotice("Preview added for this visit only. It has not been submitted to Zemelix or published.");
  }

  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div className="mb-4"><h2 className="text-2xl font-semibold text-primary">Community Experiences</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">We’ll feature genuine customer experiences here once submissions can be reviewed and approved.</p></div>
    <div className="mb-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-4 w-4"/>Experiences are not publicly published from this preview.</span><Button variant="outline" className="flex items-center gap-2" onClick={()=>{setNotice("");setModalOpen(true);}}><Star className="h-4 w-4"/>Share your experience</Button></div>
    {notice && <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{notice}</p>}
    {testimonials.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-muted-foreground dark:border-gray-700">No approved testimonials yet. We won’t display sample endorsements as real customer feedback.</div> : <Carousel opts={{align:"start",loop:testimonials.length>1}} className="w-full"><div className="relative"><CarouselPrevious className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"/><CarouselNext className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"/><CarouselContent>{testimonials.map((t,idx)=><CarouselItem key={`${t.name}-${idx}`} className="basis-full pl-4 sm:basis-1/2 md:basis-1/3"><TestimonialCard t={t}/></CarouselItem>)}</CarouselContent></div></Carousel>}
    <AddTestimonyModal open={modalOpen} onOpenChange={setModalOpen} onAdd={handleAddTestimony}/>
  </section>;
}
