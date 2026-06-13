"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package2, Search, Filter, Loader2, ChevronDown,
  Truck, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type ShipmentStatus =
  | "EN_ATTENTE" | "EN_COURS_MATCHING" | "ACCEPTE"
  | "EN_ENTREPOT_CA" | "EN_TRANSIT" | "EN_ENTREPOT_CM"
  | "EN_LIVRAISON" | "LIVRE" | "ANNULE" | "LITIGE";

type Shipment = {
  id: string; status: ShipmentStatus; origin: string; destination: string;
  weight: number; price: number; createdAt: Date;
  sender: { firstName: string; lastName: string; email: string };
  payment: { status: string; amount: number } | null;
};

const STATUS_FLOW: ShipmentStatus[] = [
  "EN_ATTENTE", "EN_COURS_MATCHING", "ACCEPTE",
  "EN_ENTREPOT_CA", "EN_TRANSIT", "EN_ENTREPOT_CM",
  "EN_LIVRAISON", "LIVRE", "ANNULE", "LITIGE",
];

const statusConfig: Record<ShipmentStatus, { label: { fr: string; en: string }; color: string; icon: React.ElementType }> = {
  EN_ATTENTE:        { label: { fr: "En attente",           en: "Pending" },           color: "bg-yellow-100 text-yellow-800", icon: Clock },
  EN_COURS_MATCHING: { label: { fr: "Rech. transporteur",  en: "Finding carrier" },   color: "bg-blue-100 text-blue-800",    icon: Clock },
  ACCEPTE:           { label: { fr: "Accepté",              en: "Accepted" },          color: "bg-blue-100 text-blue-800",    icon: CheckCircle2 },
  EN_ENTREPOT_CA:    { label: { fr: "Entrepôt Canada",      en: "Warehouse CA" },      color: "bg-purple-100 text-purple-800", icon: Package2 },
  EN_TRANSIT:        { label: { fr: "En transit",           en: "In transit" },        color: "bg-orange-100 text-orange-800", icon: Truck },
  EN_ENTREPOT_CM:    { label: { fr: "Entrepôt Cameroun",    en: "Warehouse CM" },      color: "bg-purple-100 text-purple-800", icon: Package2 },
  EN_LIVRAISON:      { label: { fr: "En livraison",         en: "Out for delivery" },  color: "bg-orange-100 text-orange-800", icon: Truck },
  LIVRE:             { label: { fr: "Livré",                en: "Delivered" },         color: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  ANNULE:            { label: { fr: "Annulé",               en: "Cancelled" },         color: "bg-red-100 text-red-800",     icon: AlertCircle },
  LITIGE:            { label: { fr: "Litige",               en: "Dispute" },           color: "bg-red-100 text-red-800",     icon: AlertCircle },
};

const filterGroups = [
  { key: "ALL",      label: { fr: "Tous",       en: "All" } },
  { key: "PENDING",  label: { fr: "En cours",   en: "In progress" } },
  { key: "LIVRE",    label: { fr: "Livrés",     en: "Delivered" } },
  { key: "PROBLEME", label: { fr: "Problèmes",  en: "Issues" } },
] as const;

type FilterKey = typeof filterGroups[number]["key"];
const inProgress: ShipmentStatus[] = ["EN_ATTENTE","EN_COURS_MATCHING","ACCEPTE","EN_ENTREPOT_CA","EN_TRANSIT","EN_ENTREPOT_CM","EN_LIVRAISON"];

export function ShipmentsAdmin({ shipments: initial, locale }: { shipments: Shipment[]; locale: string }) {
  const isFr = locale === "fr";
  const [shipments, setShipments] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = shipments.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.sender.firstName.toLowerCase().includes(q) ||
      s.sender.lastName.toLowerCase().includes(q) ||
      s.sender.email.toLowerCase().includes(q);
    const matchFilter =
      filter === "ALL"      ? true :
      filter === "PENDING"  ? inProgress.includes(s.status) :
      filter === "LIVRE"    ? s.status === "LIVRE" :
      ["ANNULE", "LITIGE"].includes(s.status);
    return matchSearch && matchFilter;
  });

  async function handleStatusChange(shipmentId: string, newStatus: ShipmentStatus) {
    setLoadingId(shipmentId);
    try {
      const res = await fetch(`/api/admin/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setShipments((prev) => prev.map((s) => s.id === shipmentId ? { ...s, status: newStatus } : s));
      toast.success(isFr ? "Statut mis à jour." : "Status updated.");
    } catch {
      toast.error(isFr ? "Erreur lors de la mise à jour." : "Update failed.");
    } finally {
      setLoadingId(null);
    }
  }

  const stats = {
    total: shipments.length,
    enCours: shipments.filter((s) => inProgress.includes(s.status)).length,
    livres: shipments.filter((s) => s.status === "LIVRE").length,
    problemes: shipments.filter((s) => ["ANNULE","LITIGE"].includes(s.status)).length,
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* En-tête */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <Package2 className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Suivi des expéditions" : "Shipment tracking"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? `${stats.total} envois au total.` : `${stats.total} total shipments.`}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isFr ? "Total" : "Total",       value: stats.total,     color: "text-foreground" },
          { label: isFr ? "En cours" : "In progress", value: stats.enCours, color: "text-orange-500" },
          { label: isFr ? "Livrés" : "Delivered",   value: stats.livres,   color: "text-green-500" },
          { label: isFr ? "Problèmes" : "Issues",   value: stats.problemes, color: "text-red-500" },
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
            placeholder={isFr ? "Rechercher expéditeur, ville..." : "Search sender, city..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterGroups.map((fg) => (
            <button key={fg.key} onClick={() => setFilter(fg.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                filter === fg.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}>
              {fg.label[isFr ? "fr" : "en"]}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      isFr ? "Expéditeur" : "Sender",
                      isFr ? "Trajet" : "Route",
                      isFr ? "Poids" : "Weight",
                      isFr ? "Prix" : "Price",
                      isFr ? "Statut" : "Status",
                      isFr ? "Modifier statut" : "Change status",
                      isFr ? "Date" : "Date",
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                        {isFr ? "Aucun envoi trouvé." : "No shipments found."}
                      </td>
                    </tr>
                  ) : filtered.map((s) => {
                    const cfg = statusConfig[s.status];
                    const Icon = cfg.icon;
                    const isLoading = loadingId === s.id;
                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{s.sender.firstName} {s.sender.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{s.sender.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {s.origin} → {s.destination}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.weight} kg</td>
                        <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(s.price)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", cfg.color)}>
                            <Icon className="w-3 h-3" />
                            {cfg.label[isFr ? "fr" : "en"]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-flex items-center">
                            {isLoading ? (
                              <div className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-lg">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{isFr ? "Mise à jour..." : "Updating..."}</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <select
                                  value={s.status}
                                  onChange={(e) => handleStatusChange(s.id, e.target.value as ShipmentStatus)}
                                  disabled={["LIVRE", "ANNULE"].includes(s.status)}
                                  className={cn(
                                    "appearance-none pl-3 pr-7 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors",
                                    ["LIVRE","ANNULE"].includes(s.status) ? "opacity-50 cursor-not-allowed" : "hover:border-primary cursor-pointer"
                                  )}
                                >
                                  {STATUS_FLOW.map((st) => (
                                    <option key={st} value={st}>
                                      {statusConfig[st].label[isFr ? "fr" : "en"]}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(s.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
