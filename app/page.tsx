export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex items-center justify-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center px-8 animate-greeting">
          Hello Alek,
          <br />
          <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            how are you today?
          </span>
        </h1>
      </main>
    </div>
  );
}
