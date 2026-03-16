import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Package,
    DollarSign,
    Eye,
    Loader2,
    AlertCircle,
    ImagePlus,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
    databases,
    storage,
    DB_ID,
    STORAGE_BUCKET_ID,
    ID,
    Query
} from "@/lib/appwrite";

// ── Constants ──────────────────────────────────────────────────────────────────
const PRODUCTS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

const CATEGORIES = [
    "Fashion",
    "Beauty",
    "Electronics",
    "Gadgets",
    "Home & Living",
    "Food & Drinks",
    "Graphic Design",
    "Digital Services",
    "Furniture",
    "Automobile",
    "Photography",
    "Tech Services",
    "Other"
];

const BADGES = ["", "Hot", "New", "Trending", "Featured"] as const;
const STATUSES = ["active", "draft", "archived"] as const;
const VENDOR_TYPES = ["seller", "service"] as const;

// ── Types ──────────────────────────────────────────────────────────────────────
interface AppwriteProduct {
    $id: string;
    title: string;
    shortDescription: string;
    longDescription?: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
    tags?: string[];
    badge?: string;
    vendorType: string;
    sellerName: string;
    sellerWhatsapp?: string;
    sellerAvatar?: string;
    featured: boolean;
    status: string;
    rating: number;
    sellerId: string;
    $createdAt: string;
}

interface ProductForm {
    title: string;
    shortDescription: string;
    longDescription: string;
    price: string;
    stock: string;
    category: string;
    tags: string; // comma-separated input
    badge: string;
    vendorType: string;
    sellerWhatsapp: string;
    featured: boolean;
    status: string;
}

const EMPTY_FORM: ProductForm = {
    title: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    stock: "",
    category: "",
    tags: "",
    badge: "",
    vendorType: "seller",
    sellerWhatsapp: "",
    featured: false,
    status: "active"
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseTags(raw: string): string[] {
    return raw
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
}

async function uploadImage(
    file: File
): Promise<{ fileId: string; url: string }> {
    const res = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
    const endpoint =
        import.meta.env.VITE_APPWRITE_ENDPOINT ||
        "https://cloud.appwrite.io/v1";
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    const url = `${endpoint}/storage/buckets/${STORAGE_BUCKET_ID}/files/${res.$id}/view?project=${projectId}`;
    return { fileId: res.$id, url };
}

async function deleteImageFile(fileId: string) {
    try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch {
        // Ignore — file may already be deleted
    }
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SellerProducts() {
    const { user } = useAuth();

    // Data state
    const [products, setProducts] = useState<AppwriteProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showDialog, setShowDialog] = useState(false);
    const [editingProduct, setEditingProduct] =
        useState<AppwriteProduct | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
        null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch products ──────────────────────────────────────────────────────────
    const fetchProducts = async () => {
        if (!user?.$id || !DB_ID || !PRODUCTS_COLLECTION_ID) {
            setFetchError("Configuration missing. Check your .env file.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const res = await databases.listDocuments(
                DB_ID,
                PRODUCTS_COLLECTION_ID,
                [
                    Query.equal("sellerId", user.$id),
                    Query.orderDesc("$createdAt"),
                    Query.limit(100)
                ]
            );
            setProducts(res.documents as unknown as AppwriteProduct[]);
        } catch (err: any) {
            setFetchError(err?.message ?? "Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user?.$id]);

    // ── Derived data ────────────────────────────────────────────────────────────
    const filtered = products.filter(p => {
        const matchSearch =
            !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const totalStock = products.reduce((s, p) => s + p.stock, 0);

    // ── Dialog helpers ──────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        setFormError(null);
        setShowDialog(true);
    };

    const openEdit = (product: AppwriteProduct) => {
        setEditingProduct(product);
        setForm({
            title: product.title,
            shortDescription: product.shortDescription,
            longDescription: product.longDescription ?? "",
            price: String(product.price),
            stock: String(product.stock),
            category: product.category,
            tags: product.tags?.join(", ") ?? "",
            badge: product.badge ?? "",
            vendorType: product.vendorType,
            sellerWhatsapp: product.sellerWhatsapp ?? "",
            featured: product.featured,
            status: product.status
        });
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(product.imageUrl ?? null);
        setFormError(null);
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        setFormError(null);
    };

    // ── Image selection ─────────────────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            setFormError("Image must be under 3MB.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setFormError(null);
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Validation ──────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        if (!form.title.trim()) {
            setFormError("Title is required.");
            return false;
        }
        if (!form.shortDescription.trim()) {
            setFormError("Short description is required.");
            return false;
        }
        if (
            !form.price ||
            isNaN(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setFormError("Enter a valid price.");
            return false;
        }
        if (
            !form.stock ||
            isNaN(Number(form.stock)) ||
            Number(form.stock) < 0
        ) {
            setFormError("Enter a valid stock quantity.");
            return false;
        }
        if (!form.category) {
            setFormError("Category is required.");
            return false;
        }
        return true;
    };

    // ── Save (create or update) ─────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        if (!user || !DB_ID || !PRODUCTS_COLLECTION_ID) return;

        setSaving(true);
        setFormError(null);

        try {
            // Upload new image if selected
            let imageUrl = existingImageUrl ?? "";
            if (imageFile) {
                const uploaded = await uploadImage(imageFile);
                imageUrl = uploaded.url;
            }

            const payload = {
                title: form.title.trim(),
                shortDescription: form.shortDescription.trim(),
                longDescription: form.longDescription.trim() || null,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                category: form.category,
                tags: parseTags(form.tags),
                badge: form.badge || null,
                vendorType: form.vendorType,
                sellerName: user.profile?.businessName ?? user.name ?? "Seller",
                sellerWhatsapp: form.sellerWhatsapp.trim() || null,
                sellerAvatar: user.profile?.logo ?? null,
                featured: form.featured,
                status: form.status,
                rating: editingProduct?.rating ?? 0,
                sellerId: user.$id,
                imageUrl: imageUrl || null
            };

            if (editingProduct) {
                await databases.updateDocument(
                    DB_ID,
                    PRODUCTS_COLLECTION_ID,
                    editingProduct.$id,
                    payload
                );
            } else {
                await databases.createDocument(
                    DB_ID,
                    PRODUCTS_COLLECTION_ID,
                    ID.unique(),
                    payload
                );
            }

            closeDialog();
            await fetchProducts();
        } catch (err: any) {
            setFormError(err?.message ?? "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async (product: AppwriteProduct) => {
        if (!confirm(`Delete "${product.title}"? This cannot be undone.`))
            return;
        if (!DB_ID || !PRODUCTS_COLLECTION_ID) return;

        setDeletingId(product.$id);
        try {
            await databases.deleteDocument(
                DB_ID,
                PRODUCTS_COLLECTION_ID,
                product.$id
            );
            setProducts(prev => prev.filter(p => p.$id !== product.$id));
        } catch (err: any) {
            alert("Failed to delete: " + (err?.message ?? "Unknown error"));
        } finally {
            setDeletingId(null);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Products
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your product listings
                    </p>
                </div>
                <Button onClick={openAdd} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={<Package className="w-8 h-8 text-indigo-500" />}
                    label="Total Products"
                    value={String(products.length)}
                />
                <StatCard
                    icon={<Eye className="w-8 h-8 text-emerald-500" />}
                    label="Total Stock"
                    value={String(totalStock)}
                />
                <StatCard
                    icon={<DollarSign className="w-8 h-8 text-yellow-500" />}
                    label="Inventory Value"
                    value={`₦${totalValue.toLocaleString()}`}
                />
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by title or category…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">All Statuses</option>
                    {STATUSES.map(s => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error */}
            {fetchError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {fetchError}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading products…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {searchQuery
                                ? `No products matching "${searchQuery}"`
                                : "No products yet"}
                        </p>
                        <Button onClick={openAdd}>
                            Add Your First Product
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                                <tr>
                                    {[
                                        "Product",
                                        "Category",
                                        "Price",
                                        "Stock",
                                        "Status",
                                        "Actions"
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(product => (
                                    <tr
                                        key={product.$id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        product.imageUrl ||
                                                        "/images/placeholder.svg"
                                                    }
                                                    alt={product.title}
                                                    className="w-10 h-10 rounded-lg object-cover border"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                        {product.title}
                                                    </p>
                                                    {product.badge && (
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                            {product.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {product.category}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                            ₦
                                            {Number(
                                                product.price
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            <span
                                                className={
                                                    product.stock <= 5
                                                        ? "text-red-500 font-semibold"
                                                        : ""
                                                }
                                            >
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={product.status}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        openEdit(product)
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={
                                                        deletingId ===
                                                        product.$id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                >
                                                    {deletingId ===
                                                    product.$id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-3 border-t text-xs text-gray-400">
                            Showing {filtered.length} of {products.length}{" "}
                            products
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={closeDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct
                                ? "Edit Product"
                                : "Add New Product"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Error */}
                        {formError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {/* Image Upload */}
                        <div>
                            <Label className="mb-2 block">Product Image</Label>
                            <div className="flex items-start gap-4">
                                {imagePreview || existingImageUrl ? (
                                    <div className="relative">
                                        <img
                                            src={
                                                imagePreview ??
                                                existingImageUrl ??
                                                ""
                                            }
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 transition text-gray-400 hover:text-indigo-500"
                                    >
                                        <ImagePlus className="w-6 h-6 mb-1" />
                                        <span className="text-xs">Upload</span>
                                    </button>
                                )}
                                <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 pt-2">
                                    <p>PNG, JPG up to 3MB</p>
                                    <p className="mt-1">
                                        Square or 4:3 ratio recommended
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="mt-2 text-indigo-600 hover:underline"
                                    >
                                        {imagePreview || existingImageUrl
                                            ? "Change image"
                                            : "Choose file"}
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={e =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                placeholder="Product name"
                                maxLength={200}
                            />
                        </div>

                        {/* Short Description */}
                        <div>
                            <Label htmlFor="shortDesc">
                                Short Description *
                            </Label>
                            <Textarea
                                id="shortDesc"
                                value={form.shortDescription}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        shortDescription: e.target.value
                                    })
                                }
                                placeholder="Brief description shown on product cards"
                                rows={2}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {form.shortDescription.length}/500
                            </p>
                        </div>

                        {/* Long Description */}
                        <div>
                            <Label htmlFor="longDesc">Full Description</Label>
                            <Textarea
                                id="longDesc"
                                value={form.longDescription}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        longDescription: e.target.value
                                    })
                                }
                                placeholder="Detailed product description (optional)"
                                rows={3}
                                maxLength={2000}
                            />
                        </div>

                        {/* Price + Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price (₦) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            price: e.target.value
                                        })
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stock">Stock Qty *</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            stock: e.target.value
                                        })
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Category + Vendor Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    value={form.category}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            category: e.target.value
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="vendorType">Listing Type</Label>
                                <select
                                    id="vendorType"
                                    value={form.vendorType}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            vendorType: e.target.value
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {VENDOR_TYPES.map(v => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                value={form.tags}
                                onChange={e =>
                                    setForm({ ...form, tags: e.target.value })
                                }
                                placeholder="e.g. wireless, audio, gadget (comma separated)"
                            />
                        </div>

                        {/* Badge + Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="badge">Badge</Label>
                                <select
                                    id="badge"
                                    value={form.badge}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            badge: e.target.value
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {BADGES.map(b => (
                                        <option key={b} value={b}>
                                            {b || "None"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={form.status}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            status: e.target.value
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input
                                id="whatsapp"
                                value={form.sellerWhatsapp}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        sellerWhatsapp: e.target.value
                                    })
                                }
                                placeholder="+2348012345678"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Buyers can contact you directly on WhatsApp
                            </p>
                        </div>

                        {/* Featured toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={form.featured}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        featured: e.target.checked
                                    })
                                }
                                className="w-4 h-4 accent-indigo-600"
                            />
                            <Label
                                htmlFor="featured"
                                className="cursor-pointer"
                            >
                                Mark as Featured
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeDialog}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                    Saving…
                                </>
                            ) : editingProduct ? (
                                "Update Product"
                            ) : (
                                "Add Product"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({
    icon,
    label,
    value
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                </p>
            </div>
            {icon}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
        archived: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
    };
    return (
        <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}
        >
            {status}
        </span>
    );
}
