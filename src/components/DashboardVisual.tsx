"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, MapPin, ShieldCheck } from "lucide-react";

const TIPS = [
    {
        icon: Sparkles,
        color: "from-amber-400/20 to-orange-400/10",
        border: "border-amber-400/20",
        iconColor: "text-amber-400",
        glow: "rgba(251,146,60,0.3)",
        title: "AI-матчинг",
        text: "Заполните профиль полностью — AI подбирает точнее при наличии навыков и района.",
    },
    {
        icon: Zap,
        color: "from-sky-400/20 to-cyan-400/10",
        border: "border-sky-400/20",
        iconColor: "text-sky-400",
        glow: "rgba(56,189,248,0.3)",
        title: "Boost",
        text: "Вакансии с Boost получают в 6× больше откликов за первые 7 дней.",
    },
    {
        icon: MapPin,
        color: "from-rose-400/20 to-pink-400/10",
        border: "border-rose-400/20",
        iconColor: "text-rose-400",
        glow: "rgba(251,113,133,0.3)",
        title: "Районы",
        text: "Укажите микрорайон — кандидаты из вашего района откликаются в 2× чаще.",
    },
    {
        icon: ShieldCheck,
        color: "from-emerald-400/20 to-teal-400/10",
        border: "border-emerald-400/20",
        iconColor: "text-emerald-400",
        glow: "rgba(52,211,153,0.3)",
        title: "Verified",
        text: "Verified Business повышает CTR вакансий в среднем на 40%.",
    },
];

/* Плавающий шар */
function Orb({ style }: { style: React.CSSProperties }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={style}
            animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

export function DashboardVisual() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 md:p-8"
        >
            {/* Фоновые орбы */}
            <Orb style={{ width: 280, height: 280, top: -80, left: -80, background: "radial-gradient(circle, rgba(251,146,60,0.12), transparent 70%)" }} />
            <Orb style={{ width: 240, height: 240, bottom: -60, right: -40, background: "radial-gradient(circle, rgba(56,189,248,0.10), transparent 70%)" }} />
            <Orb style={{ width: 180, height: 180, top: "40%", left: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)" }} />

            {/* Заголовок */}
            <div className="relative z-10 mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Советы платформы</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-100">Как получить максимум от Jumys</h2>
            </div>

            {/* Карточки */}
            <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TIPS.map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                        <motion.div
                            key={tip.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`relative overflow-hidden rounded-2xl border ${tip.border} bg-gradient-to-br ${tip.color} backdrop-blur-xl p-5 cursor-default`}
                            style={{ boxShadow: `0 0 0 0 ${tip.glow}` }}
                            whileInView={{ boxShadow: [`0 0 0px ${tip.glow}`, `0 8px 32px ${tip.glow}`, `0 0 0px ${tip.glow}`] } as never}
                        >
                            {/* Icon glow */}
                            <div
                                className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-30 blur-2xl"
                                style={{ background: tip.glow }}
                            />
                            <div className={`mb-3 flex size-9 items-center justify-center rounded-xl border ${tip.border} bg-white/[0.05]`}>
                                <Icon className={`size-4 ${tip.iconColor}`} />
                            </div>
                            <p className="text-sm font-semibold text-zinc-100">{tip.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{tip.text}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Анимированная линия снизу */}
            <motion.div
                className="relative z-10 mt-6 h-px w-full overflow-hidden rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(251,146,60,0.3), rgba(56,189,248,0.3), transparent)" }}
            >
                <motion.div
                    className="absolute inset-0 h-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", width: "40%" }}
                    animate={{ x: ["-40%", "140%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
            </motion.div>
        </motion.div>
    );
}
