"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { archiveJobAction, restoreJobAction } from "@/lib/actions/jobs";

export function JobActions({ jobId, isActive }: { jobId: string; isActive: boolean }) {
    const [pending, startTransition] = useTransition();

    const toggle = () => {
        startTransition(async () => {
            try {
                if (isActive) {
                    await archiveJobAction(jobId);
                    toast.success("Вакансия архивирована");
                } else {
                    await restoreJobAction(jobId);
                    toast.success("Вакансия восстановлена");
                }
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Ошибка");
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={toggle}
        >
            {isActive ? (
                <>
                    <Archive className="h-4 w-4" />
                    В архив
                </>
            ) : (
                <>
                    <ArchiveRestore className="h-4 w-4" />
                    Восстановить
                </>
            )}
        </Button>
    );
}
