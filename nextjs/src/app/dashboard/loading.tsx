export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6 animate-pulse">
            <div className="h-8 w-56 bg-slate-200 rounded" />
            <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="p-5 space-y-2">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-6 w-12 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-64 rounded-xl bg-white border border-slate-200 shadow-sm" />
        </div>
    );
}
