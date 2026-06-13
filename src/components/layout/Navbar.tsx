"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { cn, buttonVariants } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function Navbar() {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { isSignedIn } = useAuth();
  const otherLocale = locale === "fr" ? "en" : "fr";
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/logo.png"
              alt="LOGIHUB"
              width={220}
              height={70}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Switch langue */}
            <Link
              href={`/${otherLocale}${pathnameWithoutLocale}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              {otherLocale.toUpperCase()}
            </Link>

            {!isSignedIn ? (
              <>
                <Link
                  href={`/${locale}/sign-in`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href={`/${locale}/sign-up`}
                  className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                >
                  {t("signUp")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  {t("dashboard")}
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
