"use client";

import { useEffect, useState } from "react";

interface ReadingProgressProps {
  progress: number; // 0 to 100
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only when mounted to avoid hydration mismatch
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-primary z-[60] transition-all duration-150 ease-out"
      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
    />
  );
}
