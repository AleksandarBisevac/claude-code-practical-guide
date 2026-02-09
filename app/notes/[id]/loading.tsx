export default function NoteLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-900/80 border-b border-white/10 px-6 py-3 h-[52px]" />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-16 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="mb-6">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
