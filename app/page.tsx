import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex flex-col items-center gap-8 px-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center animate-greeting">
          NextNotes
          <br />
          <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Your notes, anywhere.
          </span>
        </h1>
        <p className="text-white/60 text-lg text-center max-w-md">
          Create, edit, and share rich text notes with a beautiful editor.
        </p>
        <div className="flex gap-4">
          <Link
            href="/authenticate"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/authenticate?mode=sign-up"
            className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
