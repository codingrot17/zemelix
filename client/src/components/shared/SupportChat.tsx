import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, Loader2, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createSupportConversation, listMySupportConversations, listSupportMessages, sendSupportMessage, type SupportConversation, type SupportMessage } from "@/services/support.service";

const faqs = [
  { q: "How do I buy something?", a: "Browse Collections, open a listing, then use the available product or booking action. For products, add items to your cart or contact the seller through the listing." },
  { q: "How do I become a seller or service provider?", a: "Sign in, open your account menu and choose the vendor onboarding option. Complete the setup steps to create your storefront or service profile." },
  { q: "How do I track an order or booking?", a: "Sign in and open your dashboard. Customers can review their orders and bookings there; vendors can manage orders or bookings from their vendor dashboard." },
  { q: "How do I contact a seller?", a: "Open the product or service listing and use its contact or booking action. Zemelix support chat is for help with using the platform." },
  { q: "I need help with my account", a: "If you are signed in, send a message to our support team below. Never share your password or one-time verification codes." },
];

type ChatLine = { id: string; role: "bot" | "user" | "admin"; message: string; createdAt?: string };

export default function SupportChat({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [view, setView] = useState<"home" | "conversation" | "new">("home");
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [active, setActive] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([{ id: "welcome", role: "bot", message: "Hi! 👋 I’m Zemelix support. Choose a quick answer below or send us a message." }]);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = async () => {
    if (!user || user.role === "admin") return;
    try { setConversations(await listMySupportConversations()); } catch { /* FAQ remains available if history fails */ }
  };

  useEffect(() => { void refreshConversations(); }, [user?.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function openConversation(conversation: SupportConversation) {
    setLoading(true); setError(""); setActive(conversation); setView("conversation");
    try {
      const result = await listSupportMessages(conversation.$id);
      setActive(result.conversation);
      setMessages(result.messages.map((m: SupportMessage) => ({ id: m.$id, role: m.senderRole === "admin" ? "admin" : "user", message: m.message, createdAt: m.$createdAt })));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this conversation."); }
    finally { setLoading(false); }
  }

  function showFaq(answer: string) {
    setMessages(prev => [...prev, { id: `faq-${Date.now()}`, role: "user", message: "Quick question" }, { id: `answer-${Date.now()}`, role: "bot", message: answer }]);
  }

  async function startConversation(event: FormEvent) {
    event.preventDefault();
    if (!subject.trim() || !draft.trim()) return;
    setSending(true); setError("");
    try {
      const result = await createSupportConversation(subject.trim(), draft.trim());
      setActive(result.conversation); setConversations(prev => [result.conversation, ...prev]);
      setMessages(result.messages.map(m => ({ id: m.$id, role: "user", message: m.message, createdAt: m.$createdAt })));
      setDraft(""); setSubject(""); setView("conversation");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not start a conversation."); }
    finally { setSending(false); }
  }

  async function reply(event: FormEvent) {
    event.preventDefault();
    if (!active || !draft.trim() || sending) return;
    const message = draft.trim(); setSending(true); setError("");
    try {
      const result = await sendSupportMessage(active.$id, message);
      setMessages(prev => [...prev, { id: result.message.$id, role: user?.role === "admin" ? "admin" : "user", message, createdAt: result.message.$createdAt }]);
      setActive(result.conversation);
      setConversations(prev => prev.map(c => c.$id === active.$id ? result.conversation : c));
      setDraft("");
    } catch (e) { setError(e instanceof Error ? e.message : "Message could not be sent."); }
    finally { setSending(false); }
  }

  return <section className="fixed bottom-5 right-4 z-[100] flex h-[min(680px,calc(100dvh-2.5rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" aria-label="Zemelix support chat">
    <header className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        {view !== "home" && <button aria-label="Back to chat home" onClick={() => { setView("home"); setError(""); }} className="rounded-full p-1 hover:bg-white/15"><ArrowLeft className="h-4 w-4"/></button>}
        <div className="rounded-full bg-white/15 p-2"><MessageCircle className="h-5 w-5"/></div>
        <div><h2 className="font-semibold">Zemelix Support</h2><p className="text-xs text-indigo-100">FAQs and support messages</p></div>
      </div>
      <button onClick={onClose} aria-label="Close chat" className="rounded-full p-2 hover:bg-white/15"><X className="h-5 w-5"/></button>
    </header>
    <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
      {view === "home" && <>
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm dark:bg-gray-800">Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! How can we help today?</div>
        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Quick answers</p>
        {faqs.map(f => <button key={f.q} onClick={() => showFaq(f.a)} className="block w-full rounded-xl border border-gray-200 bg-white p-3 text-left text-sm hover:border-indigo-400 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:hover:text-indigo-300">{f.q}</button>)}
        {user && user.role !== "admin" && <div className="pt-2">
          <Button className="w-full" onClick={() => { setView("new"); setError(""); }}>Message the support team</Button>
          {conversations.length > 0 && <div className="mt-3 space-y-2"><p className="text-xs font-semibold text-gray-500">Your recent conversations</p>{conversations.slice(0,5).map(c=><button key={c.$id} onClick={() => void openConversation(c)} className="w-full rounded-lg border bg-white p-3 text-left text-sm dark:bg-gray-900"><span className="block font-medium">{c.subject}</span><span className="text-xs text-gray-500">{c.status.replace("-", " ")} · {c.lastMessage || "No messages"}</span></button>)}</div>}
        </div>}
        {!user && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm dark:border-indigo-900 dark:bg-indigo-950/30">Sign in to send a message and keep track of replies. <Link className="font-semibold text-indigo-700 underline dark:text-indigo-300" to="/login" onClick={onClose}>Sign in</Link></div>}
        {user?.role === "admin" && <Link to="/dashboard/admin/support" onClick={onClose} className="block rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">Open support agent inbox →</Link>}
      </>}
      {view === "new" && <form onSubmit={startConversation} className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">Tell us what you need help with. Our team can reply in your dashboard chat.</p>
        <label className="block text-xs font-medium">Subject<input required maxLength={180} value={subject} onChange={e=>setSubject(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900" placeholder="e.g. Help with a booking"/></label>
        <label className="block text-xs font-medium">Message<textarea required maxLength={4000} value={draft} onChange={e=>setDraft(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900" placeholder="Describe the issue..."/></label>
        <Button type="submit" disabled={sending} className="w-full">{sending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Send to support</Button>
      </form>}
      {view === "conversation" && <>
        <div className="rounded-lg border bg-white p-3 text-sm dark:bg-gray-900"><p className="font-semibold">{active?.subject}</p><p className="mt-1 text-xs capitalize text-gray-500">Status: {active?.status.replace("-", " ")}</p></div>
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin"/></div> : messages.map(m=><div key={m.id} className={`max-w-[90%] rounded-2xl p-3 text-sm ${m.role === "user" ? "ml-auto rounded-tr-sm bg-indigo-600 text-white" : "mr-auto rounded-tl-sm bg-white shadow-sm dark:bg-gray-800"}`}><p className="mb-1 text-[10px] font-semibold uppercase opacity-70">{m.role === "admin" ? "Support agent" : m.role === "bot" ? "Quick answer" : "You"}</p><p className="whitespace-pre-wrap">{m.message}</p>{m.createdAt && <time className="mt-1 block text-[10px] opacity-60">{new Date(m.createdAt).toLocaleString()}</time>}</div>)}
        {active?.status === "closed" && <p className="text-center text-xs text-gray-500">This conversation is closed. Start a new chat if you need more help.</p>}
        <div ref={bottomRef}/>
      </>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    </div>
    {view === "conversation" && active?.status !== "closed" && <form onSubmit={reply} className="flex items-end gap-2 border-t bg-white p-3 dark:border-gray-700 dark:bg-gray-900"><textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={4000} rows={2} className="max-h-28 flex-1 resize-none rounded-xl border bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800" placeholder="Write a message..." aria-label="Write a message"/><Button type="submit" size="icon" disabled={sending || !draft.trim()} aria-label="Send message">{sending?<Loader2 className="h-4 w-4 animate-spin"/>:<ArrowUp className="h-4 w-4"/>}</Button></form>}
  </section>;
}
