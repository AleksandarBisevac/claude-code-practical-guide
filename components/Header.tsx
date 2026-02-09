import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function Header({ userName }: { userName: string }) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="text-lg font-bold text-white">
        NextNotes
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/60">{userName}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
