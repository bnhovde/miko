"use client";

import "backpack.css";
import "styles/index.css";

import { useEffect } from "react";
import { outlineWatcher } from "lib/a11y";
import { Sen } from "next/font/google";

const sen = Sen({ subsets: ["latin"], weight: ["400", "700"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    outlineWatcher();
  }, []);

  return (
    <html lang="en" className={sen.className}>
      <body>{children}</body>
    </html>
  );
}
