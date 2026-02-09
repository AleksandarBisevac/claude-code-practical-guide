import { notFound } from 'next/navigation';
import { getNoteByPublicSlug } from '@/lib/notes';
import NoteViewer from '@/components/NoteViewer';

type Params = Promise<{ slug: string }>;

export default async function PublicNotePage({ params }: { params: Params }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-6 py-3">
        <span className="text-lg font-bold text-white">NextNotes</span>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">{note.title}</h1>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <NoteViewer content={content} />
        </div>
      </main>
    </div>
  );
}
