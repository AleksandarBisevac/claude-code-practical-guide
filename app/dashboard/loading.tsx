export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-900/80 border-b border-white/10 px-6 py-3 h-[52px]" />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="p-4 border border-white/10 bg-white/5 rounded-lg">
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
