"use client";

import { useState, useTransition } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import type { ApplicationStatus } from "@/lib/types";

export function ContactDialog({
    applicationId, name, phone, currentStatus
}: {
    applicationId: string;
    name: string;
    phone: string;
    currentStatus: ApplicationStatus;
}) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const digits = phone.replace(/\D/g, "");
    const waUrl = `https://wa.me/${digits}`;

    const markContacted = () => {
        if (currentStatus === "contacted") return;
        startTransition(async () => {
            try {
                await updateApplicationStatusAction(applicationId, "contacted");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Не удалось обновить статус");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Phone className="h-3.5 w-3.5" />
                    Связаться
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Связаться с кандидатом</DialogTitle>
                    <DialogDescription>{name}</DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-3">
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                            href={`tel:${phone}`}
                            onClick={markContacted}
                            className="text-lg font-medium hover:underline"
                        >
                            {phone}
                        </a>
                    </div>
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={markContacted}
                        className="flex items-center gap-2 p-3 border rounded-md hover:bg-green-50 transition-colors"
                    >
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Написать в WhatsApp</span>
                    </a>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                        Закрыть
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
