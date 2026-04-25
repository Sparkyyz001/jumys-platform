"use client";

import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
    name: string;
    monthly: number;
    annual: number;
    features: string[];
    badge?: string;
}

interface PricingInteractionProps {
    plans: PricingPlan[];
    currency?: string;
    onSelect?: (planIndex: number, period: "monthly" | "annual") => void;
    ctaLabel?: string;
}

export function PricingInteraction({
    plans,
    currency = "₸",
    onSelect,
    ctaLabel = "Выбрать тариф",
}: PricingInteractionProps) {
    const [active, setActive] = useState(0);
    const [period, setPeriod] = useState<0 | 1>(0);

    return (
        <div className="border border-white/10 rounded-[28px] p-3 shadow-2xl shadow-blue-500/10 max-w-md w-full flex flex-col items-center gap-3 bg-[#0c0f1f] text-white">
            {/* Period switch */}
            <div className="rounded-full relative w-full bg-white/5 p-1.5 flex items-center">
                <button
                    type="button"
                    className="font-semibold rounded-full w-full p-1.5 text-white z-20 text-sm"
                    onClick={() => setPeriod(0)}
                >
                    Месяц
                </button>
                <button
                    type="button"
                    className="font-semibold rounded-full w-full p-1.5 text-white z-20 text-sm"
                    onClick={() => setPeriod(1)}
                >
                    Год (-25%)
                </button>
                <div
                    className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
                    style={{
                        transform: `translateX(${period * 100}%)`,
                        transition: "transform 0.3s",
                    }}
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 rounded-full w-full h-full" />
                </div>
            </div>

            {/* Plans */}
            <div className="w-full relative flex flex-col items-center justify-center gap-3">
                {plans.map((plan, i) => {
                    const value = period === 0 ? plan.monthly : plan.annual;
                    const isActive = active === i;
                    return (
                        <button
                            type="button"
                            key={plan.name}
                            className={cn(
                                "w-full text-left flex flex-col gap-3 cursor-pointer border-2 p-4 rounded-2xl transition-colors",
                                isActive
                                    ? "border-blue-500 bg-blue-500/5"
                                    : "border-white/10 hover:border-white/20"
                            )}
                            onClick={() => setActive(i)}
                        >
                            <div className="w-full flex justify-between items-start">
                                <div className="flex flex-col items-start gap-0.5">
                                    <p className="font-semibold text-lg flex items-center gap-2">
                                        {plan.name}
                                        {plan.badge && (
                                            <span className="py-0.5 px-2 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-medium">
                                                {plan.badge}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                        {value === 0 ? (
                                            <span className="text-white font-medium">Бесплатно</span>
                                        ) : (
                                            <>
                                                <span className="text-white font-medium flex items-center">
                                                    <NumberFlow value={value} /> {currency}
                                                </span>
                                                <span>/мес</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "border-2 size-5 rounded-full mt-1 flex items-center justify-center transition-colors",
                                        isActive ? "border-blue-500" : "border-gray-500"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "size-2.5 bg-blue-500 rounded-full transition-opacity",
                                            isActive ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            </div>
                            {plan.features.length > 0 && (
                                <ul className="space-y-1 pt-1 border-t border-white/5">
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            className="text-xs text-gray-400 flex items-start gap-1.5"
                                        >
                                            <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => onSelect?.(active, period === 0 ? "monthly" : "annual")}
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-base text-white w-full p-3 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
                {ctaLabel}
            </button>
        </div>
    );
}
