"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyLinkButton({ jobId }: { jobId: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      const url = `${window.location.origin}/jobs/${jobId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ الرابط ✓");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذّر نسخ الرابط");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onCopy}
      title="نسخ رابط الوظيفة"
      aria-label="نسخ رابط الوظيفة"
    >
      {copied ? (
        <Check className="size-4 text-success" />
      ) : (
        <Link2 className="size-4" />
      )}
    </Button>
  );
}
