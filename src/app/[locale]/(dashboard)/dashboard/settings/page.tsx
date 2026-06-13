"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserProfile } from "@clerk/nextjs";
import { fadeInUp } from "@/lib/animations";

export default function SettingsPage() {
  const { locale } = useParams<{ locale: string }>();
  const isFr = locale === "fr";

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? "Paramètres du compte" : "Account settings"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr
            ? "Gérez vos informations personnelles, sécurité et préférences."
            : "Manage your personal information, security and preferences."}
        </p>
      </div>

      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-border rounded-2xl",
            navbar: "hidden",
          },
        }}
      />
    </motion.div>
  );
}
