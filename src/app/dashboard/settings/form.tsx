"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUploader } from "@/components/AvatarUploader";
import { createTelegramLinkAction, updatePasswordAction, updateSettingsAction } from "@/lib/actions/settings";

interface SettingsFormProps {
    role: "employer" | "seeker";
    fullName: string;
    about: string;
    telegramUsername: string;
    avatarUrl: string;
    companyName: string;
    companyBinIin: string;
    companyDescription: string;
    seekerIin: string;
    telegramConnected: boolean;
}

export function SettingsForm(props: SettingsFormProps) {
    const [pending, startTransition] = useTransition();
    const [passwordPending, startPasswordTransition] = useTransition();
    const [telegramPending, startTelegramTransition] = useTransition();
    const [password, setPassword] = useState("");

    return (
        <div className="space-y-6">
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    startTransition(async () => {
                        try {
                            await updateSettingsAction({
                                full_name: String(formData.get("full_name") ?? ""),
                                about: String(formData.get("about") ?? ""),
                                avatar_url: String(formData.get("avatar_url") ?? ""),
                                telegram_username: String(formData.get("telegram_username") ?? ""),
                                company_name: String(formData.get("company_name") ?? ""),
                                company_bin_iin: String(formData.get("company_bin_iin") ?? ""),
                                company_description: String(formData.get("company_description") ?? ""),
                                seeker_iin: String(formData.get("seeker_iin") ?? ""),
                            });
                            toast.success("Настройки сохранены");
                        } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Ошибка сохранения");
                        }
                    });
                }}
            >
                <div>
                    <Label>Фото профиля</Label>
                    <div className="mt-2">
                        <AvatarUploader initialUrl={props.avatarUrl} fullName={props.fullName} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="full_name">Имя</Label>
                    <Input id="full_name" name="full_name" defaultValue={props.fullName} required />
                </div>

                <div>
                    <Label htmlFor="about">Описание профиля</Label>
                    <Textarea id="about" name="about" defaultValue={props.about} rows={4} />
                </div>

                <div>
                    <Label htmlFor="telegram_username">Telegram Username</Label>
                    <Input id="telegram_username" name="telegram_username" defaultValue={props.telegramUsername} placeholder="@username" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                        {props.telegramConnected
                            ? <span className="inline-flex items-center gap-1.5 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />Telegram подключён</span>
                            : <span className="inline-flex items-center gap-1.5 text-amber-300"><span className="h-2 w-2 rounded-full bg-amber-300" />Telegram не подключён</span>
                        }
                    </p>
                    <p className="text-xs text-gray-400">
                        {props.telegramConnected
                            ? "Уведомления о вакансиях/откликах приходят в Telegram. Можно переподключить с другого аккаунта."
                            : "Откроется бот Jumys, после /start привязка завершится автоматически."}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={telegramPending}
                        onClick={() => {
                            startTelegramTransition(async () => {
                                try {
                                    const { url } = await createTelegramLinkAction();
                                    window.open(url, "_blank", "noopener,noreferrer");
                                    toast.success("Открыл Telegram-бота для подтверждения");
                                } catch (error) {
                                    toast.error(error instanceof Error ? error.message : "Не удалось открыть Telegram");
                                }
                            });
                        }}
                    >
                        {telegramPending ? "Подготовка ссылки..." : (props.telegramConnected ? "Переподключить Telegram" : "Подключить Telegram")}
                    </Button>
                </div>

                <div>
                    <Label htmlFor="seeker_iin">IIN (для проверки личности соискателя)</Label>
                    <Input id="seeker_iin" name="seeker_iin" defaultValue={props.seekerIin} />
                </div>

                {props.role === "employer" && (
                    <>
                        <div>
                            <Label htmlFor="company_name">Название компании</Label>
                            <Input id="company_name" name="company_name" defaultValue={props.companyName} />
                        </div>
                        <div>
                            <Label htmlFor="company_bin_iin">BIN / IIN</Label>
                            <Input id="company_bin_iin" name="company_bin_iin" defaultValue={props.companyBinIin} />
                        </div>
                        <div>
                            <Label htmlFor="company_description">Описание компании</Label>
                            <Textarea id="company_description" name="company_description" defaultValue={props.companyDescription} rows={3} />
                        </div>
                    </>
                )}

                <Button type="submit" disabled={pending}>{pending ? "Сохранение..." : "Сохранить настройки"}</Button>
            </form>

            <form
                className="space-y-3 border-t pt-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    startPasswordTransition(async () => {
                        try {
                            await updatePasswordAction({ password });
                            setPassword("");
                            toast.success("Пароль обновлен");
                        } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Ошибка обновления пароля");
                        }
                    });
                }}
            >
                <Label htmlFor="password">Новый пароль</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
                <Button type="submit" variant="outline" disabled={passwordPending}>
                    {passwordPending ? "Обновление..." : "Обновить пароль"}
                </Button>
            </form>
        </div>
    );
}
