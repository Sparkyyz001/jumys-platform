"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "kk" | "ru" | "en";
type I18nKey = "findJob" | "postJob" | "verify" | "settings";

const translations: Record<Lang, Record<I18nKey, string>> = {
    kk: {
        findJob: "Жұмыс табу",
        postJob: "Вакансия жариялау",
        verify: "Тексеру",
        settings: "Баптаулар",
    },
    ru: {
        findJob: "Найти работу",
        postJob: "Разместить вакансию",
        verify: "Проверка",
        settings: "Настройки",
    },
    en: {
        findJob: "Find Job",
        postJob: "Post Job",
        verify: "Verify",
        settings: "Settings",
    },
};

interface I18nContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("kk");

    useEffect(() => {
        const saved = localStorage.getItem("jumys_lang") as Lang | null;
        if (saved && (saved === "kk" || saved === "ru" || saved === "en")) {
            setLangState(saved);
        }
    }, []);

    const value = useMemo<I18nContextValue>(() => ({
        lang,
        setLang: (nextLang: Lang) => {
            setLangState(nextLang);
            localStorage.setItem("jumys_lang", nextLang);
        },
        t: (key: I18nKey) => translations[lang][key],
    }), [lang]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return ctx;
}
