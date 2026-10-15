import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Facebook, Share2, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ShareListingDetails {
  id: string;
  title: string;
  description?: string | null;
  price?: number | string | null;
  imageUrl?: string | null;
  listingType?: "product" | "service";
}

function getShareUrl(item: ShareListingDetails) {
  return `${window.location.origin}/api/share?type=${item.listingType === "service" ? "service" : "product"}&id=${encodeURIComponent(item.id)}`;
}

function getShareText(item: ShareListingDetails, url: string) {
  const price = item.price === undefined || item.price === null || item.price === ""
    ? ""
    : `Price: ₦${Number(item.price).toLocaleString()}\n`;
  const description = item.description?.trim() ? `${item.description.trim()}\n` : "";
  return [item.title, price.trimEnd(), description.trim(), url].filter(Boolean).join("\n");
}

export default function ShareListingButton({
  item,
  variant = "outline",
  compact = false,
  className = "",
}: {
  item: ShareListingDetails;
  variant?: "outline" | "ghost" | "secondary";
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 80, left: 8 });
  const toggleMenu = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = Math.min(320, window.innerHeight - 24);
      const top = rect.bottom + menuHeight + 12 > window.innerHeight ? Math.max(12, rect.top - menuHeight - 8) : rect.bottom + 8;
      const left = Math.max(12, Math.min(rect.right - 224, window.innerWidth - 236));
      setMenuPosition({ top, left });
    }
    setOpen(value => !value);
  };
  const url = getShareUrl(item);
  const shareText = getShareText(item, url);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement("textarea");
        field.value = url;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy was not available");
      }
      notify("Listing link copied");
      setOpen(false);
    } catch {
      notify("Could not copy automatically. Open Share and copy the link.");
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      setOpen(true);
      return;
    }
    try {
      await navigator.share({ title: item.title, text: shareText, url });
      setOpen(false);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") notify("Sharing could not be opened. Try another option.");
    }
  };

  const openShareTarget = (target: "whatsapp" | "facebook" | "x") => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);
    const targetUrl = target === "whatsapp"
      ? `https://wa.me/?text=${encodedText}`
      : target === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodedUrl}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={`relative inline-flex ${className}`} ref={rootRef} onClick={event => event.stopPropagation()}>
      <Button
        ref={triggerRef}
        type="button"
        variant={variant}
        className={`min-h-11 ${compact ? "w-11 px-0" : ""}`}
        aria-label={`Share ${item.listingType ?? "listing"}: ${item.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
      >
        <Share2 className="h-4 w-4" />
        {!compact && <span className="ml-2">Share</span>}
      </Button>
      {open && createPortal(
        <div ref={menuRef} role="menu" aria-label="Share listing" style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: 224, maxHeight: "min(80vh, 320px)", overflowY: "auto" }} className="z-[9999] rounded-xl border border-gray-200 bg-white p-2 shadow-2xl ring-1 ring-black/10 dark:border-gray-700 dark:bg-gray-900">
          <p className="px-3 py-2 text-xs font-semibold text-gray-500">Share this listing</p>
          <button role="menuitem" type="button" onClick={() => openShareTarget("whatsapp")} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="w-5 text-center text-green-600">◉</span> WhatsApp
          </button>
          <button role="menuitem" type="button" onClick={() => openShareTarget("facebook")} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <Facebook className="h-4 w-4 text-blue-600" /> Facebook
          </button>
          <button role="menuitem" type="button" onClick={() => openShareTarget("x")} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <XIcon className="h-4 w-4" /> X
          </button>
          <button role="menuitem" type="button" onClick={() => void copyLink()} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <Copy className="h-4 w-4" /> Copy link
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button role="menuitem" type="button" onClick={() => void shareNative()} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
              <Share2 className="h-4 w-4" /> More sharing options
            </button>
          )}
        </div>,
        document.body
      )}
      {message && <span role="status" className="absolute right-0 top-full z-[60] mt-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">{message}{message.includes("copied") ? <Check className="ml-1 inline h-3 w-3" /> : null}</span>}
    </div>
  );
}
