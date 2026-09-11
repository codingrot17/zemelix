import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Check,
    Store,
    Palette,
    FileText,
    ArrowRight,
    ArrowLeft,
    Upload,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Search
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    databases,
    storage,
    DB_ID,
    USERS_COLLECTION_ID,
    STORAGE_BUCKET_ID,
    ID
} from "@/lib/appwrite";
import {
    vendorTypeOptions,
    type BusinessCategory
} from "@/data/businessCategories";

import {
    listCategories,
    findCategories
} from "@/services/category.service";

const steps = [
    { id: 0, title: "Business Type", icon: Store },
    { id: 1, title: "Business Info", icon: FileText },
    { id: 2, title: "Branding", icon: Palette },
    { id: 3, title: "Review", icon: Check }
];

const LOCAL_STORAGE_KEY = "vendor_wizard_draft_v2";

// ─── Types ─────────────────────────────────────────────────────────────────────
// Renamed from FormData → VendorFormData to avoid conflict with browser built-in
interface VendorFormData {
    vendorType: string;
    businessName: string;
    businessCategory: string;
    businessDescription: string;
    slogan: string;
    primaryColor: string;
    socialLinks: {
        website: string;
        facebook: string;
        instagram: string;
        twitter: string;
    };
}

export default function VendorWizard() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<VendorFormData>({
        vendorType: "",
        businessName: "",
        businessCategory: "",
        businessDescription: "",
        slogan: "",
        primaryColor: "#6366f1",
        socialLinks: { website: "", facebook: "", instagram: "", twitter: "" }
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
                setCurrentStep(parsed.step ?? 0);
            }
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({ ...formData, step: currentStep })
            );
        } catch {}
    }, [formData, currentStep]);

    const updateField = (field: keyof VendorFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const updateSocialLink = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError("Logo must be less than 2MB");
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleLogoRemove = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Banner must be less than 5MB");
            return;
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleBannerRemove = () => {
        setBannerFile(null);
        setBannerPreview(null);
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0:
                if (!formData.vendorType) {
                    setError("Please select a business type");
                    return false;
                }
                return true;
            case 1:
                if (!formData.businessName.trim()) {
                    setError("Business name is required");
                    return false;
                }
                if (formData.businessName.trim().length < 2) {
                    setError("Business name must be at least 2 characters");
                    return false;
                }
                if (!formData.businessCategory) {
                    setError("Please select a business category");
                    return false;
                }
                if (!formData.businessDescription.trim()) {
                    setError("Business description is required");
                    return false;
                }
                if (formData.businessDescription.trim().length < 20) {
                    setError("Description must be at least 20 characters");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;
        setCurrentStep(prev => Math.min(prev + 1, 3));
        setError(null);
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!user) {
            setError("User not authenticated");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            let logoFileId: string | null = null;
            let bannerFileId: string | null = null;

            if (logoFile) {
                const res = await storage.createFile(
                    STORAGE_BUCKET_ID,
                    ID.unique(),
                    logoFile
                );
                logoFileId = res.$id;
            }
            if (bannerFile) {
                const res = await storage.createFile(
                    STORAGE_BUCKET_ID,
                    ID.unique(),
                    bannerFile
                );
                bannerFileId = res.$id;
            }

            await databases.updateDocument(
                DB_ID,
                USERS_COLLECTION_ID,
                user.$id,
                {
                    role: "seller",
                    vendorType: formData.vendorType,
                    businessCategory: formData.businessCategory,
                    businessName: formData.businessName,
                    businessDescription: formData.businessDescription,
                    slogan: formData.slogan || null,
                    logo: logoFileId,
                    coverImage: bannerFileId,
                    primaryColor: formData.primaryColor,
                    socialLinks: JSON.stringify(formData.socialLinks),
                    vendorStatus: "pending",
                    storeStatus: "closed",
                    onboardingStep: 99,
                    currency: "NGN",
                    subscriptionPlan: "free",
                    accountStatus: "active"
                }
            );

            await refreshUser();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err: any) {
            console.error("Vendor setup failed:", err);
            setError(
                err.message || "Failed to complete setup. Please try again."
            );
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
                <div className="text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Aboard! 🎉
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your vendor account has been created successfully.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 p-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            const isCompleted = idx < currentStep;
                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center flex-1 relative"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all z-10
                                        ${isCompleted ? "bg-green-500 border-green-500 text-white" : ""}
                                        ${isActive ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg" : ""}
                                        ${!isActive && !isCompleted ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400" : ""}
                                    `}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <Icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium text-center ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-gray-500"}`}
                                    >
                                        {step.title}
                                    </span>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`hidden sm:block absolute top-6 left-1/2 w-full h-0.5 -z-0 ${isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 flex-1">
                            {error}
                        </p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 min-h-[500px] flex flex-col">
                    <div className="flex-1">
                        {currentStep === 0 && (
                            <StepBusinessType
                                formData={formData}
                                updateField={updateField}
                            />
                        )}
                        {currentStep === 1 && (
                            <StepBusinessInfo
                                formData={formData}
                                updateField={updateField}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepBranding
                                formData={formData}
                                updateField={updateField}
                                updateSocialLink={updateSocialLink}
                                logoPreview={logoPreview}
                                bannerPreview={bannerPreview}
                                onLogoChange={handleLogoChange}
                                onLogoRemove={handleLogoRemove}
                                onBannerChange={handleBannerChange}
                                onBannerRemove={handleBannerRemove}
                            />
                        )}
                        {currentStep === 3 && (
                            <StepReview
                                formData={formData}
                                logoPreview={logoPreview}
                                bannerPreview={bannerPreview}
                            />
                        )}
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Complete Setup"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Step 1: Business Type ──────────────────────────────────────────────────────
function StepBusinessType({
    formData,
    updateField
}: {
    formData: VendorFormData;
    updateField: (field: keyof VendorFormData, value: any) => void;
}) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                What type of vendor are you?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the option that best describes your business
            </p>
            <div className="grid gap-4">
                {vendorTypeOptions.map(type => (
                    <button
                        key={type.id}
                        onClick={() => updateField("vendorType", type.id)}
                        className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg
                            ${formData.vendorType === type.id ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"}`}
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">{type.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                                    {type.label}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {type.description}
                                </p>
                            </div>
                            {formData.vendorType === type.id && (
                                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Step 2: Business Info ──────────────────────────────────────────────────────
function StepBusinessInfo({
    formData,
    updateField
}: {
    formData: VendorFormData;
    updateField: (field: keyof VendorFormData, value: any) => void;
}) {
    const [categorySearch, setCategorySearch] = useState("");
    const [filteredCategories, setFilteredCategories] = useState<
        BusinessCategory[]
    >([]);

    useEffect(() => {
        const base = formData.vendorType
            ? listCategories(formData.vendorType)
            : [];
        setFilteredCategories(base);
    }, [formData.vendorType]);

    useEffect(() => {
        if (categorySearch.trim()) {
            setFilteredCategories(
                findCategories(categorySearch, formData.vendorType)
            );
        } else {
            setFilteredCategories(
                formData.vendorType
                    ? listCategories(formData.vendorType)
                    : []
            );
        }
    }, [categorySearch, formData.vendorType]);

    const selectedCatName = filteredCategories.find(
        c => c.id === formData.businessCategory
    )?.name;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Tell us about your business
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                This information will appear on your store profile
            </p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Business Name *
                    </label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={e =>
                            updateField("businessName", e.target.value)
                        }
                        placeholder="e.g. Elegant Threads"
                        maxLength={100}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.businessName.length}/100
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Business Category *
                    </label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={categorySearch}
                            onChange={e => setCategorySearch(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                        {filteredCategories.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No categories found
                            </div>
                        ) : (
                            filteredCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        updateField("businessCategory", cat.id);
                                        setCategorySearch("");
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${formData.businessCategory === cat.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                                >
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                                        {cat.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {cat.description}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    {formData.businessCategory && selectedCatName && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Selected:{" "}
                            {selectedCatName}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Business Description *
                    </label>
                    <textarea
                        value={formData.businessDescription}
                        onChange={e =>
                            updateField("businessDescription", e.target.value)
                        }
                        placeholder="Describe what makes your business unique..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.businessDescription.length}/500 (min 20)
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        Business Slogan (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.slogan}
                        onChange={e => updateField("slogan", e.target.value)}
                        placeholder="e.g. Quality you can trust"
                        maxLength={100}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Step 3: Branding ───────────────────────────────────────────────────────────
interface StepBrandingProps {
    formData: VendorFormData;
    updateField: (field: keyof VendorFormData, value: any) => void;
    updateSocialLink: (platform: string, value: string) => void;
    logoPreview: string | null;
    bannerPreview: string | null;
    onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLogoRemove: () => void;
    onBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBannerRemove: () => void;
}

function StepBranding({
    formData,
    updateField,
    updateSocialLink,
    logoPreview,
    bannerPreview,
    onLogoChange,
    onLogoRemove,
    onBannerChange,
    onBannerRemove
}: StepBrandingProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Brand Your Store
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload your logo and customise your brand colours
            </p>
            <div className="space-y-6">
                {/* Logo */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Logo (Optional)
                    </label>
                    <div className="flex items-start gap-4">
                        {logoPreview ? (
                            <div className="relative">
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={onLogoRemove}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onLogoChange}
                                    className="hidden"
                                />
                                <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-indigo-500 transition">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                            </label>
                        )}
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Upload your business logo
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG up to 2MB. Square format recommended.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Banner */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Cover Banner (Optional)
                    </label>
                    {bannerPreview ? (
                        <div className="relative">
                            <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={onBannerRemove}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onBannerChange}
                                className="hidden"
                            />
                            <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 transition">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to upload banner
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG up to 5MB. 16:9 ratio recommended.
                                </p>
                            </div>
                        </label>
                    )}
                </div>
                {/* Brand Colour */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Primary Brand Colour
                    </label>
                    <div className="flex gap-3 items-center">
                        <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={e =>
                                updateField("primaryColor", e.target.value)
                            }
                            className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={e =>
                                updateField("primaryColor", e.target.value)
                            }
                            placeholder="#6366f1"
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        />
                    </div>
                </div>
                {/* Social Links */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Social Media Links (Optional)
                    </label>
                    <div className="space-y-3">
                        {(
                            [
                                "website",
                                "facebook",
                                "instagram",
                                "twitter"
                            ] as const
                        ).map(platform => (
                            <input
                                key={platform}
                                type="url"
                                value={formData.socialLinks[platform]}
                                onChange={e =>
                                    updateSocialLink(platform, e.target.value)
                                }
                                placeholder={`https://${platform === "website" ? "yoursite.com" : platform + ".com/yourpage"}`}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Step 4: Review ─────────────────────────────────────────────────────────────
function StepReview({
    formData,
    logoPreview,
    bannerPreview
}: {
    formData: VendorFormData;
    logoPreview: string | null;
    bannerPreview: string | null;
}) {
    const selectedType = vendorTypeOptions.find(
        t => t.id === formData.vendorType
    );
    const selectedCategory = listCategories(formData.vendorType).find(
        c => c.id === formData.businessCategory
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Review Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please confirm everything looks correct before submitting
            </p>
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                    {bannerPreview && (
                        <img
                            src={bannerPreview}
                            alt="Banner"
                            className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                    )}
                    <div className="flex items-start gap-4 mb-4">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-20 h-20 rounded-lg object-cover border-2"
                                style={{ borderColor: formData.primaryColor }}
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                                style={{
                                    backgroundColor: formData.primaryColor
                                }}
                            >
                                {formData.businessName
                                    .charAt(0)
                                    .toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {formData.businessName || "Your Business Name"}
                            </h3>
                            {formData.slogan && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                                    "{formData.slogan}"
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                {selectedType && (
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                        {selectedType.label}
                                    </span>
                                )}
                                {selectedCategory && (
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {selectedCategory.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {formData.businessDescription}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
                    <DetailRow
                        label="Vendor Type"
                        value={selectedType?.label || "Not set"}
                    />
                    <DetailRow
                        label="Business Name"
                        value={formData.businessName || "Not set"}
                    />
                    <DetailRow
                        label="Category"
                        value={selectedCategory?.name || "Not set"}
                    />
                    <DetailRow
                        label="Description"
                        value={formData.businessDescription || "Not set"}
                        fullWidth
                    />
                    {formData.slogan && (
                        <DetailRow label="Slogan" value={formData.slogan} />
                    )}
                    <DetailRow
                        label="Brand Colour"
                        value={
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded border"
                                    style={{
                                        backgroundColor: formData.primaryColor
                                    }}
                                />
                                <span className="font-mono text-sm">
                                    {formData.primaryColor}
                                </span>
                            </div>
                        }
                    />
                    <DetailRow
                        label="Logo"
                        value={logoPreview ? "✅ Uploaded" : "Not uploaded"}
                    />
                    <DetailRow
                        label="Banner"
                        value={bannerPreview ? "✅ Uploaded" : "Not uploaded"}
                    />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                Important Information
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                After submission, your vendor account will be
                                pending review. You'll receive an email
                                notification once approved. This typically takes
                                1–2 business days.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    fullWidth = false
}: {
    label: string;
    value: React.ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <div className={fullWidth ? "col-span-2" : ""}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {label}
            </div>
            <div className="text-sm text-gray-900 dark:text-white">{value}</div>
        </div>
    );
}
