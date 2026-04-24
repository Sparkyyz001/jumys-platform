export const AKTAU_DISTRICTS = [
    "1", "2", "3", "3А", "4", "4А", "5", "6", "7", "8", "9",
    "11", "12", "13", "14", "15", "23", "27", "28", "29", "30",
    "Приморский", "Koktem", "Shanyrak"
] as const;

export const JOB_CATEGORIES = [
    "общепит", "стройка", "розница", "сервис",
    "автосервис", "нефтесервис", "IT", "логистика"
] as const;

export const EMPLOYMENT_TYPES = [
    { value: "full", label: "Полная занятость" },
    { value: "part", label: "Частичная занятость" },
    { value: "gig", label: "Подработка" }
] as const;

export const EXPERIENCE_LEVELS = [
    { value: "none", label: "Без опыта" },
    { value: "junior", label: "До 1 года" },
    { value: "middle", label: "1-3 года" },
    { value: "senior", label: "Более 3 лет" }
] as const;

export const APPLICATION_STATUSES = [
    { value: "new", label: "Новый", color: "bg-blue-100 text-blue-700" },
    { value: "viewed", label: "Просмотрен", color: "bg-gray-100 text-gray-700" },
    { value: "contacted", label: "Связались", color: "bg-green-100 text-green-700" },
    { value: "rejected", label: "Отклонён", color: "bg-red-100 text-red-700" }
] as const;

export function labelForEmployment(value: string | null): string {
    if (!value) return "—";
    return EMPLOYMENT_TYPES.find(t => t.value === value)?.label ?? value;
}

export function labelForExperience(value: string | null): string {
    if (!value) return "—";
    return EXPERIENCE_LEVELS.find(t => t.value === value)?.label ?? value;
}

export function labelForStatus(value: string | null): string {
    if (!value) return "—";
    return APPLICATION_STATUSES.find(t => t.value === value)?.label ?? value;
}

export function formatSalary(from: number | null, to: number | null): string {
    if (!from && !to) return "Не указано";
    if (from && to) return `${from.toLocaleString("ru-RU")} – ${to.toLocaleString("ru-RU")} ₸`;
    if (from) return `от ${from.toLocaleString("ru-RU")} ₸`;
    if (to) return `до ${to.toLocaleString("ru-RU")} ₸`;
    return "Не указано";
}
