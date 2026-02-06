"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/authenticate");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white/60 hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
