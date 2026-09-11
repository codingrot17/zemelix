import { useCallback, useEffect, useState } from "react";
import { updateVendorProfile } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "vendorWizardDraft_v1";

type VendorWizardDraft = {
    step?: number;
    vendorType?: string | null;
    businessCategory?: string | null;
    businessName?: string | null;
    businessDescription?: string | null;
    socialLinks?: string | Record<string, string> | null;
    primaryColor?: string | null;
    logoFileId?: string | null;
    bannerFileId?: string | null;
    slogan?: string | null;
    logoFile?: File;
    bannerFile?: File;
};

export function useVendorWizard() {
    const { user, reloadUserProfile } = useAuth();

    const [localDraft, setLocalDraft] = useState<VendorWizardDraft | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);

    // UI helper
    const [savedStep, setSavedStep] = useState<number | null>(null);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    const isWizardComplete = user?.onboardingStep === 99;

    // Init local draft
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as VendorWizardDraft;
                setLocalDraft(parsed);
                setHasSavedProgress(true);
                setSavedStep(
                    typeof parsed.step === "number" ? parsed.step : null
                );
                return;
            }

            if (user) {
                const seed: VendorWizardDraft = {
                    step: 0,
                    vendorType:
                        user.vendorType ?? user.profile?.vendorType ?? null,
                    businessCategory:
                        user.businessCategory ??
                        user.profile?.businessCategory ??
                        null,
                    businessName:
                        user.businessName ?? user.profile?.businessName ?? null,
                    businessDescription:
                        user.businessDescription ??
                        user.profile?.businessDescription ??
                        null,
                    socialLinks:
                        user.socialLinks ?? user.profile?.socialLinks ?? {},
                    primaryColor:
                        user.primaryColor ??
                        user.profile?.primaryColor ??
                        "#1a73e8",
                    logoFileId: user.logo ?? null,
                    bannerFileId: user.coverImage ?? null,
                    slogan: user.slogan ?? user.profile?.slogan ?? null
                };
                setLocalDraft(seed);
            } else {
                setLocalDraft({ step: 0 });
            }
        } catch (err) {
            console.warn("useVendorWizard init error", err);
            setLocalDraft({ step: 0 });
        }
    }, [user]);

    const saveLocal = useCallback(
        (partial: Partial<VendorWizardDraft>) => {
            const next: VendorWizardDraft = { ...(localDraft ?? {}), ...partial };
            setLocalDraft(next);
            try {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
                setHasSavedProgress(true);
                setSavedStep(typeof next.step === "number" ? next.step : null);
            } catch (err) {
                console.warn("Failed to write vendorWizardDraft", err);
            }
            return next;
        },
        [localDraft]
    );

    const clearLocal = useCallback(() => {
        localStorage.removeItem(LOCAL_KEY);
        setLocalDraft(null);
        setHasSavedProgress(false);
        setSavedStep(null);
    }, []);

    const finalSubmit = useCallback(
        async (opts: { uploadFn?: (file: File) => Promise<string> } = {}) => {
            if (!user) throw new Error("Not authenticated");
            setBusy(true);
            setLoading(true);

            try {
                const draft = localDraft ?? {};

                let logoFileId = draft.logoFileId ?? null;
                let bannerFileId = draft.bannerFileId ?? null;

                if (draft.logoFile && opts.uploadFn) {
                    logoFileId = await opts.uploadFn(draft.logoFile);
                }
                if (draft.bannerFile && opts.uploadFn) {
                    bannerFileId = await opts.uploadFn(draft.bannerFile);
                }

                const payload = {
                    role: "vendor" as const,
                    vendorType: draft.vendorType ?? null,
                    businessCategory:
                        draft.businessCategory ?? draft.vendorType ?? null,
                    businessName: draft.businessName ?? null,
                    businessDescription: draft.businessDescription ?? null,
                    logo: logoFileId ?? null,
                    coverImage: bannerFileId ?? null,
                    primaryColor: draft.primaryColor ?? null,
                    socialLinks: draft.socialLinks ?? null,
                    slogan: draft.slogan ?? null,
                    vendorStatus: "pending" as const,
                    storeStatus: "closed" as const,
                    verificationStatus: "unverified" as const,
                    onboardingStep: 99 as const
                };

                await updateVendorProfile(user.$id, payload);

                clearLocal();
                await reloadUserProfile();

                setBusy(false);
                setLoading(false);
                return { ok: true };
            } catch (err) {
                console.error("finalSubmit error:", err);
                setBusy(false);
                setLoading(false);
                throw err;
            }
        },
        [user, localDraft, clearLocal, reloadUserProfile]
    );

    const setStep = useCallback(
        (step: number) => saveLocal({ step }),
        [saveLocal]
    );

    return {
        localDraft,
        saveLocal,
        clearLocal,
        finalSubmit,
        loading,
        busy,
        hasSavedProgress,
        savedStep,
        setStep,
        isWizardComplete
    };
}
