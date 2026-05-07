"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("تم تسجيل الخروج");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("تعذّر تسجيل الخروج");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onLogout}>
      <LogOut className="size-4" />
      خروج
    </Button>
  );
}
