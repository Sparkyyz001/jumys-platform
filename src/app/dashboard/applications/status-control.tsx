"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/lib/types";

export function ApplicationStatusControl({
    applicationId, status,
}: {
    applicationId: string;
    status: ApplicationStatus;
}) {
    const [pending, startTransition] = useTransition();

    const onChange = (next: string) => {
        startTransition(async () => {
            try {
                await updateApplicationStatusAction(
                    applicationId,
                    next as ApplicationStatus
                );
                toast.success("Статус обновлён");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Ошибка");
            }
        });
    };

    return (
        <Select value={status} onValueChange={onChange} disabled={pending}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {APPLICATION_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
