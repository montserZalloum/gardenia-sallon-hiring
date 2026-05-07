import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  size = "md",
  withLink = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 96,
  };
  const dimension = sizes[size];
  const content = (
    <Image
      src="/logo.jpg"
      alt="Hill House"
      width={dimension}
      height={dimension}
      priority
      className={cn("rounded-md object-cover", className)}
    />
  );
  if (!withLink) return content;
  return (
    <Link href="/" aria-label="Hill House home">
      {content}
    </Link>
  );
}
