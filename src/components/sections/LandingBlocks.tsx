"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Briefcase, Building2, Check, ChevronDown, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

interface LandingBlocksProps {
    signedIn: boolean;
    activeJobsCount: number;
    seekersCount: number;
    applicationsLastWeek: number;
}

export function LandingBlocks({
    signedIn,
    activeJobsCount,
    seekersCount,
    applicationsLastWeek,
}: LandingBlocksProps) {
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
                className="relative px-4 py-20 lg:py-28"
            >
                <div className="mx-auto max-w-7xl text-center">
                    <motion.span
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7 }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400 backdrop-blur-3xl"
                    >
                        <Sparkles className="size-3.5 text-sky-300" />
                        {t("landingBadge")}
                    </motion.span>
                    <motion.h1
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.05 }}
                        className="mx-auto mt-6 max-w-5xl text-5xl font-semibold tracking-tighter text-zinc-100 sm:text-6xl lg:text-8xl"
                    >
                        {t("landingHeroTitle")}
                    </motion.h1>
                    <motion.p
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 lg:text-lg"
                    >
                        {t("landingHeroSub")}
                    </motion.p>
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="mt-10 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Link href="/auth/register">
                            <motion.div
                animate={{ boxShadow: ["0 0 0px rgba(56,189,248,0.15)", "0 0 28px rgba(56,189,248,0.28)", "0 0 0px rgba(56,189,248,0.15)"] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                className="rounded-xl"
                            >
                                <Button size="lg" className="rounded-xl bg-zinc-100 text-black hover:bg-white">
                                    {t("ctaStart")}
                                </Button>
                            </motion.div>
                        </Link>
                        <Link href={signedIn ? "/jobs" : "/auth/login?next=/jobs"}>
                            <Button size="lg" variant="outline" className="rounded-xl border-white/[0.14] bg-white/[0.02] text-zinc-100 hover:bg-sky-400/10 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]">
                                {t("ctaBrowseJobs")}
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-16 grid gap-3 sm:grid-cols-3"
                    >
                        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl">
                            <CardContent className="p-6">
                                <p className="text-4xl font-semibold tracking-tight text-zinc-100"><NumberFlow value={activeJobsCount} /></p>
                                <p className="mt-1 text-sm text-zinc-400">{t("statsActive")}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl">
                            <CardContent className="p-6">
                                <p className="text-4xl font-semibold tracking-tight text-zinc-100"><NumberFlow value={seekersCount} /></p>
                                <p className="mt-1 text-sm text-zinc-400">{t("statsSeekers")}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl">
                            <CardContent className="p-6">
                                <p className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tight text-zinc-100">
                                    <NumberFlow value={applicationsLastWeek} />
                                    <TrendingUp className="size-4 text-emerald-400" />
                                </p>
                                <p className="mt-1 text-sm text-zinc-400">{t("statsApplications")}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.section>

            <motion.section initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} className="relative px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <motion.h2 className="text-center text-4xl font-semibold tracking-tighter text-zinc-100">
                        {t("landingFeaturesHeading")}
                    </motion.h2>
                    <motion.div className="mt-10 grid gap-4 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={feature.title} className="border-white/[0.06] bg-white/[0.02] backdrop-blur-3xl">
                                    <CardContent className="p-7">
                                        <div className="flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-sky-300">
                                            <Icon className="size-5" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-medium tracking-tight text-zinc-100">{feature.title}</h3>
                                        <p className="mt-2 text-sm text-zinc-400">{feature.text}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </motion.div>
                </div>
            </motion.section>

            <motion.section initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8 }} className="relative px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <motion.h2 className="text-center text-4xl font-semibold tracking-tighter text-zinc-100">
                        {t("landingPricingHeading")}
                    </motion.h2>
                    <motion.p className="mt-2 text-center text-zinc-400">{t("landingPricingSub")}</motion.p>
                    <motion.div className="mt-10 grid gap-4 md:grid-cols-3">
                        {pricing.map((plan) => (
                            <Card key={plan.name} className={`border-white/[0.06] bg-white/[0.02] backdrop-blur-3xl ${plan.popular ? "shadow-[0_0_40px_rgba(56,189,248,0.18)]" : ""}`}>
                                <CardContent className="p-7">
                                    {plan.popular ? (
                                        <span className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-0.5 text-xs text-sky-200">
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
                                        <Button className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-sky-400/10 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]" variant="outline">
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
                        <Link href="/pricing">
                            <Button variant="outline" className="rounded-xl border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-sky-400/10 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]">
                                <Briefcase className="size-4" />
                                {t("landingLearnMore")}
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
