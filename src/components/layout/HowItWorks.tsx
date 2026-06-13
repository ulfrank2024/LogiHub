"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PackagePlus, UserCheck, Bell } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const icons = [PackagePlus, UserCheck, Bell];
const colors = ["text-[#D4A017]", "text-[#52B788]", "text-[#2E86AB]"];
const bgColors = ["bg-[#D4A017]/10", "bg-[#52B788]/10", "bg-[#2E86AB]/10"];

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const steps = [
    { key: "step1", icon: 0 },
    { key: "step2", icon: 1 },
    { key: "step3", icon: 2 },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-14"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("title")}
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion */}
            <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#D4A017]/30 via-[#52B788]/30 to-[#2E86AB]/30" />

            {steps.map((step, i) => {
              const Icon = icons[step.icon];
              return (
                <motion.div
                  key={step.key}
                  variants={fadeInUp}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl ${bgColors[i]} flex items-center justify-center mb-5 relative`}
                  >
                    <Icon className={`w-9 h-9 ${colors[i]}`} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {t(`${step.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
