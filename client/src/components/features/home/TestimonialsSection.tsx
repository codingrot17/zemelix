import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Video, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Demo testimonials
const initialTestimonials = [
  {
    type: "video",
    name: "Jane Doe",
    quote: "This platform changed my business!",
    videoUrl: "/videos/testimonial1.mp4",
    rating: 5,
  },
  {
    type: "text",
    name: "Alex Smith",
    quote: "Super easy to use and the support is amazing.",
    rating: 4,
  },
  {
    type: "video",
    name: "Chris Lee",
    quote: "I found my dream job here!",
    videoUrl: "/videos/testimonial2.mp4",
    rating: 5,
  },
  {
    type: "text",
    name: "Maria Garcia",
    quote: "I love the variety of services available.",
    rating: 5,
  },
];

// Star rating input component
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "p-1 transition",
            value >= star ? "text-yellow-400" : "text-gray-300"
          )}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star className="w-6 h-6" fill={value >= star ? "#facc15" : "none"} />
        </button>
      ))}
    </div>
  );
}

// Modal form for adding a testimony
function AddTestimonyModal({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (t: any) => void;
}) {
  const [type, setType] = useState<"text" | "video">("text");
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rating, setRating] = useState(5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (type === "video" && !videoUrl) return;
    if (!name || !quote) return;
    onAdd({ type, name, quote, videoUrl, rating });
    setName("");
    setQuote("");
    setVideoUrl("");
    setRating(5);
    setType("text");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Your Testimony</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant={type === "text" ? "default" : "outline"}
              onClick={() => setType("text")}
              className="flex-1 flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Text
            </Button>
            <Button
              type="button"
              variant={type === "video" ? "default" : "outline"}
              onClick={() => setType("video")}
              className="flex-1 flex items-center gap-1"
            >
              <Video className="w-4 h-4" /> Video
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === "text" ? "Your Testimony" : "Description"}
            </label>
            <Textarea
              required
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder={type === "text" ? "Share your experience..." : "Describe your video..."}
            />
          </div>
          {type === "video" && (
            <div>
              <label className="block text-sm font-medium mb-1">Video URL</label>
              <Input
                required
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Paste a video URL (e.g. mp4, YouTube embed, etc)"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="default">
              Submit Testimony
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Testimonial card (text or video)
function TestimonialCard({ t }: { t: any }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 min-w-[320px] max-w-xs flex flex-col  justify-center items-center h-72">
      {t.type === "video" && t.videoUrl ? (
        <video
          controls
          className="w-full h-40 rounded mb-2 bg-black"
          poster="/images/placeholder.svg"
        >
          <source src={t.videoUrl} type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
      ) : null}
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <p className="italic mb-1 text-center">"{t.quote}"</p>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                t.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              )}
              fill={t.rating >= star ? "#facc15" : "none"}
            />
          ))}
        </div>
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{t.name}</span>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);

  function handleAddTestimony(newTestimony: any) {
    setTestimonials([newTestimony, ...testimonials]);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">What Our Users Say</h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span></span>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Star className="w-4 h-4" /> Add Your Testimony
        </Button>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <div className="relative">
          <CarouselPrevious className="absolute top-1/2 left-0 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white" />
          <CarouselNext className="absolute top-1/2 right-0 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white" />
          <CarouselContent>
            {testimonials.map((t, idx) => (
              <CarouselItem key={idx} className="pl-1 basis-full sm:basis-1/2 md:basis-1/3">
                <TestimonialCard t={t} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
      <AddTestimonyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={handleAddTestimony}
      />
    </section>
  );
}
