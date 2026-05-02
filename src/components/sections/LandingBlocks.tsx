"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Briefcase, Building2, Check, ChevronDown, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

/* ── Letter-by-letter reveal ─────────────────────────────────────────── */
function LetterReveal({ text, className }: { text: string; className?: string }) {
    return (
        <span aria-label={text} className={className}>
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.38, delay: i * 0.028, ease: "easeOut" }}
                    style={{ display: char === " " ? "inline" : "inline-block" }}
                >
                    {char === " " ? "\u00a0" : char}
                </motion.span>
            ))}
        </span>
    );
}

/* ── Liquid-glass feature card with 3-D tilt + warm cursor glow ──────── */
function LiquidFeatureCard({
    icon: Icon,
    title,
    text,
    delay = 0,
}: {
    icon: React.ElementType;
    title: string;
    text: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [14, -14]), { stiffness: 260, damping: 28 });
    const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-14, 14]), { stiffness: 260, damping: 28 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        rawX.set((e.clientX - r.left) / r.width - 0.5);
        rawY.set((e.clientY - r.top) / r.height - 0.5);
        setGlowPos({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
        });
    }

    function handleMouseLeave() {
        rawX.set(0);
        rawY.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            initial={{ opacity: 0, scale: 0.92, y: 22 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.58, delay, ease: [0.23, 1, 0.32, 1] }}
            className="group relative cursor-default"
        >
            {/* Outer warm halo */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(240px circle at ${glowPos.x}% ${glowPos.y}%, rgba(251,146,60,0.20), transparent 70%)`,
                }}
            />

            {/* Card body */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl">
                {/* Static inner sheen */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />

                {/* Cursor-tracked inner warm glow */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(180px circle at ${glowPos.x}% ${glowPos.y}%, rgba(251,146,60,0.12), transparent 70%)`,
                    }}
                />

                {/* Content lifted in Z */}
                <div className="relative p-7" style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}>
                    <div className="flex size-11 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-400/[0.08] text-orange-300 shadow-[0_0_22px_rgba(251,146,60,0.18)] transition-shadow duration-300 group-hover:shadow-[0_0_36px_rgba(251,146,60,0.32)]">
                        <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-medium tracking-tight text-zinc-100">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
                </div>
            </div>
        </motion.div>
    );
}

interface LandingBlocksProps {
    signedIn: boolean;
    activeJobsCount: number;
    seekersCount: number;
    applicationsLastWeek: number;
}

export function LandingBlocks(props: LandingBlocksProps) {
    const { activeJobsCount, seekersCount, applicationsLastWeek } = props;
    const { t } = useI18n();

    const features = [
        { icon: Sparkles, title: t("landingFeatureAiTitle"), text: t("landingFeatureAiText") },
        { icon: Building2, title: t("landingFeatureLocalTitle"), text: t("landingFeatureLocalText") },
        { icon: ShieldCheck, title: t("landingFeatureVerifyTitle"), text: t("landingFeatureVerifyText") },
    ];

    const pricing = [
        { name: t("landingPlanFreeName"), price: t("landingPlanFreePrice"), points: [t("landingPlanFreePoint1"), t("landingPlanFreePoint2"), t("landingPlanFreePoint3")] },
        { name: t("landingPlanBoostName"), price: t("landingPlanBoostPrice"), points: [t("landingPlanBoostPoint1"), t("landingPlanBoostPoint2"), t("landingPlanBoostPoint3")], popular: true },
        { name: t("landingPlanProName"), price: t("landingPlanProPrice"), points: [t("landingPlanProPoint1"), t("landingPlanProPoint2"), t("landingPlanProPoint3")] },
    ];

    const testimonials = [
        { quote: t("landingTestimonial1Quote"), name: t("landingTestimonial1Name"), role: t("landingTestimonial1Role") },
        { quote: t("landingTestimonial2Quote"), name: t("landingTestimonial2Name"), role: t("landingTestimonial2Role") },
        { quote: t("landingTestimonial3Quote"), name: t("landingTestimonial3Name"), role: t("landingTestimonial3Role") },
    ];

    const faqs = [
        { q: t("landingFaq1Q"), a: t("landingFaq1A") },
        { q: t("landingFaq2Q"), a: t("landingFaq2A") },
        { q: t("landingFaq3Q"), a: t("landingFaq3A") },
        { q: t("landingFaq4Q"), a: t("landingFaq4A") },
    ];

    return (
        <div className="relative">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.12), transparent 25%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
                }}
            />

            <motion.section
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="relative px-4 pb-12 pt-10 lg:pb-20 lg:pt-14"
            >
                <div className="mx-auto max-w-7xl text-center">
                    <div className="mt-0 grid gap-3 sm:grid-cols-3">
                        {[
                            { value: activeJobsCount, label: t("statsActive"), suffix: null },
                            { value: seekersCount, label: t("statsSeekers"), suffix: null },
                            { value: applicationsLastWeek, label: t("statsApplications"), suffix: <TrendingUp className="size-4 text-emerald-400" /> },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.86, y: 18 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.52, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl">
                                    <CardContent className="p-6">
                                        <p className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tight text-zinc-100">
                                            <NumberFlow value={stat.value} />
                                            {stat.suffix}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            <motion.section
                id="employers"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="relative scroll-mt-24 px-4 py-16 lg:py-20"
            >
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400 backdrop-blur-3xl">
                        {t("employersBadge")}
                    </span>
                    <motion.h2
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7 }}
                        className="mt-6 text-3xl font-semibold tracking-tighter text-zinc-100 md:text-4xl"
                    >
                        {t("employersTitle")}
                    </motion.h2>
                    <motion.p
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.05 }}
                        className="mt-4 text-base text-zinc-400 lg:text-lg"
                    >
                        {t("employersSub")}
                    </motion.p>
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Link href="/auth/register">
                            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all">
                                {t("employersCta")}
                            </button>
                        </Link>
                        <a href="#pricing">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-xl border-white/[0.14] bg-white/[0.02] text-zinc-100 hover:bg-amber-500/10 hover:shadow-[0_0_24px_rgba(245,158,11,0.20)]"
                            >
                                {t("pricing")}
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </motion.section>

            {/* ── Amber section divider ── */}
            <div className="pointer-events-none mx-auto max-w-4xl px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>

            <section
                id="features"
                className="relative scroll-mt-24 px-4 py-20"
            >
                <div className="mx-auto max-w-7xl">
                    <motion.h2
                        initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-center text-4xl font-semibold tracking-tighter text-zinc-100"
                    >
                        <LetterReveal text={t("landingFeaturesHeading")} />
                    </motion.h2>
                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {features.map((feature, i) => (
                            <LiquidFeatureCard
                                key={feature.title}
                                icon={feature.icon}
                                title={feature.title}
                                text={feature.text}
                                delay={i * 0.12}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Amber section divider ── */}
            <div className="pointer-events-none mx-auto max-w-4xl px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>

            <motion.section
                id="pricing"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="relative scroll-mt-24 px-4 py-20"
            >
                <div className="mx-auto max-w-7xl">
                    <motion.h2 className="text-center text-4xl font-semibold tracking-tighter text-zinc-100">
                        {t("landingPricingHeading")}
                    </motion.h2>
                    <motion.p className="mt-2 text-center text-zinc-400">{t("landingPricingSub")}</motion.p>
                    <motion.div className="mt-10 grid gap-4 md:grid-cols-3">
                        {pricing.map((plan) => (
                            <Card key={plan.name} className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-3xl ${plan.popular ? "shadow-[0_0_40px_rgba(245,158,11,0.18)]" : ""}`}>
                                <CardContent className="p-7">
                                    {plan.popular ? (
                                        <span className="mb-3 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200">
                                            {t("landingPopular")}
                                        </span>
                                    ) : null}
                                    <h3 className="font-medium text-zinc-100">{plan.name}</h3>
                                    <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-100">{plan.price}</p>
                                    <ul className="mt-5 space-y-2">
                                        {plan.points.map((point) => (
                                            <li key={point} className="inline-flex items-start gap-2 text-sm text-zinc-400">
                                                <Check className="mt-0.5 size-4 text-emerald-400" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/pricing" className="mt-6 block">
                                        <Button className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-amber-500/10 hover:shadow-[0_0_24px_rgba(245,158,11,0.20)]" variant="outline">
                                            {t("landingChoosePlan")}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <motion.section initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} className="relative px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <motion.h2 className="text-center text-4xl font-semibold tracking-tighter text-zinc-100">
                        {t("landingTestimonialsHeading")}
                    </motion.h2>
                    <motion.div className="mt-10 grid gap-4 md:grid-cols-3">
                        {testimonials.map((entry) => (
                            <Card key={entry.name} className="border-white/[0.06] bg-white/[0.02] backdrop-blur-3xl">
                                <CardContent className="p-7">
                                    <p className="text-sm italic text-zinc-400">“{entry.quote}”</p>
                                    <p className="mt-5 font-medium text-zinc-100">{entry.name}</p>
                                    <p className="text-xs text-zinc-400">{entry.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <motion.section initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} className="relative px-4 py-20">
                <div className="mx-auto max-w-3xl">
                    <motion.h2 className="text-center text-4xl font-semibold tracking-tighter text-zinc-100">
                        {t("landingFaqHeading")}
                    </motion.h2>
                    <motion.div className="mt-10 space-y-3">
                        {faqs.map((faq) => (
                            <details key={faq.q} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-3xl [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-100">
                                    <span>{faq.q}</span>
                                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-sm text-zinc-400">{faq.a}</p>
                            </details>
                        ))}
                    </motion.div>
                    <motion.div className="mt-10 text-center">
                        <a href="#pricing">
                            <Button variant="outline" className="rounded-xl border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-amber-500/10 hover:shadow-[0_0_24px_rgba(245,158,11,0.20)]">
                                <Briefcase className="size-4" />
                                {t("landingLearnMore")}
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
