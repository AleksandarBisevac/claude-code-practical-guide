import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import NewNoteForm from '@/components/NewNoteForm';

export default async function NewNotePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authenticate');

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header userName={session.user.name} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">New Note</h1>
        <NewNoteForm />
      </main>
    </div>
  );
}
