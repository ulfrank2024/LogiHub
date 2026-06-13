"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { cn, buttonVariants } from "@/lib/utils";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { fadeInUp, staggerContainer, slideInRight } from "@/lib/animations";

const avatarSeeds = [
  { seed: "amara-diallo", role: "EXPEDITEUR" as const },
  { seed: "kevin-nkosi", role: "TRANSPORTEUR" as const },
  { seed: "fatou-bamba", role: "EXPEDITEUR" as const },
  { seed: "pierre-mvogo", role: "RESPONSABLE_ENTREPOT" as const },
];

export function HeroSection() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden kente-pattern bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Texte gauche */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <MapPin className="w-3.5 h-3.5" />
                {t("badge")}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl lg:text-6xl font-extrabold leading-tight text-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("title")}
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              {t("subtitle")}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-10">
              <Link
                href={`/${locale}/sign-up`}
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-base font-semibold")}
              >
                {t("cta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 h-12 text-base")}
              >
                {t("ctaSecondary")}
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 text-sm">
              {[t("stat1"), t("stat2"), t("stat3")].map((stat) => (
                <div key={stat} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {stat}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Avatars droite */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: "30s" }} />
              <div className="absolute inset-8 rounded-full bg-primary/5 border border-primary/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-primary" style={{ fontFamily: "var(--font-heading)" }}>LOGI</p>
                  <p className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>HUB</p>
                </div>
              </div>
              {avatarSeeds.map((a, i) => {
                const angle = (i / avatarSeeds.length) * 2 * Math.PI;
                const x = Math.cos(angle) * 120;
                const y = Math.sin(angle) * 120;
                return (
                  <motion.div
                    key={a.seed}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                    className="absolute"
                    style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                  >
                    <UserAvatar seed={a.seed} role={a.role} size="md" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
