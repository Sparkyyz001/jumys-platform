"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { applyToJobAction } from "@/lib/actions/applications";

interface ApplyDialogProps {
    jobId: string;
    jobTitle: string;
}

export function ApplyDialog({ jobId, jobTitle }: ApplyDialogProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [pending, startTransition] = useTransition();

    const submit = () => {
        startTransition(async () => {
            try {
                await applyToJobAction({ job_id: jobId, message });
                toast.success("Отклик отправлен");
                setOpen(false);
                setMessage("");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Не удалось отправить отклик");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all cursor-pointer">
                    Откликнуться
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Отклик на вакансию</DialogTitle>
                    <DialogDescription>{jobTitle}</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Label htmlFor="message">Сопроводительное сообщение</Label>
                    <Textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Кратко расскажите, почему вы подходите..."
                        className="mt-1"
                    />
                </div>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-zinc-100 transition-all cursor-pointer"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={pending}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {pending ? "Отправка..." : "Отправить отклик"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
