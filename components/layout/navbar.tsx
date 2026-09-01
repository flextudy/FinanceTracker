import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Brand } from "@/components/layout/brand";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#fff8f1]/90 backdrop-blur-md border-b border-[#e3d6c5]/60 transition-all">
      <Container className="flex items-center justify-between h-20">
        {/* Brand Logo */}
        <Brand />

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-8 text-[#1d1e1c] font-medium text-base">
          <Link
            href="/features"
            className="flex items-center gap-1 hover:text-[#fa5d00] transition-colors"
          >
            Features <ChevronDown className="w-4 h-4 text-[#8e8b87]" />
          </Link>
          <Link
            href="/why-flextudy"
            className="flex items-center gap-1 hover:text-[#fa5d00] transition-colors"
          >
            Why Flextudy <ChevronDown className="w-4 h-4 text-[#8e8b87]" />
          </Link>
          <Link
            href="/pricing"
            className="hover:text-[#fa5d00] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="flex items-center gap-1 hover:text-[#fa5d00] transition-colors"
          >
            Resources <ChevronDown className="w-4 h-4 text-[#8e8b87]" />
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden sm:inline-block text-base font-medium text-[#1d1e1c] hover:text-[#fa5d00] transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Button variant="primary" size="md">
            Open workspace
          </Button>
        </div>
      </Container>
    </header>
  );
}
