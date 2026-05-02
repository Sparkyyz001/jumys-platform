export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6 animate-pulse">
            <div className="h-8 w-56 bg-white/[0.06] rounded-xl" />
            <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                        <div className="p-5 space-y-3">
                            <div className="h-3 w-20 bg-white/[0.07] rounded-lg" />
                            <div className="h-6 w-12 bg-white/[0.07] rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-64 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        </div>
    );
}
