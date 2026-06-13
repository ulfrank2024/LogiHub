"use client";

import { SignIn } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function SignInPage() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center kente-pattern bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            LOGIHUB
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {locale === "fr" ? "Content de vous revoir" : "Welcome back"}
          </p>
        </div>

        <SignIn
          routing="path"
          path={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          fallbackRedirectUrl={`/${locale}/onboarding`}
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-border rounded-2xl bg-card",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border border-border hover:bg-muted transition-colors",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />
      </div>
    </div>
  );
}
