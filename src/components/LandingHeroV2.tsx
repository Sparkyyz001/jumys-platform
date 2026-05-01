"use client";

import Link from "next/link";
import { type MouseEvent, type ReactNode, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight, MapPin, Send, Sparkles } from "lucide-react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
    useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface LandingHeroV2Props {
    signedIn: boolean;
}

/**
 * Cinematic hero — Apple/Awwwards style on top of existing data.
 * - 3D perspective tilt on the mockup (mouse-driven, spring-damped)
 * - Word-by-word reveal with blur→clear easing
 * - Magnetic CTA buttons that lean toward the cursor
 * - Warm gradient accent (amber → orange → rose) on the headline
 * - Inner mockup cards have depth offset (translateZ) so tilt looks layered
 * - Honors prefers-reduced-motion
 *
 * NOTE: structure & data are 1:1 with LandingHero.tsx. Drop-in safe.
 */
export function LandingHeroV2({ signedIn }: LandingHeroV2Props) {
    const { t } = useI18n();
    void signedIn;
    const reduce = useReducedMotion();

    // ---- Mockup tilt motion values
    const mx = useMotionValue(0); // -0.5..0.5
    const my = useMotionValue(0);
    const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
        stiffness: 200,
        damping: 25,
    });
    const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
        stiffness: 200,
        damping: 25,
    });
    const glowX = useTransform(mx, [-0.5, 0.5], ["15%", "85%"]);
    const glowY = useTransform(my, [-0.5, 0.5], ["15%", "85%"]);
    const glowBg = useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, rgba(251,191,36,0.20), transparent 60%)`;

    const onMockupMove = (e: MouseEvent<HTMLDivElement>) => {
        if (reduce) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const onMockupLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const matches = [
        { title: "Консультант", company: "Caspian Tourism Hub", salary: "315 000 ₸", score: "92%", tone: "emerald" as const },
        { title: "Support engineer", company: "IT Shop", salary: "520 000 ₸", score: "87%", tone: "violet" as const },
        { title: "Кладовщик", company: "KMG Logistics", salary: "240 000 ₸", score: "81%", tone: "amber" as const },
    ];
    const scoreStyles = {
        emerald: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30",
        violet: "bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30",
        amber: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
    };

    // Word-stagger for the headline
    const titleWords = t("heroTitle").split(" ");
    const accent = t("heroTitleAccent");

    const wordContainer = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    };
    const wordItem = {
        hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
        },
    };

    return (
        <section className="relative py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                    {/* ----------- LEFT: copy ----------- */}
                    <div className="w-full lg:w-3/5">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
                                       bg-white/5 ring-1 ring-white/10 backdrop-blur-sm text-white/80"
                        >
                            <Sparkles className="size-3.5 text-amber-400" />
                            {t("heroBadge")}
                        </motion.div>

                        <motion.h1
                            variants={wordContainer}
                            initial="hidden"
                            animate="visible"
                            className="mt-5 text-4xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-white"
                        >
                            {titleWords.map((w, i) => (
                                <motion.span
                                    key={`${w}-${i}`}
                                    variants={wordItem}
                                    className="inline-block mr-[0.25em]"
                                >
                                    {w}
                                </motion.span>
                            ))}
                            <br className="hidden sm:block" />
                            <motion.span
                                variants={wordItem}
                                className="inline-block bg-clip-text text-transparent
                                           [background-size:200%_100%] animate-shimmer"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(90deg,#fcd34d,#fb923c,#f43f5e,#fb923c,#fcd34d)",
                                }}
                            >
                                {accent}
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            className="mt-5 text-lg text-white/70 max-w-xl"
                        >
                            {t("heroDescription")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.75 }}
                            className="mt-8 flex gap-3 flex-wrap"
                        >
                            <MagneticButton>
                                <Link href="/auth/register">
                                    <Button
                                        size="lg"
                                        className="relative bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500
                                                   hover:brightness-110 text-white border-0
                                                   shadow-[0_0_45px_-10px_rgba(251,146,60,0.65)]
                                                   transition-[filter,box-shadow] duration-200"
                                    >
                                        {t("ctaStart")}
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </MagneticButton>
                            <MagneticButton>
                                <Link href="/employers">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="bg-white/5 backdrop-blur-sm border-white/15 text-white
                                                   hover:bg-white/10 hover:text-white"
                                    >
                                        {t("heroEmployerCta")}
                                    </Button>
                                </Link>
                            </MagneticButton>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                            className="mt-8 text-sm text-white/50"
                        >
                            {t("heroSocialProof")}
                        </motion.p>
                    </div>

                    {/* ----------- RIGHT: 3D mockup ----------- */}
                    <div
                        className="relative w-full lg:w-2/5"
                        style={{ perspective: "1200px" }}
                    >
                        <motion.div
                            onMouseMove={onMockupMove}
                            onMouseLeave={onMockupLeave}
                            initial={{ opacity: 0, y: 30, rotateX: 15 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="relative rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02]
                                       ring-1 ring-white/10 backdrop-blur-xl shadow-2xl p-6
                                       will-change-transform"
                        >
                            {/* Cursor-following warm glow */}
                            <motion.div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-2xl"
                                style={{ background: glowBg }}
                            />

                            <div
                                className="relative"
                                style={{ transform: "translateZ(40px)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-10 rounded-full bg-gradient-to-br from-amber-300 to-rose-500
                                                   flex items-center justify-center text-sm font-semibold text-white
                                                   shadow-lg shadow-rose-500/30"
                                    >
                                        АТ
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Айгерим Т.</p>
                                        <p className="text-xs text-white/60 inline-flex items-center gap-1">
                                            <MapPin className="size-3.5" />
                                            {t("heroMockupRole")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    {matches.map((m, i) => (
                                        <motion.div
                                            key={m.title}
                                            initial={{ opacity: 0, y: 14, x: -6 }}
                                            animate={{ opacity: 1, y: 0, x: 0 }}
                                            transition={{
                                                delay: 0.6 + i * 0.12,
                                                duration: 0.5,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            style={{ transform: `translateZ(${20 + i * 10}px)` }}
                                            className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3
                                                       flex items-start justify-between gap-2
                                                       hover:bg-white/[0.07] transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-white">{m.title}</p>
                                                <p className="text-xs text-white/55">{m.company}</p>
                                                <p className="text-sm font-semibold text-white mt-1">{m.salary}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreStyles[m.tone]}`}
                                            >
                                                {m.score}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div
                                    className="mt-4 rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3"
                                    style={{ transform: "translateZ(50px)" }}
                                >
                                    <p className="text-5xl font-bold text-white leading-none">
                                        <NumberFlow value={3.2} />{" "}
                                        <span className="text-2xl font-semibold text-white/80">
                                            {t("heroMockupDays")}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-white/55">{t("heroMockupAvgHire")}</p>
                                    <p className="mt-1 text-xs text-emerald-400 font-medium">
                                        {t("heroMockupVs")}
                                    </p>
                                </div>
                            </div>

                            {/* Toast — spring-pop entrance */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    delay: 1.4,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 18,
                                }}
                                style={{ transform: "translateZ(80px)" }}
                                className="absolute -bottom-3 -right-3 rounded-xl bg-[#0e1320]/95 ring-1 ring-white/15
                                           backdrop-blur-md shadow-2xl shadow-amber-500/10 p-3 flex items-center gap-2"
                            >
                                <span
                                    className="size-8 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center
                                               ring-1 ring-amber-400/30"
                                >
                                    <Send className="size-4" />
                                </span>
                                <p className="text-xs font-medium text-white">
                                    {t("heroMockupToast")}
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---- Magnetic button: leans toward cursor on hover ----
function MagneticButton({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });
    const reduce = useReducedMotion();

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        if (reduce) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.25);
        y.set((e.clientY - cy) * 0.25);
    };
    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ x: sx, y: sy }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
}
