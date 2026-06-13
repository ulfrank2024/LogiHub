"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Package, Truck, Warehouse, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";

const roles = [
  {
    value: "EXPEDITEUR" as Role,
    icon: Package,
    title: { fr: "Expéditeur", en: "Sender" },
    desc: {
      fr: "J'envoie des colis entre le Canada et le Cameroun",
      en: "I ship packages between Canada and Cameroon",
    },
    color: "from-[#D4A017]/20 to-[#E07B39]/10",
    border: "border-[#D4A017]/40 hover:border-[#D4A017]",
    iconColor: "text-[#D4A017]",
  },
  {
    value: "TRANSPORTEUR" as Role,
    icon: Truck,
    title: { fr: "Transporteur", en: "Carrier" },
    desc: {
      fr: "Je prends en charge et livre les envois",
      en: "I handle and deliver shipments",
    },
    color: "from-[#1B4332]/20 to-[#52B788]/10",
    border: "border-[#1B4332]/40 hover:border-[#1B4332]",
    iconColor: "text-[#52B788]",
  },
  {
    value: "RESPONSABLE_ENTREPOT" as Role,
    icon: Warehouse,
    title: { fr: "Responsable entrepôt", en: "Warehouse Manager" },
    desc: {
      fr: "Je gère les colis dans un entrepôt (CA ou CM)",
      en: "I manage packages in a warehouse (CA or CM)",
    },
    color: "from-[#1A3A5C]/20 to-[#2E86AB]/10",
    border: "border-[#1A3A5C]/40 hover:border-[#1A3A5C]",
    iconColor: "text-[#2E86AB]",
  },
  {
    value: "ADMIN" as Role,
    icon: Shield,
    title: { fr: "Administrateur", en: "Administrator" },
    desc: {
      fr: "Je gère la plateforme et les utilisateurs",
      en: "I manage the platform and users",
    },
    color: "from-[#4A0E8F]/20 to-[#7B2FBE]/10",
    border: "border-[#4A0E8F]/40 hover:border-[#4A0E8F]",
    iconColor: "text-[#7B2FBE]",
  },
];

export default function OnboardingPage() {
  const { locale } = useParams<{ locale: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const isFr = locale === "fr";

  async function handleSubmit() {
    if (!selected || !user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) throw new Error();
      toast.success(isFr ? "Profil créé avec succès !" : "Profile created!");
      router.push(`/${locale}/dashboard`);
    } catch {
      toast.error(isFr ? "Une erreur est survenue." : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen kente-pattern bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1
            className="text-4xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isFr ? "Bienvenue" : "Welcome"}{" "}
            <span className="text-primary">
              {user?.firstName ?? ""}
            </span>{" "}
            👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {isFr
              ? "Choisissez votre rôle sur la plateforme"
              : "Choose your role on the platform"}
          </p>
        </motion.div>

        {/* Cartes de rôle */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.value;
            return (
              <motion.button
                key={role.value}
                variants={scaleIn}
                onClick={() => setSelected(role.value)}
                className={`
                  relative text-left p-5 rounded-2xl border-2 transition-all duration-200
                  bg-gradient-to-br ${role.color} ${role.border}
                  ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]" : ""}
                `}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">✓</span>
                  </span>
                )}
                <Icon className={`w-8 h-8 mb-3 ${role.iconColor}`} />
                <h3
                  className="font-semibold text-foreground text-lg mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {role.title[isFr ? "fr" : "en"]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {role.desc[isFr ? "fr" : "en"]}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bouton continuer */}
        <motion.div variants={fadeInUp} className="flex justify-center">
          <Button
            size="lg"
            disabled={!selected || loading}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {isFr ? "Continuer" : "Continue"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
