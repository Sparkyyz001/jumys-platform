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
import {
    AKTAU_DISTRICTS, JOB_CATEGORIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS
} from "@/lib/constants";
import { createJobAction, type JobInput } from "@/lib/actions/jobs";

export function JobForm() {
    const [pending, startTransition] = useTransition();
    const {
        register, handleSubmit, control, formState: { errors }
    } = useForm<JobInput>({
        defaultValues: {
            title: "", description: "", category: "", district: "",
            employment: "full", experience_required: "none",
            salary_from: null, salary_to: null, skills_required: [],
        }
    });

    const onSubmit = handleSubmit((data) => {
        startTransition(async () => {
            try {
                await createJobAction({
                    ...data,
                    salary_from: data.salary_from ? Number(data.salary_from) : null,
                    salary_to: data.salary_to ? Number(data.salary_to) : null,
                });
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Ошибка");
            }
        });
    });

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <Label htmlFor="title">Название</Label>
                <Input
                    id="title"
                    placeholder="Например: Повар на мангал"
                    {...register("title", { required: "Укажите название" })}
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                    id="description"
                    rows={6}
                    placeholder="Обязанности, условия, график работы..."
                    {...register("description", { required: "Добавьте описание", minLength: 20 })}
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">
                    {errors.description.message ?? "Минимум 20 символов"}
                </p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Категория</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    {JOB_CATEGORIES.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div>
                    <Label htmlFor="district">Район</Label>
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
            </div>

            <div>
                <Label>Тип занятости</Label>
                <Controller
                    name="employment"
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
                                    className="flex items-center gap-2 p-3 border border-white/[0.08] rounded-xl cursor-pointer text-zinc-300 hover:bg-amber-500/[0.07] hover:border-amber-500/30 hover:text-amber-100 transition-all"
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
                <Label htmlFor="experience_required">Требуемый опыт</Label>
                <Controller
                    name="experience_required"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="experience_required">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPERIENCE_LEVELS.map(l => (
                                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="salary_from">Зарплата от (₸)</Label>
                    <Input
                        id="salary_from"
                        type="number"
                        min={0}
                        placeholder="200000"
                        {...register("salary_from", { setValueAs: v => v === "" ? null : Number(v) })}
                    />
                </div>
                <div>
                    <Label htmlFor="salary_to">Зарплата до (₸)</Label>
                    <Input
                        id="salary_to"
                        type="number"
                        min={0}
                        placeholder="400000"
                        {...register("salary_to", { setValueAs: v => v === "" ? null : Number(v) })}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="skills_required">Необходимые навыки</Label>
                <Controller
                    name="skills_required"
                    control={control}
                    render={({ field }) => (
                        <TagInput
                            id="skills_required"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Введите и нажмите Enter"
                        />
                    )}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {pending ? "Публикация..." : "Опубликовать вакансию"}
            </button>
        </form>
    );
}
