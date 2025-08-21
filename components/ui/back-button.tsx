"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const target = getBackTarget(pathname);
  if (!target) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Go back"
      className={cn("rounded-full", className)}
      onClick={() => router.push(target)}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

function getBackTarget(pathname: string | null): string | null {
  if (!pathname) return "/";
  if (pathname === "/") return null;
  if (pathname === "/play") return "/";
  if (pathname.startsWith("/play/")) return "/play";
  if (pathname.startsWith("/results/")) return "/play";
  if (pathname === "/dashboard") return "/";
  return "/";
}
