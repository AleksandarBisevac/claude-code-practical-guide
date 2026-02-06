import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getNoteById } from "@/lib/notes";
import Header from "@/components/Header";
import NoteViewer from "@/components/NoteViewer";
import EditNoteDialog from "@/components/EditNoteDialog";

type Params = Promise<{ id: string }>;

export default async function NotePage({ params }: { params: Params }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header userName={session.user.name} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{note.title}</h1>
          <EditNoteDialog
            key={`edit-${note.updatedAt}`}
            noteId={note.id}
            initialTitle={note.title}
            initialContent={content}
          />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <NoteViewer key={`view-${note.updatedAt}`} content={content} />
        </div>
      </main>
    </div>
  );
}
