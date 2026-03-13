import React from "react";
import { useNavigate } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
    title: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
    icon?: React.ReactNode;
}

export default function ComingSoon({
    title,
    description = "This section is under construction. Check back soon.",
    backTo,
    backLabel = "Go Back",
    icon
}: ComingSoonProps) {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-16">
            <div className="mb-4 text-indigo-400 opacity-60">
                {icon ?? <Construction className="w-12 h-12" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {description}
            </p>
            <Button
                variant="outline"
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
                {backLabel}
            </Button>
        </div>
    );
}
