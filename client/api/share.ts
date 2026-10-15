type VercelRequest = {
  query: { type?: string | string[]; id?: string | string[] };
  headers: Record<string, string | string[] | undefined>;
};
type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  send: (body: string) => void;
};

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const absoluteUrl = (value: unknown, origin: string) => {
  const url = String(value ?? "").trim();
  if (!url) return new URL("/images/brand-dark.jpg", origin).toString();
  try {
    return new URL(url, origin).toString();
  } catch {
    return new URL("/images/brand-dark.jpg", origin).toString();
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const originHeader = req.headers["x-forwarded-host"] || req.headers.host || "zemelix-qhn6.vercel.app";
  const host = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  const protocolHeader = req.headers["x-forwarded-proto"];
  const protocol = (Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader) || "https";
  const origin = `${protocol}://${host}`;
  const safeType = type === "service" ? "service" : type === "product" ? "product" : null;
  if (!safeType || !id || !/^[a-zA-Z0-9._-]{1,128}$/.test(id)) {
    res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send("<!doctype html><html><head><title>Listing unavailable | Zemelix</title></head><body><h1>Listing unavailable</h1><p>This Zemelix listing link is invalid.</p><a href=\"/\">Browse Zemelix</a></body></html>");
    return;
  }

  const canonical = new URL(`/product/${encodeURIComponent(id)}`, origin).toString();
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const databaseId = process.env.VITE_APPWRITE_DB_ID || process.env.APPWRITE_DB_ID;
  const collectionId = process.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || process.env.APPWRITE_PRODUCTS_COLLECTION_ID;
  const endpoint = (process.env.VITE_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1").replace(/\/$/, "");

  let title = "Listing on Zemelix";
  let description = "Discover products and services on Zemelix.";
  let image = absoluteUrl("/images/brand-dark.jpg", origin);
  let price = "";
  let unavailable = false;
  let temporaryError = false;

  try {
    if (!projectId || !databaseId || !collectionId) throw new Error("Missing Appwrite public configuration");
    const response = await fetch(`${endpoint}/databases/${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(id)}`, {
      headers: { "X-Appwrite-Project": projectId }
    });
    if (response.status === 404) {
      unavailable = true;
    } else if (!response.ok) {
      temporaryError = true;
    } else {
      const item = await response.json() as Record<string, unknown>;
      if (item.status && item.status !== "active") unavailable = true;
      if (!unavailable) {
        title = String(item.title || title).slice(0, 200);
        const short = String(item.shortDescription || item.description || "").trim();
        price = item.price !== undefined && item.price !== null && item.price !== "" ? `Price: ₦${Number(item.price).toLocaleString("en-NG")}. ` : "";
        description = `${price}${short || "Discover this listing on Zemelix."}`.slice(0, 300);
        image = absoluteUrl(item.imageUrl, origin);
      }
    }
  } catch (error) {
    console.error("Unable to resolve listing share metadata", error);
    temporaryError = true;
  }

  if (unavailable) {
    title = "This listing is no longer available | Zemelix";
    description = "This item has been removed or is no longer publicly available. Browse Zemelix for more products and services.";
    image = absoluteUrl("/images/brand-dark.jpg", origin);
  } else if (temporaryError) {
    title = "Listing temporarily unavailable | Zemelix";
    description = "We could not load this listing right now. Please try again or browse Zemelix for more products and services.";
    image = absoluteUrl("/images/brand-dark.jpg", origin);
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeCanonical = escapeHtml(canonical);
  const fallback = (unavailable || temporaryError)
    ? `<main><h1>${safeTitle}</h1><p>${safeDescription}</p><a href="/">Browse Zemelix</a></main>`
    : `<main><h1>${safeTitle}</h1><p>${safeDescription}</p><p>Opening this listing on Zemelix…</p><a href="${safeCanonical}">Continue to listing</a></main>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeTitle}</title><meta name="description" content="${safeDescription}"><link rel="canonical" href="${safeCanonical}"><meta property="og:type" content="product"><meta property="og:site_name" content="Zemelix"><meta property="og:title" content="${safeTitle}"><meta property="og:description" content="${safeDescription}"><meta property="og:image" content="${safeImage}"><meta property="og:url" content="${safeCanonical}"><meta property="og:image:alt" content="${safeTitle}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}"><meta name="twitter:description" content="${safeDescription}"><meta name="twitter:image" content="${safeImage}">${(unavailable || temporaryError) ? "" : `<script>window.location.replace(${JSON.stringify(canonical)})</script><meta http-equiv="refresh" content="0;url=${safeCanonical}">`} </head><body>${fallback}</body></html>`;
  res.status(unavailable ? 404 : temporaryError ? 503 : 200).setHeader("Content-Type", "text/html; charset=utf-8").setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300").send(html);
}
