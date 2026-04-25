"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadAvatarAction } from "@/lib/actions/settings";

interface AvatarUploaderProps {
    initialUrl: string;
    fullName?: string;
}

export function AvatarUploader({ initialUrl, fullName }: AvatarUploaderProps) {
    const [url, setUrl] = useState(initialUrl);
    const [preview, setPreview] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const onPick = () => inputRef.current?.click();

    const onFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
            toast.error("Поддерживаются только PNG, JPG, WebP, GIF");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Файл больше 5 МБ");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            try {
                const result = await uploadAvatarAction(formData);
                setUrl(result.url);
                setPreview(null);
                toast.success("Фото обновлено");
            } catch (error) {
                setPreview(null);
                toast.error(error instanceof Error ? error.message : "Не удалось загрузить фото");
            }
        });
    };

    const display = preview ?? url;
    const initials = (fullName ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join("");

    return (
        <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-black/5 bg-gradient-to-br from-primary-100 to-primary-50">
                {display ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={display}
                        alt={fullName || "avatar"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center font-semibold text-primary-700">
                        {initials || <User className="h-8 w-8" />}
                    </div>
                )}
                {pending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={onFile}
                />
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onPick}>
                        <Camera className="h-4 w-4" />
                        {pending ? "Загрузка..." : url ? "Сменить фото" : "Загрузить фото"}
                    </Button>
                    {url && !pending && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setUrl("");
                                toast.success("Фото будет удалено после сохранения");
                            }}
                        >
                            Убрать
                        </Button>
                    )}
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WebP или GIF — до 5 МБ</p>
            </div>

            <input type="hidden" name="avatar_url" value={url} />
        </div>
    );
}
