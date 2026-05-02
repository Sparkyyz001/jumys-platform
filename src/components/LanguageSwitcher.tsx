"use client";

import { useI18n } from "@/lib/i18n";

const LANGS = [
    { code: "kk", label: "ҚАЗ" },
    { code: "ru", label: "РУС" },
    { code: "en", label: "ENG" },
];

export function LanguageSwitcher() {
    const { lang, setLang } = useI18n();

    return (
        <div className="inline-flex rounded-md border border-white/[0.10] bg-white/[0.04] p-1">
            {LANGS.map((item) => (
                <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                        setLang(item.code as "kk" | "ru" | "en");
                    }}
                    className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                        lang === item.code
                            ? "bg-amber-500/20 text-amber-400"
                            : "text-zinc-400 hover:text-zinc-100"
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
