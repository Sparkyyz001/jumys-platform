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
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-1">
            {LANGS.map((item) => (
                <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                        setLang(item.code as "kk" | "ru" | "en");
                    }}
                    className={`px-2 py-1 text-xs font-semibold rounded ${lang === item.code ? "bg-primary-100 text-primary-700" : "text-gray-500"}`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
