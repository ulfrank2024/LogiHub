"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Package2, DollarSign, TrendingUp, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, buttonVariants, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";
type Shipment = { id: string; status: string; origin: string; destination: string; price: number; createdAt: Date };
type User = { id: string; firstName: string; lastName: string; email: string; role: Role; createdAt: Date };
type Stats = { totalUsers: number; totalShipments: number; totalRevenue: number };

const roleColors: Record<Role, string> = {
  EXPEDITEUR: "bg-blue-100 text-blue-700",
  TRANSPORTEUR: "bg-orange-100 text-orange-700",
  RESPONSABLE_ENTREPOT: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};
const roleLabels: Record<Role, { fr: string; en: string }> = {
  EXPEDITEUR: { fr: "Expéditeur", en: "Sender" },
  TRANSPORTEUR: { fr: "Transporteur", en: "Carrier" },
  RESPONSABLE_ENTREPOT: { fr: "Resp. Entrepôt", en: "Warehouse Mgr" },
  ADMIN: { fr: "Admin", en: "Admin" },
};

export function AdminDashboard({ user, stats, recentShipments, recentUsers, locale }: {
  user: User; stats: Stats; recentShipments: Shipment[]; recentUsers: User[]; locale: string;
}) {
  const isFr = locale === "fr";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Administration — Bonjour, ${user.firstName} 👋` : `Administration — Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Vue globale de la plateforme LOGIHUB." : "Global overview of the LOGIHUB platform."}
        </p>
      </motion.div>

      {/* KPI globaux */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: isFr ? "Utilisateurs" : "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
          { label: isFr ? "Envois" : "Shipments", value: stats.totalShipments, icon: Package2, color: "text-orange-500" },
          { label: isFr ? "Revenus" : "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-500" },
          { label: isFr ? "Moy. par envoi" : "Avg per shipment", value: stats.totalShipments > 0 ? formatCurrency(stats.totalRevenue / stats.totalShipments) : "—", icon: TrendingUp, color: "text-purple-500" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={cardHover} whileHover="hover">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={cn("p-3 rounded-xl bg-muted", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Raccourcis admin */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
        <Link href={`/${locale}/dashboard/admin/utilisateurs`} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <Users className="w-4 h-4" /> {isFr ? "Gérer les utilisateurs" : "Manage users"}
        </Link>
        <Link href={`/${locale}/dashboard/admin/entrepots`} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <Warehouse className="w-4 h-4" /> {isFr ? "Gérer les entrepôts" : "Manage warehouses"}
        </Link>
        <Link href={`/${locale}/dashboard/admin/transactions`} className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <DollarSign className="w-4 h-4" /> {isFr ? "Toutes les transactions" : "All transactions"}
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers envois */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                {isFr ? "Derniers envois" : "Recent shipments"}
              </CardTitle>
              <Link href={`/${locale}/dashboard/admin/transactions`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                {isFr ? "Voir tout" : "See all"}
              </Link>
            </CardHeader>
            <CardContent>
              {recentShipments.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground">
                  {isFr ? "Aucun envoi." : "No shipments."}
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentShipments.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium">{s.origin} → {s.destination}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{formatCurrency(s.price)}</p>
                        <span className="text-xs text-muted-foreground">{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Derniers utilisateurs */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                {isFr ? "Nouveaux utilisateurs" : "New users"}
              </CardTitle>
              <Link href={`/${locale}/dashboard/admin/utilisateurs`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                {isFr ? "Voir tout" : "See all"}
              </Link>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground">
                  {isFr ? "Aucun utilisateur." : "No users."}
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColors[u.role])}>
                        {roleLabels[u.role][isFr ? "fr" : "en"]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
