"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMatchExplanationAction } from "@/lib/actions/matching";

interface ExplainMatchButtonProps {
    jobId: string;
    seekerId: string;
    similarity: number;
    label?: string;
}

export function ExplainMatchButton({
    jobId, seekerId, similarity, label
}: ExplainMatchButtonProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const load = () => {
        if (explanation) {
            setExplanation(null);
            return;
        }
        startTransition(async () => {
            try {
                const text = await getMatchExplanationAction(jobId, seekerId, similarity);
                setExplanation(text);
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Не удалось получить объяснение");
            }
        });
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                size="sm"
                onClick={load}
                disabled={pending}
                className="gap-1.5"
            >
                {pending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                )}
                {label ?? "Почему этот матч?"}
            </Button>
            {explanation && (
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription className="ml-2">{explanation}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
