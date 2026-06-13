import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
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
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
