"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Package2, DollarSign, Bell, Warehouse,
  AlertTriangle, TrendingUp, UserCheck, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, buttonVariants, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";
import { AdminCharts } from "@/components/dashboard/admin/AdminCharts";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";
type Shipment = { id: string; status: string; origin: string; destination: string; price: number; createdAt: Date };
type User = { id: string; firstName: string; lastName: string; email: string; role: Role; createdAt: Date };
type Stats = {
  totalUsers: number; totalShipments: number; totalRevenue: number;
  pendingRequests: number; newUsersToday: number; shipmentsEnAttente: number;
};

const roleColors: Record<Role, string> = {
  EXPEDITEUR:           "bg-amber-100 text-amber-700",
  TRANSPORTEUR:         "bg-green-100 text-green-700",
  RESPONSABLE_ENTREPOT: "bg-blue-100 text-blue-700",
  ADMIN:                "bg-red-100 text-red-700",
};
const roleLabels: Record<Role, { fr: string; en: string }> = {
  EXPEDITEUR:           { fr: "Expéditeur",      en: "Sender" },
  TRANSPORTEUR:         { fr: "Transporteur",    en: "Carrier" },
  RESPONSABLE_ENTREPOT: { fr: "Resp. Entrepôt",  en: "Warehouse" },
  ADMIN:                { fr: "Admin",            en: "Admin" },
};

export function AdminDashboard({ user, stats, recentShipments, recentUsers, revenueData, shipmentsData, locale }: {
  user: User; stats: Stats;
  recentShipments: Shipment[]; recentUsers: User[];
  revenueData: { date: string; revenue: number }[];
  shipmentsData: { week: string; envois: number }[];
  locale: string;
}) {
  const isFr = locale === "fr";
  const hasAlerts = stats.pendingRequests > 0 || stats.shipmentsEnAttente > 5;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Titre */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Bonjour, ${user.firstName} 👋` : `Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Vue globale de la plateforme LOGIHUB." : "Global overview of the LOGIHUB platform."}
        </p>
      </motion.div>

      {/* Alertes actives */}
      {hasAlerts && (
        <motion.div variants={fadeInUp}>
          <div className="rounded-2xl border border-yellow-300 bg-yellow-50/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              {isFr ? "Alertes actives" : "Active alerts"}
            </div>
            <div className="space-y-1">
              {stats.pendingRequests > 0 && (
                <Link href={`/${locale}/dashboard/admin/demandes`}
                  className="flex items-center justify-between text-sm text-yellow-700 hover:text-yellow-900 py-1 px-2 rounded-lg hover:bg-yellow-100 transition-colors">
                  <span className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4" />
                    {isFr
                      ? `${stats.pendingRequests} demande(s) entrepôt en attente`
                      : `${stats.pendingRequests} warehouse request(s) pending`}
                  </span>
                  <span className="text-xs font-semibold">→</span>
                </Link>
              )}
              {stats.shipmentsEnAttente > 5 && (
                <div className="flex items-center gap-2 text-sm text-yellow-700 py-1 px-2">
                  <Package2 className="w-4 h-4" />
                  {isFr
                    ? `${stats.shipmentsEnAttente} envois en attente de traitement`
                    : `${stats.shipmentsEnAttente} shipments waiting to be processed`}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: isFr ? "Utilisateurs" : "Users",          value: stats.totalUsers,          icon: Users,       color: "text-primary",       sub: isFr ? `+${stats.newUsersToday} aujourd'hui` : `+${stats.newUsersToday} today` },
          { label: isFr ? "Envois total" : "Total shipments", value: stats.totalShipments,       icon: Package2,    color: "text-orange-500",    sub: isFr ? `${stats.shipmentsEnAttente} en attente` : `${stats.shipmentsEnAttente} pending` },
          { label: isFr ? "Revenus" : "Revenue",             value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-500", sub: "CAD" },
          { label: isFr ? "Demandes entrepôt" : "Requests",  value: stats.pendingRequests,      icon: Bell,        color: stats.pendingRequests > 0 ? "text-yellow-500" : "text-muted-foreground", sub: isFr ? "en attente" : "pending" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={cardHover} whileHover="hover">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{stat.sub}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl bg-muted", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions rapides */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
        <Link href={`/${locale}/dashboard/admin/utilisateurs`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <Users className="w-4 h-4" />
          {isFr ? "Gérer les utilisateurs" : "Manage users"}
        </Link>
        <Link href={`/${locale}/dashboard/admin/demandes`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2", stats.pendingRequests > 0 && "border-yellow-400 text-yellow-700 hover:bg-yellow-50")}>
          <Warehouse className="w-4 h-4" />
          {isFr ? "Demandes entrepôt" : "Warehouse requests"}
          {stats.pendingRequests > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {stats.pendingRequests}
            </span>
          )}
        </Link>
        <Link href={`/${locale}/dashboard/admin/transactions`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <TrendingUp className="w-4 h-4" />
          {isFr ? "Transactions" : "Transactions"}
        </Link>
      </motion.div>

      {/* Graphiques */}
      <motion.div variants={fadeInUp}>
        <AdminCharts revenueData={revenueData} shipmentsData={shipmentsData} locale={locale} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers envois */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package2 className="w-4 h-4 text-muted-foreground" />
                {isFr ? "Derniers envois" : "Recent shipments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentShipments.length === 0 ? (
                <p className="text-sm text-center py-6 text-muted-foreground">
                  {isFr ? "Aucun envoi." : "No shipments."}
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentShipments.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2.5 gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.origin} → {s.destination}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(s.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-primary">{formatCurrency(s.price)}</p>
                        <p className="text-xs text-muted-foreground">{s.status}</p>
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
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
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
                    <div key={u.id} className="flex items-center justify-between py-2.5 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleColors[u.role])}>
                          {roleLabels[u.role][isFr ? "fr" : "en"]}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                      </div>
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
