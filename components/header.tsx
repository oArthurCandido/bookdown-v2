"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Search, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppearanceSettings } from "./appearance-settings";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [url, setUrl] = React.useState("");

  const isReader = pathname.startsWith("/reader");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/reader?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8 gap-4">
        <div className="flex items-center gap-2">
          {isReader && (
            <Button variant="ghost" size="icon" asChild className="md:hidden">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Home</span>
              </Link>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block">Bookdown</span>
          </Link>
        </div>

        {isReader ? (
          <div className="flex flex-1 items-center gap-2 max-w-2xl px-2">
            <Button variant="outline" size="sm" onClick={onToggleSidebar} className="flex items-center gap-2 md:hidden">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Index</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste GitHub markdown URL..."
                className="w-full pl-8 bg-muted/50"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default">
              Load
            </Button>
          </form>
        )}

        <div className="flex items-center gap-2">
          {isReader && (
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/">
                Exit Reader
              </Link>
            </Button>
          )}
          <AppearanceSettings />
        </div>
      </div>
    </header>
  );
}
