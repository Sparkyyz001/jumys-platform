"use client";

import { useEffect, useRef, useState } from "react";

type RoutePoint = {
    x: number;
    y: number;
    delay: number;
};

type Route = {
    start: RoutePoint;
    end: RoutePoint;
    color: string;
};

const DEFAULT_ROUTES: Route[] = [
    {
        start: { x: 100, y: 150, delay: 0 },
        end: { x: 200, y: 80, delay: 2 },
        color: "#3b82f6",
    },
    {
        start: { x: 200, y: 80, delay: 2 },
        end: { x: 260, y: 120, delay: 4 },
        color: "#3b82f6",
    },
    {
        start: { x: 50, y: 50, delay: 1 },
        end: { x: 150, y: 180, delay: 3 },
        color: "#3b82f6",
    },
    {
        start: { x: 280, y: 60, delay: 0.5 },
        end: { x: 180, y: 180, delay: 2.5 },
        color: "#3b82f6",
    },
];

interface DotMapBackgroundProps {
    routes?: Route[];
    dotColor?: string;
    className?: string;
}

export function DotMapBackground({
    routes = DEFAULT_ROUTES,
    dotColor = "rgba(255, 255, 255, ",
    className = "",
}: DotMapBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });

        ro.observe(parent);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const { width, height } = dimensions;
        if (!width || !height) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const gap = 14;
        const dotRadius = 1;
        const dots: { x: number; y: number; opacity: number }[] = [];

        for (let x = 0; x < width; x += gap) {
            for (let y = 0; y < height; y += gap) {
                const inMap =
                    (x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1) ||
                    (x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4) ||
                    (x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15) ||
                    (x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
                    (x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1) ||
                    (x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6);
                if (inMap && Math.random() > 0.3) {
                    dots.push({ x, y, opacity: Math.random() * 0.5 + 0.1 });
                }
            }
        }

        let raf = 0;
        let start = Date.now();
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            for (const d of dots) {
                ctx.beginPath();
                ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = `${dotColor}${d.opacity})`;
                ctx.fill();
            }

            const t = (Date.now() - start) / 1000;
            for (const r of routes) {
                const elapsed = t - r.start.delay;
                if (elapsed <= 0) continue;
                const progress = Math.min(elapsed / 3, 1);
                const x = r.start.x + (r.end.x - r.start.x) * progress;
                const y = r.start.y + (r.end.y - r.start.y) * progress;

                ctx.beginPath();
                ctx.moveTo(r.start.x, r.start.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = r.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(r.start.x, r.start.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = r.color;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#60a5fa";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(96, 165, 250, 0.3)";
                ctx.fill();

                if (progress === 1) {
                    ctx.beginPath();
                    ctx.arc(r.end.x, r.end.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = r.color;
                    ctx.fill();
                }
            }

            if (t > 15) start = Date.now();
            raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [dimensions, routes, dotColor]);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
