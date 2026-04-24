import { SeekerOnboardingForm } from "./form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Профиль соискателя — Jumys" };

export default function SeekerOnboardingPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Расскажите о себе</CardTitle>
                    <CardDescription>
                        Чем больше расскажете, тем точнее подберём вакансии
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SeekerOnboardingForm />
                </CardContent>
            </Card>
        </div>
    );
}
