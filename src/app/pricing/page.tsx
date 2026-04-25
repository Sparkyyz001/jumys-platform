import { createSSRClient } from "@/lib/supabase/server";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";
import { PricingPageClient } from "./PricingPageClient";

export const metadata = {
    title: "Тарифы и выход в ТОП — Jumys",
    description:
        "Поднимите вакансию в ТОП Актау, получайте в 6 раз больше откликов. Тарифы Free, Boost и Pro для работодателей.",
};
export const dynamic = "force-dynamic";

export default async function PricingPage() {
    let signedIn = false;
    if (isSupabaseBrowserConfigured()) {
        try {
            const supabase = await createSSRClient();
            const { data: { user } } = await supabase.auth.getUser();
            signedIn = Boolean(user);
        } catch {
            signedIn = false;
        }
    }
    return <PricingPageClient signedIn={signedIn} />;
}
