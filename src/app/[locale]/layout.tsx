import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { frFR, enUS } from "@clerk/localizations";
// @clerk/localizations v7 — frFR et enUS disponibles
import "../globals.css";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LOGIHUB — Plateforme logistique Canada–Cameroun",
  description:
    "Envoyez vos colis entre le Canada et le Cameroun en toute confiance. Mise en relation avec des transporteurs vérifiés.",
  keywords: ["logistique", "Canada", "Cameroun", "diaspora", "envoi", "colis"],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const clerkLocalization = locale === "fr" ? frFR : enUS;

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider localization={clerkLocalization}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
