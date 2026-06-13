"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, Package2, Warehouse, ChevronDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type Role = "EXPEDITEUR" | "TRANSPORTEUR" | "RESPONSABLE_ENTREPOT" | "ADMIN";

type User = {
  id: string; firstName: string; lastName: string; email: string;
  role: Role; country: string; phone: string | null; createdAt: Date;
  _count: { sentShipments: number };
};

const roleConfig: Record<Role, { label: { fr: string; en: string }; color: string; icon: React.ElementType }> = {
  EXPEDITEUR:           { label: { fr: "Expéditeur", en: "Sender" },          color: "bg-amber-100 text-amber-800",   icon: Package2 },
  TRANSPORTEUR:         { label: { fr: "Transporteur", en: "Carrier" },        color: "bg-green-100 text-green-800",   icon: Package2 },
  RESPONSABLE_ENTREPOT: { label: { fr: "Resp. Entrepôt", en: "Warehouse Mgr"}, color: "bg-blue-100 text-blue-800",    icon: Warehouse },
  ADMIN:                { label: { fr: "Administrateur", en: "Admin" },        color: "bg-red-100 text-red-800",       icon: Shield },
};

const assignableRoles: Role[] = ["EXPEDITEUR", "RESPONSABLE_ENTREPOT", "ADMIN"];

export function UsersManagement({ users: initial, currentAdminId, locale }: {
  users: User[]; currentAdminId: string; locale: string;
}) {
  const isFr = locale === "fr";
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<Role | "ALL">("ALL");

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  async function changeRole(userId: string, role: Role) {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      toast.success(isFr ? "Rôle mis à jour" : "Role updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : isFr ? "Erreur" : "Error");
    } finally {
      setLoadingId(null);
    }
  }

  const stats = {
    total: users.length,
    expediteurs: users.filter((u) => u.role === "EXPEDITEUR").length,
    entrepots: users.filter((u) => u.role === "RESPONSABLE_ENTREPOT").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <Users className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Gestion des utilisateurs" : "User management"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? `${stats.total} utilisateurs inscrits.` : `${stats.total} registered users.`}
        </p>
      </motion.div>

      {/* Stats rapides */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isFr ? "Total" : "Total", value: stats.total, color: "text-foreground" },
          { label: isFr ? "Expéditeurs" : "Senders", value: stats.expediteurs, color: "text-amber-600" },
          { label: isFr ? "Entrepôts" : "Warehouses", value: stats.entrepots, color: "text-blue-600" },
          { label: isFr ? "Admins" : "Admins", value: stats.admins, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isFr ? "Rechercher par nom ou email..." : "Search by name or email..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "EXPEDITEUR", "RESPONSABLE_ENTREPOT", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                filterRole === r
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {r === "ALL"
                ? isFr ? "Tous" : "All"
                : roleConfig[r].label[isFr ? "fr" : "en"]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {filtered.length} {isFr ? "résultat(s)" : "result(s)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{isFr ? "Aucun utilisateur trouvé." : "No users found."}</p>
                </div>
              ) : (
                filtered.map((u) => {
                  const cfg = roleConfig[u.role];
                  const isSelf = u.id === currentAdminId;
                  return (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <UserAvatar seed={u.id} role={u.role} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">
                            {u.firstName} {u.lastName}
                            {isSelf && <span className="ml-1 text-xs text-muted-foreground">(vous)</span>}
                          </p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                            {cfg.label[isFr ? "fr" : "en"]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {u.country === "CA" ? "🇨🇦" : "🇨🇲"} · {u._count.sentShipments} {isFr ? "envoi(s)" : "shipment(s)"} · {formatDate(u.createdAt)}
                        </p>
                      </div>

                      {/* Sélecteur de rôle */}
                      <div className="relative shrink-0">
                        {loadingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <div className="relative">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => changeRole(u.id, e.target.value as Role)}
                              className={cn(
                                "appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border border-border bg-background cursor-pointer transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                                isSelf && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {assignableRoles.map((r) => (
                                <option key={r} value={r}>
                                  {roleConfig[r].label[isFr ? "fr" : "en"]}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
