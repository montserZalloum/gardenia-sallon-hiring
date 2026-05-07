"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/shared/brand";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("الإيميل أو كلمة المرور غير صحيحة");
        } else if (res.status === 500) {
          setError("بيانات الأدمن غير مضبوطة في .env.local");
        } else {
          setError("تعذّر تسجيل الدخول، حاولي لاحقاً");
        }
        return;
      }
      toast.success("مرحباً بكِ 🌸");
      const from = searchParams.get("from") ?? "/admin";
      router.replace(from);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full rounded-2xl text-base h-12"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            جاري الدخول...
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            دخول
          </>
        )}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-6 md:py-10">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Brand size="md" />
        </div>
      </header>

      <main className="flex-1 px-4 pb-20">
        <div className="mx-auto mt-6 max-w-md md:mt-12">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="size-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-foreground">
                  دخول الأدمن
                </h1>
                <p className="text-xs text-muted-foreground">
                  محظور للزوار. الرجاء إدخال بيانات الأدمن.
                </p>
              </div>
            </div>
            <Suspense
              fallback={<div className="text-sm text-muted-foreground">…</div>}
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
