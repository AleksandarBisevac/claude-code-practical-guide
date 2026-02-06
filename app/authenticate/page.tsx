"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const isSignUp = searchParams.get("mode") === "sign-up";

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  async function authenticate(
    _prev: string | null,
    formData: FormData
  ): Promise<string | null> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isSignUp) {
      const name = formData.get("name") as string;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (error) return error.message ?? "Sign up failed";
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) return error.message ?? "Sign in failed";
    }

    router.push("/dashboard");
    return null;
  }

  const [error, formAction, isPending] = useActionState(authenticate, null);

  if (sessionLoading || session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <p className="text-white/60 text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="text-white/60 text-sm">
            {isSignUp
              ? "Sign up to start taking notes"
              : "Sign in to your account"}
          </p>
        </header>

        <form action={formAction} className="space-y-4">
          {isSignUp && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Name</span>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                placeholder="Your name"
              />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-white/80">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-white/80">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              placeholder="Min. 8 characters"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-white/60">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link
                href="/authenticate?mode=sign-in"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/authenticate?mode=sign-up"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

export default function AuthenticatePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
          <p className="text-white/60 text-sm">Loading...</p>
        </main>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
