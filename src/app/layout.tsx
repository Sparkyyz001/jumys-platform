import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { FloatingAIAssistant } from "@/components/FloatingAIAssistant";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    display: "swap",
    variable: "--font-sans",
    preload: true,
});

export const metadata: Metadata = {
    title: "Jumys — AI-поиск работы в Актау",
    description: "Jumys — AI-подбор вакансий и кандидатов в Актау, Казахстан",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru" suppressHydrationWarning className={inter.variable}>
            <body className="theme-sass3 font-sans antialiased overflow-x-hidden">
                <ThemeProvider>
                    <I18nProvider>
                        {children}
                        <FloatingAIAssistant />
                        <Toaster richColors position="top-right" />
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
