import { useCallback, useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "miko-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "system";
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

export default function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = getStoredPreference();
    setPreference(stored);
    const theme = resolve(stored);
    setResolved(theme);
    applyTheme(theme);
  }, []);

  useEffect(() => {
    if (preference !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const theme = e.matches ? "dark" : "light";
      setResolved(theme);
      applyTheme(theme);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const toggle = useCallback(() => {
    const next: ThemePreference = resolved === "light" ? "dark" : "light";
    setPreference(next);
    setResolved(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, [resolved]);

  return { preference, resolved, toggle };
}
