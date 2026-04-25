"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";

export interface ProjectShowcaseItem {
    title: string;
    description: string;
    badge: string;
    link?: string;
    image: string;
}

interface ProjectShowcaseProps {
    items: ProjectShowcaseItem[];
    heading?: string;
    className?: string;
}

export function ProjectShowcase({ items, heading = "Selected Work", className = "" }: ProjectShowcaseProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const smoothPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

        let raf = 0;
        const tick = () => {
            smoothPos.current.x = lerp(smoothPos.current.x, mousePos.current.x, 0.18);
            smoothPos.current.y = lerp(smoothPos.current.y, mousePos.current.y, 0.18);
            const el = previewRef.current;
            if (el) {
                el.style.transform = `translate3d(${smoothPos.current.x + 24}px, ${smoothPos.current.y - 110}px, 0)`;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mousePos.current.x = event.clientX - rect.left;
        mousePos.current.y = event.clientY - rect.top;
    };

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        setIsVisible(false);
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={`relative w-full max-w-2xl mx-auto px-6 py-16 ${className}`}
        >
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase mb-8">
                {heading}
            </h2>

            <div
                ref={previewRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transition: "opacity 0.25s ease-out",
                    willChange: "transform, opacity",
                }}
            >
                <div className="relative w-[280px] h-[180px] rounded-xl overflow-hidden shadow-2xl bg-secondary ring-1 ring-black/5">
                    {items.map((item, index) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            key={item.title}
                            src={item.image}
                            alt=""
                            loading="eager"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform,filter] duration-500 ease-out"
                            style={{
                                opacity: hoveredIndex === index ? 1 : 0,
                                transform: hoveredIndex === index ? "scale(1)" : "scale(1.08)",
                                filter: hoveredIndex === index ? "none" : "blur(8px)",
                            }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
            </div>

            <div className="space-y-0">
                {items.map((item, index) => {
                    const Wrap = item.link ? "a" : "div";
                    const wrapProps = item.link ? { href: item.link } : {};
                    return (
                        <Wrap
                            key={item.title}
                            {...wrapProps}
                            className="group block"
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="relative py-5 border-t border-border transition-all duration-300 ease-out">
                                <div
                                    className={`absolute inset-0 -mx-4 px-4 rounded-lg bg-secondary/60 transition-all duration-300 ease-out ${
                                        hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                    }`}
                                />

                                <div className="relative flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="inline-flex items-center gap-2">
                                            <h3 className="text-foreground font-semibold text-lg tracking-tight">
                                                <span className="relative">
                                                    {item.title}
                                                    <span
                                                        className={`absolute left-0 -bottom-0.5 h-px bg-foreground transition-all duration-300 ease-out ${
                                                            hoveredIndex === index ? "w-full" : "w-0"
                                                        }`}
                                                    />
                                                </span>
                                            </h3>
                                            <ArrowUpRight
                                                className={`w-4 h-4 text-muted-foreground transition-all duration-300 ease-out ${
                                                    hoveredIndex === index
                                                        ? "opacity-100 translate-x-0 translate-y-0"
                                                        : "opacity-0 -translate-x-2 translate-y-2"
                                                }`}
                                            />
                                        </div>
                                        <p
                                            className={`text-muted-foreground text-sm mt-1 leading-relaxed transition-colors duration-300 ease-out ${
                                                hoveredIndex === index ? "text-foreground/70" : ""
                                            }`}
                                        >
                                            {item.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-mono text-muted-foreground tabular-nums transition-colors duration-300 ease-out ${
                                            hoveredIndex === index ? "text-foreground/60" : ""
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                </div>
                            </div>
                        </Wrap>
                    );
                })}
                <div className="border-t border-border" />
            </div>
        </section>
    );
}
