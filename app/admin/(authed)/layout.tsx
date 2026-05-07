import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Brand size="sm" withLink={false} />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
              الإدارة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              الوظائف
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
