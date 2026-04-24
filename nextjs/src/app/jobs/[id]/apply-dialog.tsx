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
                <Button size="lg">Откликнуться</Button>
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
                    <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button onClick={submit} disabled={pending}>
                        {pending ? "Отправка..." : "Отправить отклик"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
