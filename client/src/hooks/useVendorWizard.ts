import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { databases, DB_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";

export function useVendorWizard() {
    const { user, reloadUserProfile } = useAuth();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);

    // --------------------------
    // INIT — sync with DB value
    // --------------------------
    useEffect(() => {
        if (!user) return;
        setStep(user.onboardingStep ?? 0);
    }, [user]);

    // --------------------------
    // SAVE PROGRESS (step only)
    // --------------------------
    const saveStep = useCallback(
        async (newStep: number) => {
            if (!user || busy) return;

            setBusy(true);
            try {
                await databases.updateDocument(
                    DB_ID,
                    USERS_COLLECTION_ID,
                    user.$id,
                    { onboardingStep: newStep }
                );

                await reloadUserProfile(); // sync global state
                setStep(newStep);
            } finally {
                setBusy(false);
            }
        },
        [user, busy, reloadUserProfile]
    );

    // --------------------------
    // SAVE FORM DATA (step + data)
    // --------------------------
    const saveData = useCallback(
        async (payload: Record<string, any>, nextStep?: number) => {
            if (!user || busy) return;

            setLoading(true);

            try {
                await databases.updateDocument(
                    DB_ID,
                    USERS_COLLECTION_ID,
                    user.$id,
                    {
                        ...payload,
                        ...(nextStep !== undefined
                            ? { onboardingStep: nextStep }
                            : {})
                    }
                );

                await reloadUserProfile();
                if (nextStep !== undefined) setStep(nextStep);
            } finally {
                setLoading(false);
            }
        },
        [user, busy, reloadUserProfile]
    );

    // --------------------------
    // FINALIZE ONBOARDING
    // --------------------------
    const completeWizard = useCallback(async () => {
        if (!user || busy) return;

        setLoading(true);

        try {
            await databases.updateDocument(
                DB_ID,
                USERS_COLLECTION_ID,
                user.$id,
                {
                    vendorStatus: "pending", // waits for admin review
                    onboardingStep: 3
                }
            );

            await reloadUserProfile();
            setStep(3);
        } finally {
            setLoading(false);
        }
    }, [user, busy, reloadUserProfile]);

    return {
        step,
        loading,
        busy,
        saveStep,
        saveData,
        completeWizard
    };
}
