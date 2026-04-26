import Link from "next/link";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    showText?: boolean;
    className?: string;
}

export function Logo({ showText = true, className }: LogoProps) {
    return (
        <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
            <span className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Briefcase size={16} strokeWidth={2.25} className="text-white" />
            </span>
            {showText ? <span className="text-lg font-semibold tracking-tight text-foreground">Jumys</span> : null}
        </Link>
    );
}
