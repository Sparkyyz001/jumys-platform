export default function RootLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-slate-500">Загрузка…</p>
            </div>
        </div>
    );
}
