import { useCallback, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Video, MessageCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { listApprovedTestimonials, submitTestimonial, type Testimonial, type TestimonialType } from "@/services/testimonial.service";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <div className="flex items-center gap-1" role="group" aria-label="Your rating">{[1,2,3,4,5].map(star => (
    <button key={star} type="button" className={cn("rounded p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", value >= star ? "text-yellow-400" : "text-gray-300")} onClick={() => onChange(star)} aria-label={`Rate ${star} star`} aria-pressed={value === star}>
      <Star className="h-6 w-6" fill={value >= star ? "#facc15" : "none"} />
    </button>
  ))}</div>;
}

function AddTestimonyModal({ open, onOpenChange, onSubmitted }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmitted: () => void }) {
  const [type, setType] = useState<TestimonialType>("text");
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName(""); setQuote(""); setVideoUrl(""); setRating(5); setType("text"); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedQuote = quote.trim();
    if (!trimmedName || trimmedName.length > 100 || !trimmedQuote || trimmedQuote.length > 1500) {
      setError("Please provide your name and experience within the character limits.");
      return;
    }
    if (type === "video") {
      try {
        const url = new URL(videoUrl);
        if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be", "vimeo.com", "www.vimeo.com"].includes(url.hostname)) {
          setError("Enter a valid HTTPS YouTube or Vimeo link.");
          return;
        }
      } catch {
        setError("Enter a valid HTTPS YouTube or Vimeo link.");
        return;
      }
    }
    setSubmitting(true);
    try {
      await submitTestimonial({ name: trimmedName, quote: trimmedQuote, type, videoUrl: type === "video" ? videoUrl.trim() : undefined, rating });
      reset();
      onOpenChange(false);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your testimonial. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Share Your Experience</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-2 flex gap-2">
          <Button type="button" variant={type === "text" ? "default" : "outline"} onClick={() => setType("text")} className="flex-1"><MessageCircle className="mr-1 h-4 w-4"/>Text</Button>
          <Button type="button" variant={type === "video" ? "default" : "outline"} onClick={() => setType("video")} className="flex-1"><Video className="mr-1 h-4 w-4"/>Video link</Button>
        </div>
        <div><label htmlFor="testimonial-name" className="mb-1 block text-sm font-medium">Your Name</label><Input id="testimonial-name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/></div>
        <div><label htmlFor="testimonial-quote" className="mb-1 block text-sm font-medium">{type === "text" ? "Your Experience" : "Video Description"}</label><Textarea id="testimonial-quote" required maxLength={1500} value={quote} onChange={e=>setQuote(e.target.value)} placeholder="Share your experience using Zemelix…"/></div>
        {type === "video" && <div><label htmlFor="testimonial-video" className="mb-1 block text-sm font-medium">YouTube or Vimeo URL</label><Input id="testimonial-video" required type="url" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://…"/></div>}
        <div><label className="mb-1 block text-sm font-medium">Your Rating</label><StarRating value={rating} onChange={setRating}/></div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
        <p className="text-xs text-muted-foreground">Your testimonial will be reviewed by the Zemelix team before it appears publicly.</p>
        <DialogFooter><DialogClose asChild><Button type="button" variant="ghost" disabled={submitting}>Cancel</Button></DialogClose><Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit testimonial"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return <div className="flex h-72 w-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md dark:bg-gray-900">
    {t.type === "video" && t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="mb-3 inline-flex min-h-11 items-center text-sm font-medium text-indigo-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Video className="mr-2 h-4 w-4"/>Watch shared video</a>}
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <p className="mb-2 max-h-40 overflow-y-auto text-center italic">“{t.quote}”</p>
      <div className="mb-2 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>{[1,2,3,4,5].map(star=><Star key={star} className={cn("h-4 w-4",t.rating>=star?"fill-yellow-400 text-yellow-400":"text-gray-300")} fill={t.rating>=star?"#facc15":"none"}/>)}</div>
      <span className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{t.name}</span>
    </div>
  </div>;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setTestimonials(await listApprovedTestimonials());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTestimonials(); }, [loadTestimonials]);

  function handleSubmitted() {
    setNotice("Thank you! Your testimonial has been submitted for review. It will appear here if approved.");
  }

  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="testimonials-heading">
    <div className="mb-4"><h2 id="testimonials-heading" className="text-2xl font-semibold text-primary">Community Experiences</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Real experiences shared by the Zemelix community.</p></div>
    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span className="text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-4 w-4"/>Testimonials are reviewed before publication.</span><Button variant="outline" className="flex min-h-11 w-full items-center justify-center gap-2 sm:w-auto" onClick={()=>{setNotice("");setModalOpen(true);}}><Star className="h-4 w-4"/>Share your experience</Button></div>
    {notice && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200">{notice}</p>}
    {loading ? <div className="flex min-h-44 items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-sm text-muted-foreground dark:border-gray-700" role="status"><RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true"/>Loading community experiences…</div>
      : loadError ? <div className="rounded-xl border border-dashed border-red-300 px-6 py-8 text-center dark:border-red-900"><p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-300">{loadError}</p><Button type="button" variant="outline" onClick={() => void loadTestimonials()}><RefreshCw className="mr-2 h-4 w-4"/>Try again</Button></div>
      : testimonials.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-muted-foreground dark:border-gray-700">No approved testimonials yet. Be one of the first to share your experience.</div>
      : <Carousel opts={{align:"start",loop:testimonials.length>1}} className="w-full"><div className="relative px-1 sm:px-0"><CarouselPrevious className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"/><CarouselNext className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"/><CarouselContent>{testimonials.map(t=><CarouselItem key={t.$id} className="basis-full pl-4 sm:basis-1/2 md:basis-1/3"><TestimonialCard t={t}/></CarouselItem>)}</CarouselContent></div></Carousel>}
    <AddTestimonyModal open={modalOpen} onOpenChange={setModalOpen} onSubmitted={handleSubmitted}/>
  </section>;
}
