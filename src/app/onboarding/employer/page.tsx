import { EmployerOnboardingForm } from "./form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Профиль работодателя — Jumys" };

export default function EmployerOnboardingPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>О компании</CardTitle>
                    <CardDescription>
                        Эти данные увидят кандидаты в ваших вакансиях
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EmployerOnboardingForm />
                </CardContent>
            </Card>
        </div>
    );
}
