import { useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { HowItWorks } from "@/components/layout/HowItWorks";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  const t = useTranslations("nav");
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          LOGIHUB
        </p>
        <p className="text-sm text-secondary-foreground/70">
          © 2026 LOGIHUB · Canada ↔ Cameroun
        </p>
      </div>
    </footer>
  );
}
