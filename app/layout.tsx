import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flextudy Finance Tracker",
  description: "A private shared-finance workspace for Flextudy partners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#fff8f1] text-[#1d1e1c] font-sans">
        <script dangerouslySetInnerHTML={{ __html: "try { if (localStorage.getItem('flextudy-theme') === 'dark' || (!localStorage.getItem('flextudy-theme') && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark') } catch {}" }} />
        <CurrentUserProvider>{children}</CurrentUserProvider>
      </body>
    </html>
  );
}
