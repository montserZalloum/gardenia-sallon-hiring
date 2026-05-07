import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";
import { Brand } from "@/components/shared/brand";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-6 md:py-10">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Brand size="md" />
        </div>
      </header>
      <main className="flex-1 px-4 pb-20">
        <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:mt-20 md:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileQuestion className="size-8" />
          </div>
          <p className="mt-6 font-display text-2xl text-foreground md:text-3xl">
            الصفحة غير موجودة
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            ربما حُذفت الوظيفة أو انتهت. تصفّحي الوظائف المتاحة من الصفحة
            الرئيسية.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ArrowRight className="size-4" />
            العودة للرئيسية
          </Link>
        </div>
      </main>
    </div>
  );
}
