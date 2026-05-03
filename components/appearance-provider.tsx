"use client";

import * as React from "react";
import { useAppearanceStore } from "@/lib/store";

export function AppearanceProvider() {
  const { fontFamily, fontSize } = useAppearanceStore();

  React.useEffect(() => {
    const root = document.documentElement;
    
    // Set font family class
    if (fontFamily === 'serif') {
      root.classList.add('font-serif-theme');
    } else {
      root.classList.remove('font-serif-theme');
    }

    // Set font size css variable
    root.style.setProperty('--reader-font-size', `${fontSize}px`);
  }, [fontFamily, fontSize]);

  return null;
}
