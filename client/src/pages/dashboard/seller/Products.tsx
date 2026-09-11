import { useEffect, useRef, useState } from "react";
import { AlertCircle, DollarSign, Edit, Eye, ImagePlus, Loader2, Package, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { createSellerProduct, deleteSellerProduct, listSellerProducts, type SellerProduct, updateSellerProduct, uploadProductImage } from "@/services/product.service";

const CATEGORIES = ["Fashion", "Beauty", "Electronics", "Gadgets", "Home & Living", "Food & Drinks", "Graphic Design", "Digital Services", "Furniture", "Automobile", "Photography", "Tech Services", "Other"];
const BADGES = ["", "Hot", "New", "Trending", "Featured"] as const;
const STATUSES = ["active", "draft", "archived"] as const;
const VENDOR_TYPES = ["seller", "service"] as const;

interface ProductForm { title: string; shortDescription: string; longDescription: string; price: string; stock: string; category: string; tags: string; badge: string; vendorType: string; sellerWhatsapp: string; featured: boolean; status: string; }
const EMPTY_FORM: ProductForm = { title: "", shortDescription: "", longDescription: "", price: "", stock: "", category: "", tags: "", badge: "", vendorType: "seller", sellerWhatsapp: "", featured: false, status: "active" };
const parseTags = (value: string) => value.split(",").map(tag => tag.trim()).filter(Boolean);

export default function SellerProducts() {
    const { user } = useAuth();
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showDialog, setShowDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async () => {
        if (!user?.$id) { setFetchError("Configuration missing. Check your authentication and .env settings."); setLoading(false); return; }
        setLoading(true); setFetchError(null);
        try { setProducts(await listSellerProducts(user.$id)); }
        catch (error: any) { setFetchError(error?.message ?? "Failed to load products."); }
        finally { setLoading(false); }
    };
    useEffect(() => { void fetchProducts(); }, [user?.$id]);

    const filtered = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (!query || product.title.toLowerCase().includes(query) || product.category.toLowerCase().includes(query)) && (filterStatus === "all" || product.status === filterStatus);
    });
    const totalValue = products.reduce((sum, product) => sum + Number(product.price) * Number(product.stock), 0);
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock), 0);
    const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm(current => ({ ...current, [key]: value }));

    const resetDialog = () => { setShowDialog(false); setEditingProduct(null); setForm(EMPTY_FORM); setFormError(null); setImageFile(null); setImagePreview(null); setExistingImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
    const openAdd = () => { resetDialog(); setShowDialog(true); };
    const openEdit = (product: SellerProduct) => {
        setEditingProduct(product);
        setForm({ title: product.title, shortDescription: product.shortDescription, longDescription: product.longDescription ?? "", price: String(product.price), stock: String(product.stock), category: product.category, tags: product.tags?.join(", ") ?? "", badge: product.badge ?? "", vendorType: product.vendorType, sellerWhatsapp: product.sellerWhatsapp ?? "", featured: Boolean(product.featured), status: product.status });
        setImageFile(null); setImagePreview(null); setExistingImageUrl(product.imageUrl ?? null); setFormError(null); setShowDialog(true);
    };
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return;
        if (file.size > 3 * 1024 * 1024) { setFormError("Image must be under 3MB."); return; }
        setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError(null);
    };
    const validate = () => {
        if (!form.title.trim()) { setFormError("Title is required."); return false; }
        if (!form.shortDescription.trim()) { setFormError("Short description is required."); return false; }
        if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) { setFormError("Enter a valid price."); return false; }
        if (!form.stock || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) { setFormError("Enter a valid stock quantity."); return false; }
        if (!form.category) { setFormError("Category is required."); return false; }
        return true;
    };
    const handleSave = async () => {
        if (!validate() || !user) return;
        setSaving(true); setFormError(null);
        try {
            let imageUrl = existingImageUrl ?? "";
            if (imageFile) imageUrl = (await uploadProductImage(imageFile)).url;
            const payload = { title: form.title.trim(), shortDescription: form.shortDescription.trim(), longDescription: form.longDescription.trim() || null, price: Number(form.price), stock: Number(form.stock), category: form.category, tags: parseTags(form.tags), badge: form.badge || null, vendorType: form.vendorType, sellerName: user.profile?.businessName ?? user.name ?? "Seller", sellerWhatsapp: form.sellerWhatsapp.trim() || null, sellerAvatar: user.profile?.logo ?? null, featured: form.featured, status: form.status, rating: editingProduct?.rating ?? 0, sellerId: user.$id, imageUrl: imageUrl || null };
            if (editingProduct) await updateSellerProduct(editingProduct.$id, payload); else await createSellerProduct(payload);
            resetDialog(); await fetchProducts();
        } catch (error: any) { setFormError(error?.message ?? "Failed to save product."); }
        finally { setSaving(false); }
    };
    const handleDelete = async (product: SellerProduct) => {
        if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
        setDeletingId(product.$id);
        try { await deleteSellerProduct(product.$id); setProducts(current => current.filter(item => item.$id !== product.$id)); }
        catch (error: any) { alert(`Failed to delete: ${error?.message ?? "Unknown error"}`); }
        finally { setDeletingId(null); }
    };

    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product listings</p></div><Button onClick={openAdd} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Add Product</Button></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><StatCard icon={<Package className="w-8 h-8 text-indigo-500" />} label="Total Products" value={String(products.length)} /><StatCard icon={<Eye className="w-8 h-8 text-emerald-500" />} label="Total Stock" value={String(totalStock)} /><StatCard icon={<DollarSign className="w-8 h-8 text-yellow-500" />} label="Inventory Value" value={`₦${totalValue.toLocaleString()}`} /></div>
        <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by title or category…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" /></div><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground"><option value="all">All Statuses</option>{STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
        {fetchError && <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4" />{fetchError}</div>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">{loading ? <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading products…</div> : filtered.length === 0 ? <div className="py-16 text-center"><Package className="w-14 h-14 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 dark:text-gray-400 mb-4">{searchQuery ? `No products matching "${searchQuery}"` : "No products yet"}</p><Button onClick={openAdd}>Add Your First Product</Button></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 dark:bg-gray-900 border-b"><tr>{["Product", "Category", "Price", "Stock", "Status", "Actions"].map(header => <th key={header} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${header === "Actions" ? "text-right" : "text-left"}`}>{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{filtered.map(product => <tr key={product.$id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.imageUrl || "/images/placeholder.svg"} alt={product.title} className="w-10 h-10 rounded-lg object-cover border" /><div><p className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.title}</p>{product.badge && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{product.badge}</span>}</div></div></td><td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.category}</td><td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₦{Number(product.price).toLocaleString()}</td><td className="px-4 py-3 text-gray-600 dark:text-gray-400"><span className={Number(product.stock) <= 5 ? "text-red-500 font-semibold" : ""}>{product.stock}</span></td><td className="px-4 py-3"><StatusBadge status={product.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(product)}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="ghost" disabled={deletingId === product.$id} onClick={() => handleDelete(product)}>{deletingId === product.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}</Button></div></td></tr>)}</tbody></table><div className="px-4 py-3 border-t text-xs text-gray-400">Showing {filtered.length} of {products.length} products</div></div>}</div>

        <Dialog open={showDialog} onOpenChange={open => { if (!open && !saving) resetDialog(); }}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader><div className="space-y-4 py-2">
            {formError && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"><AlertCircle className="w-4 h-4" />{formError}</div>}
            <div><Label className="mb-2 block">Product Image</Label><div className="flex items-start gap-4">{imagePreview || existingImageUrl ? <div className="relative"><img src={imagePreview ?? existingImageUrl ?? ""} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300" /><button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setExistingImageUrl(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button></div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400"><ImagePlus className="w-6 h-6 mb-1" /><span className="text-xs">Upload</span></button>}<div className="text-xs text-gray-500 pt-2"><p>PNG, JPG up to 3MB</p><button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-indigo-600 hover:underline">{imagePreview || existingImageUrl ? "Change image" : "Choose file"}</button></div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></div></div>
            <Field label="Title" required><Input value={form.title} onChange={e => updateForm("title", e.target.value)} placeholder="Product name" maxLength={200} /></Field><Field label="Short Description" required><Textarea value={form.shortDescription} onChange={e => updateForm("shortDescription", e.target.value)} placeholder="Brief description shown on product cards" rows={2} maxLength={500} /></Field><Field label="Full Description"><Textarea value={form.longDescription} onChange={e => updateForm("longDescription", e.target.value)} placeholder="Detailed product description" rows={3} maxLength={2000} /></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="Price (₦)" required><Input type="number" min="0" step="0.01" value={form.price} onChange={e => updateForm("price", e.target.value)} /></Field><Field label="Stock Qty" required><Input type="number" min="0" value={form.stock} onChange={e => updateForm("stock", e.target.value)} /></Field></div>
            <div className="grid grid-cols-2 gap-4"><SelectField label="Category" value={form.category} onChange={value => updateForm("category", value)} options={CATEGORIES} placeholder="Select category" /><SelectField label="Listing Type" value={form.vendorType} onChange={value => updateForm("vendorType", value)} options={[...VENDOR_TYPES]} /></div>
            <Field label="Tags"><Input value={form.tags} onChange={e => updateForm("tags", e.target.value)} placeholder="wireless, audio, gadget" /></Field><div className="grid grid-cols-2 gap-4"><SelectField label="Badge" value={form.badge} onChange={value => updateForm("badge", value)} options={[...BADGES]} placeholder="None" /><SelectField label="Status" value={form.status} onChange={value => updateForm("status", value)} options={[...STATUSES]} /></div>
            <Field label="WhatsApp Number"><Input value={form.sellerWhatsapp} onChange={e => updateForm("sellerWhatsapp", e.target.value)} placeholder="+2348012345678" /></Field><label className="flex items-center gap-3"><input type="checkbox" checked={form.featured} onChange={e => updateForm("featured", e.target.checked)} className="w-4 h-4" /><span className="text-sm">Mark as Featured</span></label>
        </div><DialogFooter><Button variant="outline" onClick={resetDialog} disabled={saving}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : editingProduct ? "Update Product" : "Add Product"}</Button></DialogFooter></DialogContent></Dialog>
    </div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div><Label className="mb-1 block">{label}{required ? " *" : ""}</Label>{children}</div>; }
function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; placeholder?: string }) { return <Field label={label}><select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground">{placeholder !== undefined && <option value="">{placeholder}</option>}{options.map(option => <option key={option} value={option}>{option || "None"}</option>)}</select></Field>; }
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5 flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p></div>{icon}</div>; }
function StatusBadge({ status }: { status: string }) { const styles: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300", archived: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300" }; return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>{status}</span>; }
