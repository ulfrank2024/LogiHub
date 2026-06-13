"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, PackagePlus, Package2,
  Warehouse, Users, BarChart3, Settings, LogOut, Truck,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { cn } from "@/lib/utils";
import { slideInLeft } from "@/lib/animations";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";

type User = {
  id: string; firstName: string; lastName: string;
  role: Role; email: string;
};

const navByRole: Record<string, { href: string; label: { fr: string; en: string }; icon: React.ElementType; primary?: boolean }[]> = {
  EXPEDITEUR: [
    { href: "expediteur",        label: { fr: "Tableau de bord", en: "Dashboard" },    icon: LayoutDashboard, primary: true },
    { href: "expediteur/envois", label: { fr: "Mes envois",      en: "My shipments" }, icon: Package2 },
    { href: "expediteur/nouveau",label: { fr: "Nouvel envoi",    en: "New shipment" }, icon: PackagePlus },
  ],
  RESPONSABLE_ENTREPOT: [
    { href: "entrepot",           label: { fr: "Tableau de bord", en: "Dashboard" }, icon: LayoutDashboard, primary: true },
    { href: "entrepot/inventaire",label: { fr: "Inventaire",      en: "Inventory" },  icon: Warehouse },
  ],
  ADMIN: [
    { href: "admin",              label: { fr: "Tableau de bord",   en: "Dashboard" },          icon: LayoutDashboard, primary: true },
    { href: "admin/envois",       label: { fr: "Suivi envois",      en: "Shipments" },          icon: Truck },
    { href: "admin/entrepots",    label: { fr: "Entrepôts",         en: "Warehouses" },         icon: Warehouse },
    { href: "admin/utilisateurs", label: { fr: "Utilisateurs",      en: "Users" },              icon: Users },
    { href: "admin/demandes",     label: { fr: "Demandes",          en: "Requests" },           icon: Package2 },
    { href: "admin/transactions", label: { fr: "Transactions",      en: "Transactions" },       icon: BarChart3 },
  ],
};

const roleLabel: Record<string, { fr: string; en: string }> = {
  EXPEDITEUR:           { fr: "Expéditeur",     en: "Sender" },
  RESPONSABLE_ENTREPOT: { fr: "Resp. Entrepôt", en: "Warehouse Mgr" },
  ADMIN:                { fr: "Administrateur", en: "Administrator" },
};

export function DashboardSidebar({ user, locale }: { user: User; locale: string }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const isFr = locale === "fr";
  const nav = navByRole[user.role] ?? [];

  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className="hidden md:flex flex-col w-64 shrink-0 rounded-3xl overflow-hidden m-3 sticky top-3 self-start h-[calc(100vh-1.5rem)]"
      style={{ background: "#1B4332" }}
    >
      {/* ── Zone logo — fond blanc pour visibilité maximale ── */}
      <div className="flex items-center justify-center bg-white px-4 py-4 border-b border-white/10">
        <Link href={`/${locale}`}>
          <Image
            src="/logo.png"
            alt="LOGIHUB"
            width={220}
            height={70}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* ── Profil utilisateur ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <UserAvatar seed={user.id} role={user.role} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-white/50 truncate">
            {roleLabel[user.role]?.[isFr ? "fr" : "en"]}
          </p>
        </div>
      </div>

      {/* ── Navigation principale ── */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map((item, index) => {
          const Icon = item.icon;
          const href = `/${locale}/dashboard/${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const isPrimary = item.primary;

          // Séparateur avant les sous-items
          const showSeparator = index === 1 && nav.length > 1;

          return (
            <div key={item.href}>
              {showSeparator && (
                <div className="flex items-center gap-2 px-2 pt-4 pb-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    {isFr ? "Pages" : "Pages"}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              )}

              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                  // Padding différent : primary = plein, sous-items = indenté
                  isPrimary ? "px-3 py-3" : "px-3 py-2 pl-4",
                  // Styles actif / hover différenciés
                  isActive && isPrimary
                    ? "bg-[#D4A017] text-[#1B4332] font-semibold shadow-md"
                    : isActive && !isPrimary
                    ? "bg-[#D4A017]/90 text-[#1B4332] font-semibold"
                    : isPrimary
                    ? "text-white hover:bg-white/15 hover:text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                )}
              >
                <Icon className={cn(
                  "shrink-0 transition-colors",
                  isPrimary ? "w-[18px] h-[18px]" : "w-[15px] h-[15px]",
                  isActive ? "text-[#1B4332]" : isPrimary ? "text-white/80 group-hover:text-white" : "text-white/40 group-hover:text-white/70"
                )} />
                <span className={cn(!isPrimary && "text-[13px]")}>
                  {item.label[isFr ? "fr" : "en"]}
                </span>

                {/* Point indicateur pour les sous-items au hover */}
                {!isPrimary && !isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-white/0 group-hover:bg-white/40 transition-colors" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* ── Bas de sidebar ── */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href={`/${locale}/dashboard/settings`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
            pathname.includes("/settings")
              ? "bg-[#D4A017] text-[#1B4332] font-semibold"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {isFr ? "Paramètres" : "Settings"}
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: `/${locale}` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isFr ? "Déconnexion" : "Sign out"}
        </button>
      </div>
    </motion.aside>
  );
}
