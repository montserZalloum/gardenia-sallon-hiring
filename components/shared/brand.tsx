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
      src="/logo-new.png"
      alt="Gardenia"
      width={dimension}
      height={dimension}
      priority
      // style={{ filter: "invert(1)" }}
      className={cn("rounded-md object-cover", className)}
    />
  );
  if (!withLink) return content;
  return (
    <Link href="/" aria-label="Gardenia home">
      {content}
    </Link>
  );
}
