/**
 * MeshGridBackground — premium SaaS-style decorative layer.
 * Insert as the first child of a `relative` wrapper. Has pointer-events-none.
 */
export function MeshGridBackground({
    intensity = "default",
}: {
    intensity?: "default" | "soft" | "strong";
}) {
    const blurClass =
        intensity === "strong"
            ? "blur-[110px]"
            : intensity === "soft"
                ? "blur-[140px] opacity-60"
                : "blur-[120px]";

    return (
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div
                className={`absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-blue-500/30 ${blurClass}`}
            />
            <div
                className={`absolute -bottom-40 -right-24 h-[480px] w-[480px] rounded-full bg-indigo-500/30 ${blurClass}`}
            />
            <div
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 h-[360px] w-[360px] rounded-full bg-purple-500/20 ${blurClass}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/40" />
        </div>
    );
}

/**
 * Animated thin grid overlay (slow drift). Use over hero sections.
 */
export function AnimatedGridLayer() {
    return (
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 grid-pattern animate-[grid-drift_60s_linear_infinite]"
                style={{
                    maskImage:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.9), transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.9), transparent 75%)",
                }}
            />
        </div>
    );
}
