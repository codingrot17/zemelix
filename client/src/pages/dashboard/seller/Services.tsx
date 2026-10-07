import { useEffect, useRef, useState } from "react";
import { AlertCircle, Edit, Eye, ImagePlus, Loader2, MessageCircle, Plus, Search, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    createProviderService,
    deleteProviderService,
    listProviderServices,
    type ProviderServiceInput,
    type SellerProduct,
    updateProviderService,
    uploadProductImage
} from "@/services/product.service";

const CATEGORIES = [
    "Beauty & Wellness",
    "Photography",
    "Graphic Design",
    "Tech Services",
    "Home Services",
    "Events & Entertainment",
    "Consulting",
    "Education & Training",
    "Automobile",
    "Other"
];

interface ServiceForm {
    title: string;
    shortDescription: string;
    longDescription: string;
    price: string;
    category: string;
    tags: string;
    sellerWhatsapp: string;
}

const EMPTY_FORM: ServiceForm = {
    title: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    category: "",
    tags: "",
    sellerWhatsapp: ""
};

const parseTags = (value: string) =>
    value.split(",").map(tag => tag.trim()).filter(Boolean);

export default function SellerServices() {
    const { user } = useAuth();
    const [services, setServices] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [editingService, setEditingService] = useState<SellerProduct | null>(null);
    const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchServices = async () => {
        if (!user?.$id) {
            setFetchError("Configuration missing. Check your authentication and .env settings.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            setServices(await listProviderServices(user.$id));
        } catch (error: any) {
            setFetchError(error?.message ?? "Failed to load services.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchServices();
    }, [user?.$id]);

    const filtered = services.filter(service => {
        const query = searchQuery.toLowerCase();
        return !query ||
            service.title.toLowerCase().includes(query) ||
            service.category.toLowerCase().includes(query);
    });

    const activeCount = services.filter(service => service.status === "active").length;
    const draftCount = services.filter(service => service.status === "draft").length;

    const updateForm = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) =>
        setForm(current => ({ ...current, [key]: value }));

    const resetDialog = () => {
        setShowDialog(false);
        setEditingService(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openAdd = () => {
        resetDialog();
        setShowDialog(true);
    };

    const openEdit = (service: SellerProduct) => {
        setEditingService(service);
        setForm({
            title: service.title,
            shortDescription: service.shortDescription,
            longDescription: service.longDescription ?? "",
            price: String(service.price),
            category: service.category,
            tags: service.tags?.join(", ") ?? "",
            sellerWhatsapp: service.sellerWhatsapp ?? ""
        });
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(service.imageUrl ?? null);
        setFormError(null);
        setShowDialog(true);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            setFormError("Image must be under 3MB.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setFormError(null);
    };

    const validate = () => {
        if (!form.title.trim()) {
            setFormError("Service name is required.");
            return false;
        }
        if (!form.shortDescription.trim()) {
            setFormError("Short description is required.");
            return false;
        }
        if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
            setFormError("Enter a valid starting price.");
            return false;
        }
        if (!form.category) {
            setFormError("Category is required.");
            return false;
        }
        if (form.sellerWhatsapp.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(form.sellerWhatsapp.trim())) {
            setFormError("Enter a valid WhatsApp number.");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate() || !user) return;
        setSaving(true);
        setFormError(null);
        try {
            let imageUrl = existingImageUrl ?? "";
            if (imageFile) imageUrl = (await uploadProductImage(imageFile)).url;

            const payload: ProviderServiceInput = {
                title: form.title.trim(),
                shortDescription: form.shortDescription.trim(),
                longDescription: form.longDescription.trim() || null,
                price: Number(form.price),
                category: form.category,
                tags: parseTags(form.tags),
                sellerWhatsapp: form.sellerWhatsapp.trim() || null,
                imageUrl: imageUrl || null
            };

            if (editingService) {
                await updateProviderService(editingService.$id, payload);
            } else {
                await createProviderService(payload);
            }

            resetDialog();
            await fetchServices();
        } catch (error: any) {
            setFormError(error?.message ?? "Failed to save service.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service: SellerProduct) => {
        if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
        setDeletingId(service.$id);
        try {
            await deleteProviderService(service.$id);
            setServices(current => current.filter(item => item.$id !== service.$id));
        } catch (error: any) {
            alert(`Failed to delete: ${error?.message ?? "Unknown error"}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create and manage the services customers can request to book.
                    </p>
                </div>
                <Button onClick={openAdd} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<MessageCircle className="w-7 h-7" />} label="Total Services" value={String(services.length)} />
                <StatCard icon={<Eye className="w-7 h-7" />} label="Active Services" value={String(activeCount)} />
                <StatCard icon={<Edit className="w-7 h-7" />} label="Draft Services" value={String(draftCount)} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by service name or category…"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    className="pl-9"
                />
            </div>

            {fetchError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4" /> {fetchError}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading services…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium text-gray-900 dark:text-white">
                            {services.length ? "No services match your search." : "You have no services yet."}
                        </p>
                        {!services.length && (
                            <Button onClick={openAdd} size="sm" className="mt-4">
                                <Plus className="w-4 h-4 mr-2" /> Add your first service
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/40 border-b">
                                    <tr>
                                        <th className="text-left px-5 py-3 font-semibold">Service</th>
                                        <th className="text-left px-5 py-3 font-semibold">Category</th>
                                        <th className="text-left px-5 py-3 font-semibold">Starting price</th>
                                        <th className="text-left px-5 py-3 font-semibold">Status</th>
                                        <th className="text-right px-5 py-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filtered.map(service => (
                                        <tr key={service.$id}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3 min-w-[240px]">
                                                    <ServiceImage service={service} />
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{service.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{service.shortDescription}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">{service.category}</td>
                                            <td className="px-5 py-4">₦{Number(service.price).toLocaleString()}</td>
                                            <td className="px-5 py-4"><StatusBadge status={service.status} /></td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => openEdit(service)}>
                                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDelete(service)} disabled={deletingId === service.$id}>
                                                        {deletingId === service.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                                                        {deletingId === service.$id ? "" : "Delete"}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y">
                            {filtered.map(service => (
                                <div key={service.$id} className="p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <ServiceImage service={service} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{service.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{service.category}</p>
                                                </div>
                                                <StatusBadge status={service.status} />
                                            </div>
                                            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-2">
                                                ₦{Number(service.price).toLocaleString()} <span className="font-normal text-xs text-gray-500">starting price</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{service.shortDescription}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" onClick={() => openEdit(service)}>
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </Button>
                                        <Button variant="outline" onClick={() => handleDelete(service)} disabled={deletingId === service.$id}>
                                            {deletingId === service.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                            {deletingId === service.$id ? "Deleting…" : "Delete"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Dialog open={showDialog} onOpenChange={open => { if (!saving) setShowDialog(open); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingService ? "Edit service" : "Create a service"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <section className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Media</h3>
                                <p className="text-xs text-gray-500 mt-1">Use a clear image that represents the service.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-xl overflow-hidden border bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                    {imagePreview || existingImageUrl ? (
                                        <img src={imagePreview || existingImageUrl || ""} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImagePlus className="w-7 h-7 text-gray-300" />
                                    )}
                                </div>
                                <div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <ImagePlus className="w-4 h-4 mr-2" /> Upload image
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP · max 3MB</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Service information</h3>
                                <p className="text-xs text-gray-500 mt-1">Describe what customers are booking.</p>
                            </div>
                            <div>
                                <Label htmlFor="service-title">Service name</Label>
                                <Input id="service-title" value={form.title} onChange={event => updateForm("title", event.target.value)} placeholder="e.g. Event Photography" className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="service-short">Short description</Label>
                                <Textarea id="service-short" value={form.shortDescription} onChange={event => updateForm("shortDescription", event.target.value)} placeholder="A concise description customers can scan quickly." className="mt-1" rows={3} />
                            </div>
                            <div>
                                <Label htmlFor="service-long">Full description</Label>
                                <Textarea id="service-long" value={form.longDescription} onChange={event => updateForm("longDescription", event.target.value)} placeholder="Explain what is included, your process, and what customers should expect." className="mt-1" rows={5} />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Pricing & category</h3>
                                <p className="text-xs text-gray-500 mt-1">Use the amount customers should expect as the starting price.</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="service-price">Starting price (₦)</Label>
                                    <Input id="service-price" type="number" min="0" step="0.01" value={form.price} onChange={event => updateForm("price", event.target.value)} placeholder="0" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="service-category">Category</Label>
                                    <select id="service-category" value={form.category} onChange={event => updateForm("category", event.target.value)} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Discovery & contact</h3>
                                <p className="text-xs text-gray-500 mt-1">Help customers find your service and continue the conversation after requesting a booking.</p>
                            </div>
                            <div>
                                <Label htmlFor="service-tags">Tags</Label>
                                <Input id="service-tags" value={form.tags} onChange={event => updateForm("tags", event.target.value)} placeholder="wedding, studio, editing" className="mt-1" />
                                <p className="text-xs text-gray-500 mt-1">Separate tags with commas.</p>
                            </div>
                            <div>
                                <Label htmlFor="service-whatsapp">WhatsApp number</Label>
                                <Input id="service-whatsapp" type="tel" value={form.sellerWhatsapp} onChange={event => updateForm("sellerWhatsapp", event.target.value)} placeholder="+234 801 234 5678" className="mt-1" />
                            </div>
                        </section>

                        {formError && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {formError}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={resetDialog} disabled={saving}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {saving ? "Saving…" : editingService ? "Save changes" : "Publish service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ServiceImage({ service }: { service: SellerProduct }) {
    return service.imageUrl ? (
        <img src={service.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border shrink-0" />
    ) : (
        <div className="w-12 h-12 rounded-lg border bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-teal-500" />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        archived: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>
            {status}
        </span>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
            <div className="mb-3 text-teal-600 dark:text-teal-400">{icon}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
