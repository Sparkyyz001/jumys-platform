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

const inputCls = "focus-visible:ring-amber-500/25 focus-visible:border-amber-500/50 transition-colors duration-200";

export function SettingsForm(props: SettingsFormProps) {
    const [pending, startTransition] = useTransition();
    const [passwordPending, startPasswordTransition] = useTransition();
    const [telegramPending, startTelegramTransition] = useTransition();
    const [password, setPassword] = useState("");

    return (
        <div className="space-y-6">
            <form
                className="space-y-5"
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

                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                <div>
                    <Label htmlFor="full_name">Имя</Label>
                    <Input id="full_name" name="full_name" defaultValue={props.fullName} required className={inputCls} />
                </div>

                <div>
                    <Label htmlFor="about">Описание профиля</Label>
                    <Textarea id="about" name="about" defaultValue={props.about} rows={4} className={inputCls} />
                </div>

                <div>
                    <Label htmlFor="telegram_username">Telegram Username</Label>
                    <Input id="telegram_username" name="telegram_username" defaultValue={props.telegramUsername} placeholder="@username" className={inputCls} />
                </div>

                {/* Telegram status card */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3 hover:border-amber-500/20 transition-all duration-200">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                        {props.telegramConnected ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                Telegram подключён
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-50" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
                                </span>
                                Telegram не подключён
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {props.telegramConnected
                            ? "Уведомления о вакансиях/откликах приходят в Telegram. Можно переподключить с другого аккаунта."
                            : "Откроется бот Jumys, после /start привязка завершится автоматически."}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={telegramPending}
                        className="hover:border-amber-500/40 hover:text-amber-200 transition-all"
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
                    <Input id="seeker_iin" name="seeker_iin" defaultValue={props.seekerIin} className={inputCls} />
                </div>

                {props.role === "employer" && (
                    <>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        <div>
                            <Label htmlFor="company_name">Название компании</Label>
                            <Input id="company_name" name="company_name" defaultValue={props.companyName} className={inputCls} />
                        </div>
                        <div>
                            <Label htmlFor="company_bin_iin">BIN / IIN</Label>
                            <Input id="company_bin_iin" name="company_bin_iin" defaultValue={props.companyBinIin} className={inputCls} />
                        </div>
                        <div>
                            <Label htmlFor="company_description">Описание компании</Label>
                            <Textarea id="company_description" name="company_description" defaultValue={props.companyDescription} rows={3} className={inputCls} />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {pending ? "Сохранение..." : "Сохранить настройки"}
                </button>
            </form>

            {/* Password section */}
            <form
                className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-amber-500/15 transition-all duration-200"
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
                <p className="text-sm font-semibold text-zinc-200">Изменить пароль</p>
                <Label htmlFor="password">Новый пароль</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                    className={inputCls}
                />
                <Button
                    type="submit"
                    variant="outline"
                    disabled={passwordPending}
                    className="hover:border-amber-500/40 hover:text-amber-200 transition-all"
                >
                    {passwordPending ? "Обновление..." : "Обновить пароль"}
                </Button>
            </form>
        </div>
    );
}
