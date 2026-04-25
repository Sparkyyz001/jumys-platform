/**
 * Static mesh background. Renders ONCE per route, fixed to viewport,
 * uses a single GPU layer to avoid scroll repaints / flicker.
 * No animations, no attachment:fixed on body.
 */
export function MeshGridBackground({
    intensity = "default",
}: {
    intensity?: "default" | "soft" | "strong";
}) {
    const opacityClass =
        intensity === "soft" ? "opacity-50" : intensity === "strong" ? "opacity-90" : "opacity-70";

    return (
        <div
            aria-hidden
            className={`fixed inset-0 -z-10 pointer-events-none gpu-layer ${opacityClass}`}
        >
            <div className="absolute inset-0 bg-[#020617]" />
            <div
                className="absolute -top-32 -left-24 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[80px]"
            />
            <div
                className="absolute -bottom-32 -right-24 h-[400px] w-[400px] rounded-full bg-indigo-500/25 blur-[80px]"
            />
        </div>
    );
}

/**
 * Static thin grid overlay (no animation). Use over hero sections.
 */
export function AnimatedGridLayer() {
    return (
        <div
            aria-hidden
            className="absolute inset-0 overflow-hidden pointer-events-none gpu-layer"
        >
            <div
                className="absolute inset-0 grid-pattern"
                style={{
                    maskImage:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.85), transparent 70%)",
                }}
            />
        </div>
    );
}
