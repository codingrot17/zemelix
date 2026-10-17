import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Loader2, MessageSquare, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listSupportConversations, listSupportMessages, sendSupportMessage, updateSupportConversation, type SupportConversation, type SupportMessage, type SupportStatus } from "@/services/support.service";

export default function AdminSupport() {
  const [items,setItems]=useState<SupportConversation[]>([]);
  const [selected,setSelected]=useState<SupportConversation|null>(null);
  const [messages,setMessages]=useState<SupportMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [filter,setFilter]=useState<SupportStatus|"all">("open");
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try {
      const rows=await listSupportConversations(filter);
      setItems(rows);
      if(selected) {
        const fresh=rows.find(c=>c.$id===selected.$id);
        if(fresh) setSelected(fresh);
        else if(filter!=="all") { setSelected(null);setMessages([]); }
      }
    } catch(e) { setError(e instanceof Error?e.message:"Could not load support inbox."); }
    finally { setLoading(false); }
  },[filter,selected?.$id]);
  useEffect(()=>{void load()},[load]);

  async function choose(c:SupportConversation) {
    setSelected(c);setMessages([]);setError("");
    try { const result=await listSupportMessages(c.$id);setSelected(result.conversation);setMessages(result.messages); }
    catch(e){setError(e instanceof Error?e.message:"Could not load conversation.");}
  }
  async function reply(e:React.FormEvent) {
    e.preventDefault();if(!selected||!draft.trim()||busy)return;
    setBusy(true);setError("");
    try {
      await sendSupportMessage(selected.$id,draft.trim());setDraft("");
      const result=await listSupportMessages(selected.$id);setSelected(result.conversation);setMessages(result.messages);
      await load();
    } catch(e){setError(e instanceof Error?e.message:"Reply could not be sent.");}
    finally{setBusy(false);}
  }
  async function setStatus(status:SupportStatus) {
    if(!selected)return;setBusy(true);setError("");
    try {
      const result=await updateSupportConversation(selected.$id,status);setSelected(result.conversation);
      await load();
      const detail=await listSupportMessages(selected.$id);setMessages(detail.messages);
    }catch(e){setError(e instanceof Error?e.message:"Status could not be updated.");}
    finally{setBusy(false);}
  }

  return <main className="space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold sm:text-3xl">Support agent inbox</h1><p className="mt-1 text-sm text-gray-500">Review customer and vendor questions and reply directly from the admin dashboard.</p></div><Button variant="outline" onClick={()=>void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading?"animate-spin":""}`}/>Refresh</Button></header>
    {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-2">{(["open","in-progress","closed","all"] as const).map(s=><button key={s} onClick={()=>setFilter(s)} className={`rounded-full border px-4 py-2 text-sm capitalize ${filter===s?"border-indigo-600 bg-indigo-600 text-white":"bg-white hover:border-indigo-300"}`}>{s==="in-progress"?"In progress":s}</button>)}</div>
    <div className="grid min-h-[560px] min-w-0 gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
      <section className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground dark:border-gray-700"><div className="border-b p-4 font-semibold dark:border-gray-700">Conversations <span className="ml-1 text-xs text-gray-400">({items.length})</span></div>{loading?<div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin"/></div>:items.length===0?<div className="p-8 text-center text-sm text-gray-500"><MessageSquare className="mx-auto mb-2 h-6 w-6"/>No conversations in this view.</div>:<div className="max-h-[620px] overflow-y-auto divide-y dark:divide-gray-800">{items.map(c=><button key={c.$id} onClick={()=>void choose(c)} className={`w-full p-4 text-left transition hover:bg-indigo-50 dark:hover:bg-gray-800 ${selected?.$id===c.$id?"bg-indigo-50 dark:bg-gray-800":""}`}><div className="flex items-start justify-between gap-2"><p className="font-semibold text-sm">{c.subject}</p><span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] capitalize dark:bg-gray-700">{c.status}</span></div><p className="mt-1 text-xs text-gray-500">{c.ownerName} · {c.ownerRole}</p><p className="mt-1 flex flex-wrap gap-1.5 text-[11px]"><span className="rounded bg-gray-100 px-2 py-0.5 capitalize dark:bg-gray-800">{(c.category||"general").replace("-", " ")}</span><span className={`rounded px-2 py-0.5 capitalize ${c.priority==="urgent"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-600 dark:bg-gray-800"}`}>{c.priority||"normal"}</span></p><p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{c.lastMessage||"No messages yet"}</p><p className="mt-2 text-[11px] text-gray-400">{new Date(c.lastMessageAt||c.$updatedAt).toLocaleString()}</p></button>)}</div>}</section>
      <section className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground dark:border-gray-700">
        {!selected?<div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-500"><MessageSquare className="mb-3 h-8 w-8"/><p className="font-medium">Select a conversation</p><p className="mt-1 text-sm">Messages and reply controls will appear here.</p></div>:<>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4 dark:border-gray-700"><div><h2 className="font-semibold">{selected.subject}</h2><p className="mt-1 text-xs text-gray-500">Ticket {selected.$id.slice(0,8).toUpperCase()} · {(selected.category||"general").replace("-", " ")} · {selected.priority||"normal"}</p><p className="mt-1 text-xs text-gray-500">{selected.ownerName} · {selected.ownerEmail} · {selected.ownerRole}</p></div><div className="flex flex-wrap gap-2">{selected.status!=="closed"?<Button size="sm" variant="outline" disabled={busy} onClick={()=>void setStatus("closed")}><CheckCircle2 className="mr-1 h-4 w-4"/>Close</Button>:<Button size="sm" variant="outline" disabled={busy} onClick={()=>void setStatus("open")}><Clock3 className="mr-1 h-4 w-4"/>Reopen</Button>}</div></div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">{messages.map(m=><div key={m.$id} className={`max-w-[88%] rounded-xl p-3 text-sm ${m.senderRole==="admin"?"ml-auto bg-indigo-600 text-white":"bg-white shadow-sm dark:bg-gray-800"}`}><p className="mb-1 text-[10px] font-semibold uppercase opacity-70">{m.senderRole==="admin"?"You · Support agent":m.senderRole}</p><p className="whitespace-pre-wrap">{m.message}</p><time className="mt-1 block text-[10px] opacity-60">{new Date(m.$createdAt).toLocaleString()}</time></div>)}</div>
          {selected.status!=="closed"&&<form onSubmit={reply} className="flex flex-col sm:flex-row sm:items-end gap-2 border-t p-3 dark:border-gray-700"><textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={4000} rows={3} placeholder="Write a reply…" className="w-full min-w-0 flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground sm:w-auto" aria-label="Support reply"/><Button type="submit" disabled={busy||!draft.trim()}><Send className="mr-2 h-4 w-4"/>Reply</Button></form>}
        </>}
      </section>
    </div>
  </main>;
}
