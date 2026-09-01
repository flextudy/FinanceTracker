"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/layout/brand";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Settlements",
    href: "/settlements",
    icon: ArrowLeftRight,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { }
    localStorage.removeItem("flextudy-current-user-id");
    window.location.href = "/sign-in";
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#e3d6c5]/70 bg-[#fff8f1] h-screen sticky top-0 justify-between p-6 select-none z-40">
      {/* Top Brand Header & Navigation */}
      <div className="space-y-8">
        {/* Brand Logo */}
        <Brand />

        {/* Nav Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#8e8b87] mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-[14px] text-sm font-semibold transition-all duration-200 group",
                  isActive
                    ? "bg-[#fa5d00] text-white shadow-[0px_1px_4px_0px_rgba(250,93,0,0.25)]"
                    : "text-[#615f5c] hover:bg-white hover:text-[#1d1e1c]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive
                        ? "text-white"
                        : "text-[#8e8b87] group-hover:text-[#fa5d00]"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Settings Section */}
      <div className="space-y-3 pt-4 border-t border-[#e3d6c5]/70 pb-2">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-semibold text-[#615f5c] hover:bg-white hover:text-[#1d1e1c] transition-all w-full"
          >
            <Settings className="w-4 h-4 text-[#8e8b87] shrink-0" />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Card */}
        <div className="bg-white border border-[#e3d6c5] rounded-[16px] p-3 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#fa5d00] text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "--"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1d1e1c] truncate">
                {user?.name ?? "Loading partner…"}
              </p>
              <p className="text-[11px] text-[#8e8b87] truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="text-[#8e8b87] hover:text-[#fa5d00] p-1.5 rounded-lg hover:bg-[#fff8f1] transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
