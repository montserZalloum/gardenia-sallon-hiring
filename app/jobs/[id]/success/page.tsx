import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Brand } from "@/components/shared/brand";

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-6 md:py-10">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Brand size="md" />
        </div>
      </header>

      <main className="flex-1 px-4 pb-24">
        <div className="mx-auto mt-12 max-w-xl text-center md:mt-20">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/15 text-[oklch(0.45_0.07_132)]">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="mt-8 font-display text-3xl text-foreground md:text-4xl">
            شكراً لتقديمك! 🌸
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            تم استلام طلبك بنجاح، وسنتواصل معك قريباً إن شاء الله.
          </p>
          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ArrowRight className="size-4" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>
    </div>
  );
}
