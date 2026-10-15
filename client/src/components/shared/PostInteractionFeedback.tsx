import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFeedback, listMyFeedback } from "@/services/feedback.service";

type Props = { orderId?: string; bookingId?: string; interactionLabel: string };

export default function PostInteractionFeedback({ orderId, bookingId, interactionLabel }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const existing = await listMyFeedback();
        const alreadySubmitted = existing.some(item =>
          (orderId && item.orderId === orderId) || (bookingId && item.bookingId === bookingId)
        );
        if (!cancelled) {
          setVisible(!alreadySubmitted);
          setSubmitted(alreadySubmitted);
        }
      } catch {
        if (!cancelled) setError("We couldn't check whether you've already shared feedback. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void check();
    return () => { cancelled = true; };
  }, [orderId, bookingId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (rating < 1 || saving || (!orderId && !bookingId)) return;
    setSaving(true);
    setError("");
    try {
      await createFeedback({
        type: "feedback",
        subject: `Post-interaction feedback: ${interactionLabel.toLowerCase()}`,
        message: comment.trim() || `User rated their ${interactionLabel.toLowerCase()} experience ${rating} out of 5.`,
        orderId: orderId ?? null,
        bookingId: bookingId ?? null,
        rating,
      });
      setSubmitted(true);
      setVisible(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feedback couldn't be submitted. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !visible) {
    if (submitted) return <p className="mt-3 flex items-center gap-2 text-xs text-green-700"><CheckCircle2 className="h-4 w-4"/>Thanks for sharing your feedback.</p>;
    return error && !loading ? <div className="mt-3 text-xs text-red-600" role="alert">{error}</div> : null;
  }

  return <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
    <div><h3 className="font-semibold text-sm">How was your {interactionLabel.toLowerCase()} experience?</h3><p className="mt-1 text-xs text-gray-500">Optional — your feedback helps us improve Zemelix.</p></div>
    <div className="flex items-center gap-1" role="group" aria-label="Rate your experience from 1 to 5">
      {[1,2,3,4,5].map(value=><button key={value} type="button" aria-label={`${value} star${value===1?"":"s"}`} aria-pressed={rating===value} onClick={()=>setRating(value)} className={`rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${value<=rating?"text-amber-500":"text-gray-300"}`}><Star className="h-6 w-6" fill={value<=rating?"currentColor":"none"}/></button>)}
    </div>
    <textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={1000} rows={2} placeholder="Anything you'd like us to know? (optional)" className="w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900"/>
    {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={saving||rating<1}>{saving&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Send feedback</Button><Button type="button" size="sm" variant="ghost" onClick={()=>setVisible(false)}>Not now</Button></div>
  </form>;
}
