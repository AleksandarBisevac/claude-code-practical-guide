import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getNotesByUser } from "@/lib/notes";
import Link from "next/link";
import Header from "@/components/Header";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const notes = getNotesByUser(session.user.id);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header userName={session.user.name} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <Link
            href="/notes/new"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-500 transition-colors"
          >
            New Note
          </Link>
        </div>

        {notes.length === 0 ? (
          <p className="text-white/60">No notes yet. Create your first note!</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block p-4 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <h2 className="font-medium text-white">{note.title}</h2>
                  <p className="text-sm text-white/60">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
