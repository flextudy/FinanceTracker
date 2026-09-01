import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Brand } from "@/components/layout/brand";

export function Footer() {
  return (
    <footer className="bg-[#fff8f1] border-t border-[#e3d6c5] pt-16 pb-12 text-[#615f5c]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#e3d6c5]/80">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Brand />
            <p className="text-sm leading-relaxed max-w-sm text-[#615f5c]">
              A focused private workspace for tracking shared expenses and partner settlements.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-semibold text-[#1d1e1c] mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Time Tracking
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Invoicing & Payments
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Reporting & Analytics
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Apps & Extensions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h4 className="font-semibold text-[#1d1e1c] mb-4 text-sm uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  For Agencies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  For Freelancers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  For Teams
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Profitability
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="font-semibold text-[#1d1e1c] mb-4 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#fa5d00] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8e8b87] gap-4">
          <p>© {new Date().getFullYear()} Flextudy Finance Tracker. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#1d1e1c]">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#1d1e1c]">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-[#1d1e1c]">
              Cookie Settings
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
