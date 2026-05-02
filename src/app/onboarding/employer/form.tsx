"use client";

import { useForm, Controller } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { AKTAU_DISTRICTS } from "@/lib/constants";
import { submitEmployerAction, type EmployerInput } from "@/lib/actions/onboarding";

export function EmployerOnboardingForm() {
    const [pending, startTransition] = useTransition();
    const {
        register, handleSubmit, control, formState: { errors }
    } = useForm<EmployerInput>({
        defaultValues: {
            full_name: "", phone: "", company_name: "",
            company_type: "", district: ""
        }
    });

    const onSubmit = handleSubmit((data) => {
        startTransition(async () => {
            try {
                await submitEmployerAction(data);
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Не удалось сохранить");
            }
        });
    });

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <Label htmlFor="full_name">Ваше имя</Label>
                <Input id="full_name" {...register("full_name", { required: "Укажите имя" })} />
                {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 ..." {...register("phone", { required: "Укажите телефон" })} />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <Label htmlFor="company_name">Название компании</Label>
                <Input id="company_name" {...register("company_name", { required: "Укажите компанию" })} />
                {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name.message}</p>}
            </div>

            <div>
                <Label htmlFor="company_type">Тип компании</Label>
                <Input
                    id="company_type"
                    placeholder="например: кафе, стройка, розница, IT..."
                    {...register("company_type")}
                />
            </div>

            <div>
                <Label htmlFor="district">Район офиса (опционально)</Label>
                <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="district">
                                <SelectValue placeholder="Выберите район" />
                            </SelectTrigger>
                            <SelectContent>
                                {AKTAU_DISTRICTS.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60"
            >
                {pending ? "Сохранение..." : "Сохранить и продолжить"}
            </button>
        </form>
    );
}
