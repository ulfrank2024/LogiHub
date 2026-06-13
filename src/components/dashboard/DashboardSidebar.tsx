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
    { href: "expediteur", label: { fr: "Tableau de bord", en: "Dashboard" }, icon: LayoutDashboard },
    { href: "expediteur/envois", label: { fr: "Mes envois", en: "My shipments" }, icon: Package2 },
    { href: "expediteur/nouveau", label: { fr: "Nouvel envoi", en: "New shipment" }, icon: PackagePlus },
  ],
  RESPONSABLE_ENTREPOT: [
    { href: "entrepot", label: { fr: "Tableau de bord", en: "Dashboard" }, icon: LayoutDashboard },
    { href: "entrepot/inventaire", label: { fr: "Inventaire", en: "Inventory" }, icon: Warehouse },
  ],
  ADMIN: [
    { href: "admin", label: { fr: "Tableau de bord", en: "Dashboard" }, icon: LayoutDashboard },
    { href: "admin/utilisateurs", label: { fr: "Utilisateurs", en: "Users" }, icon: Users },
    { href: "admin/demandes", label: { fr: "Demandes entrepôt", en: "Warehouse requests" }, icon: Warehouse },
    { href: "admin/transactions", label: { fr: "Transactions", en: "Transactions" }, icon: BarChart3 },
  ],
};

const roleLabel: Record<string, { fr: string; en: string }> = {
  EXPEDITEUR: { fr: "Expéditeur", en: "Sender" },
  RESPONSABLE_ENTREPOT: { fr: "Resp. Entrepôt", en: "Warehouse Mgr" },
  ADMIN: { fr: "Administrateur", en: "Administrator" },
};

export function DashboardSidebar({ user, locale }: { user: User; locale: string }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const isFr = locale === "fr";
  const nav = navByRole[user.role];

  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className="hidden md:flex flex-col w-64 min-h-screen bg-secondary text-secondary-foreground border-r border-sidebar-border shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-sidebar-border">
        <Link href={`/${locale}`}>
          <Image
            src="/logo.png"
            alt="LOGIHUB"
            width={180}
            height={52}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Profil utilisateur */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <UserAvatar seed={user.id} role={user.role} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-secondary-foreground truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-secondary-foreground/60 truncate">
            {roleLabel[user.role][isFr ? "fr" : "en"]}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}/dashboard/${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-secondary-foreground/80 hover:bg-sidebar-accent hover:text-secondary-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label[isFr ? "fr" : "en"]}
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <Link
          href={`/${locale}/dashboard/settings`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-foreground/80 hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          {isFr ? "Paramètres" : "Settings"}
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: `/${locale}` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isFr ? "Déconnexion" : "Sign out"}
        </button>
      </div>
    </motion.aside>
  );
}
