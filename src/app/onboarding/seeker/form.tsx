"use client";

import { useForm, Controller } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { TagInput } from "@/components/TagInput";
import { AKTAU_DISTRICTS, EMPLOYMENT_TYPES } from "@/lib/constants";
import { submitSeekerAction, type SeekerInput } from "@/lib/actions/onboarding";

export function SeekerOnboardingForm() {
    const [pending, startTransition] = useTransition();
    const {
        register, handleSubmit, control, formState: { errors }
    } = useForm<SeekerInput>({
        defaultValues: {
            full_name: "", phone: "", district: "", skills: [],
            experience_years: 0, desired_employment: "full", about: ""
        }
    });

    const onSubmit = handleSubmit((data) => {
        startTransition(async () => {
            try {
                await submitSeekerAction({
                    ...data,
                    experience_years: Number(data.experience_years) || 0,
                });
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Не удалось сохранить");
            }
        });
    });

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <Label htmlFor="full_name">ФИО</Label>
                <Input id="full_name" {...register("full_name", { required: "Укажите имя" })} />
                {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 ..." {...register("phone", { required: "Укажите телефон" })} />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <Label htmlFor="district">Район проживания</Label>
                <Controller
                    name="district"
                    control={control}
                    rules={{ required: "Выберите район" }}
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
                {errors.district && <p className="text-xs text-red-600 mt-1">{errors.district.message}</p>}
            </div>

            <div>
                <Label htmlFor="skills">Навыки</Label>
                <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                        <TagInput
                            id="skills"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Например: сварщик, повар, водитель..."
                        />
                    )}
                />
            </div>

            <div>
                <Label htmlFor="experience_years">Опыт работы (лет)</Label>
                <Input
                    id="experience_years"
                    type="number"
                    min={0}
                    max={60}
                    {...register("experience_years", { valueAsNumber: true })}
                />
            </div>

            <div>
                <Label>Желаемая занятость</Label>
                <Controller
                    name="desired_employment"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-3 gap-2 mt-1"
                        >
                            {EMPLOYMENT_TYPES.map(opt => (
                                <label
                                    key={opt.value}
                                    className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                    <RadioGroupItem value={opt.value} />
                                    <span className="text-sm">{opt.label}</span>
                                </label>
                            ))}
                        </RadioGroup>
                    )}
                />
            </div>

            <div>
                <Label htmlFor="about">О себе</Label>
                <Textarea
                    id="about"
                    rows={5}
                    placeholder="Кратко о вашем опыте, образовании, предпочтениях..."
                    {...register("about")}
                />
            </div>

            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Сохранение..." : "Сохранить и продолжить"}
            </Button>
        </form>
    );
}
