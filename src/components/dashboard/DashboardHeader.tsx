"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";
type User = { id: string; firstName: string; lastName: string; role: Role; email: string };

const pageTitles: Record<string, { fr: string; en: string }> = {
  "/dashboard/expediteur": { fr: "Mon tableau de bord", en: "My dashboard" },
  "/dashboard/expediteur/envois": { fr: "Mes envois", en: "My shipments" },
  "/dashboard/expediteur/nouveau": { fr: "Nouvel envoi", en: "New shipment" },
  "/dashboard/transporteur": { fr: "Mon tableau de bord", en: "My dashboard" },
  "/dashboard/transporteur/disponibles": { fr: "Envois disponibles", en: "Available shipments" },
  "/dashboard/transporteur/missions": { fr: "Mes missions", en: "My missions" },
  "/dashboard/entrepot": { fr: "Mon tableau de bord", en: "My dashboard" },
  "/dashboard/entrepot/inventaire": { fr: "Inventaire", en: "Inventory" },
  "/dashboard/admin": { fr: "Administration", en: "Administration" },
  "/dashboard/admin/utilisateurs": { fr: "Utilisateurs", en: "Users" },
  "/dashboard/admin/transactions": { fr: "Transactions", en: "Transactions" },
  "/dashboard/admin/entrepots": { fr: "Entrepôts", en: "Warehouses" },
};

export function DashboardHeader({ user, locale }: { user: User; locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isFr = locale === "fr";
  const [mobileOpen, setMobileOpen] = useState(false);

  const relPath = pathname.replace(`/${locale}`, "");
  const title = pageTitles[relPath]?.[isFr ? "fr" : "en"] ?? "Dashboard";

  function switchLocale() {
    const next = isFr ? "en" : "fr";
    router.push(pathname.replace(`/${locale}`, `/${next}`));
  }

  return (
    <motion.header
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border"
    >
      {/* Titre de page */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h1>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">
        {/* Switch langue */}
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Globe className="w-4 h-4" />
          {isFr ? "EN" : "FR"}
        </button>

        {/* Cloche notifications */}
        <NotificationBell locale={locale} />

        {/* Avatar utilisateur */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <UserAvatar seed={user.id} role={user.role} size="sm" />
          <span className="hidden sm:block text-sm font-medium text-foreground">
            {user.firstName}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
