"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Settlements", href: "/settlements", icon: ArrowLeftRight },
  ];

  return (
    <header className="md:hidden sticky top-0 z-50 bg-[#fff8f1]/95 backdrop-blur-md border-b border-[#e3d6c5] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand Logo */}
        <Brand compact />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-[#fa5d00] text-white font-bold text-xs flex items-center justify-center">
            {user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "--"}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-white border border-[#c0bbb6] text-[#1d1e1c]"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[#e3d6c5] space-y-2 pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#fa5d00] text-white"
                    : "text-[#615f5c] hover:bg-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#e3d6c5]/60 space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#615f5c]"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#fa5d00]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
