"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, PackagePlus, Package2,
  Warehouse, Users, BarChart3, Settings, LogOut,
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

const navByRole: Record<string, { href: string; label: { fr: string; en: string }; icon: React.ElementType }[]> = {
  EXPEDITEUR: [
    { href: "expediteur",        label: { fr: "Tableau de bord", en: "Dashboard" },    icon: LayoutDashboard },
    { href: "expediteur/envois", label: { fr: "Mes envois",      en: "My shipments" }, icon: Package2 },
    { href: "expediteur/nouveau",label: { fr: "Nouvel envoi",    en: "New shipment" }, icon: PackagePlus },
  ],
  RESPONSABLE_ENTREPOT: [
    { href: "entrepot",           label: { fr: "Tableau de bord", en: "Dashboard" }, icon: LayoutDashboard },
    { href: "entrepot/inventaire",label: { fr: "Inventaire",      en: "Inventory" },  icon: Warehouse },
  ],
  ADMIN: [
    { href: "admin",                label: { fr: "Tableau de bord",   en: "Dashboard" },          icon: LayoutDashboard },
    { href: "admin/utilisateurs",   label: { fr: "Utilisateurs",      en: "Users" },              icon: Users },
    { href: "admin/demandes",       label: { fr: "Demandes entrepôt", en: "Warehouse requests" }, icon: Warehouse },
    { href: "admin/transactions",   label: { fr: "Transactions",      en: "Transactions" },       icon: BarChart3 },
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
      className="hidden md:flex flex-col w-64 min-h-screen shrink-0"
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
        {nav.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}/dashboard/${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-[#D4A017] text-[#1B4332] font-semibold shadow-md"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              {/* Indicateur latéral actif */}
              <span className={cn(
                "absolute left-0 h-7 w-1 rounded-r-full bg-[#D4A017] transition-all duration-150",
                isActive ? "opacity-0" : "opacity-0 group-hover:opacity-30"
              )} />
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#1B4332]" : "text-white/60 group-hover:text-white")} />
              {item.label[isFr ? "fr" : "en"]}
            </Link>
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
