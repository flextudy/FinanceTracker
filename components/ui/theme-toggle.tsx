"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("flextudy-theme", next ? "dark" : "light"); };
  return <button onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-white text-[#615f5c] transition-colors hover:text-[#fa5d00] dark:border-[#2b3855] dark:bg-[#16213a] dark:text-[#d7dfef]">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>;
}
