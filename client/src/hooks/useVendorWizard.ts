import { useCallback, useEffect, useState } from "react";
import { databases, DB_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "vendorWizardDraft_v1";

export function useVendorWizard() {
    const { user, reloadUserProfile } = useAuth();

    const [localDraft, setLocalDraft] = useState<Record<string, any> | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);

    // saved step presence flag (for UI to ask "Continue where you left off?")
    const [savedStep, setSavedStep] = useState<number | null>(null);
    const [hasSavedProgress, setHasSavedProgress] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setLocalDraft(parsed);
                setHasSavedProgress(true);
                setSavedStep(
                    typeof parsed.step === "number" ? parsed.step : null
                );
                return;
            }

            if (user) {
                const seed = {
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
                    logoFileId:
                        user.logo ??
                        user.profile?.vendorProfile?.logoFileId ??
                        null,
                    bannerFileId:
                        user.coverImage ??
                        user.profile?.vendorProfile?.bannerFileId ??
                        null,
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
        (partial: Record<string, any>) => {
            const next = { ...(localDraft ?? {}), ...partial };
            setLocalDraft(next);
            try {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
                setHasSavedProgress(true);
                setSavedStep(typeof next.step === "number" ? next.step : null);
            } catch (err) {
                console.warn(
                    "Failed to write localStorage vendorWizardDraft",
                    err
                );
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
        async (
            opts: {
                uploadFn?: (file: File, filename?: string) => Promise<string>;
                onProgress?: (p: number) => void;
            } = {}
        ) => {
            if (!user) throw new Error("Not authenticated");
            setBusy(true);
            setLoading(true);

            try {
                const draft = localDraft ?? {};

                let logoFileId = draft.logoFileId ?? null;
                let bannerFileId = draft.bannerFileId ?? null;

                if (draft.logoFile && typeof opts.uploadFn === "function") {
                    logoFileId = await opts.uploadFn(
                        draft.logoFile,
                        `vendor-logo-${user.$id}`
                    );
                }
                if (draft.bannerFile && typeof opts.uploadFn === "function") {
                    bannerFileId = await opts.uploadFn(
                        draft.bannerFile,
                        `vendor-banner-${user.$id}`
                    );
                }

                const payload: Record<string, any> = {
                    role: "vendor",
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

                    // statuses per user's choice
                    vendorStatus: "pending",
                    storeStatus: "closed",
                    verificationStatus: "unverified",
                    onboardingStep: 99
                };

                await databases.updateDocument(
                    DB_ID,
                    USERS_COLLECTION_ID,
                    user.$id,
                    payload
                );

                clearLocal();

                try {
                    await reloadUserProfile();
                } catch (err) {
                    console.warn(
                        "reloadUserProfile failed after finalSubmit",
                        err
                    );
                }

                setLoading(false);
                setBusy(false);
                return { ok: true };
            } catch (err) {
                console.error("finalSubmit error:", err);
                setLoading(false);
                setBusy(false);
                throw err;
            }
        },
        [user, localDraft, clearLocal, reloadUserProfile]
    );

    const setStep = useCallback(
        (step: number) => {
            return saveLocal({ step });
        },
        [saveLocal]
    );

    return {
        localDraft,
        saveLocal,
        clearLocal,
        finalSubmit,
        loading,
        busy,
        // helpers for UI behavior
        hasSavedProgress,
        savedStep,
        setStep
    };
}
