import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { frFR, enUS } from "@clerk/localizations";

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
    <ClerkProvider localization={clerkLocalization}>
      <NextIntlClientProvider messages={messages}>
        {children}
        <Toaster richColors position="top-right" />
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
