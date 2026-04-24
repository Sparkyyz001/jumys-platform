export default function JobsLoading() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-4 animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-white border border-slate-200 rounded-md" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-40 rounded-xl bg-white border border-slate-200 shadow-sm" />
                ))}
            </div>
        </div>
    );
}
