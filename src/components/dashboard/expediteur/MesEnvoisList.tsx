"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package2, PackagePlus, Truck, CheckCircle2, Clock,
  AlertCircle, Search, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, buttonVariants, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type ShipmentStatus =
  | "EN_ATTENTE" | "EN_COURS_MATCHING" | "ACCEPTE"
  | "EN_ENTREPOT_CA" | "EN_TRANSIT" | "EN_ENTREPOT_CM"
  | "EN_LIVRAISON" | "LIVRE" | "ANNULE" | "LITIGE";

type Shipment = {
  id: string; status: ShipmentStatus; origin: string; destination: string;
  weight: number; price: number; createdAt: Date;
  payment: { status: string; amount: number } | null;
};

const statusConfig: Record<ShipmentStatus, { label: { fr: string; en: string }; color: string; icon: React.ElementType }> = {
  EN_ATTENTE:        { label: { fr: "En attente",          en: "Pending" },           color: "bg-yellow-100 text-yellow-800", icon: Clock },
  EN_COURS_MATCHING: { label: { fr: "Recherche transporteur", en: "Finding carrier" }, color: "bg-blue-100 text-blue-800",   icon: Clock },
  ACCEPTE:           { label: { fr: "Accepté",             en: "Accepted" },           color: "bg-blue-100 text-blue-800",   icon: CheckCircle2 },
  EN_ENTREPOT_CA:    { label: { fr: "Entrepôt Canada",     en: "Warehouse CA" },       color: "bg-purple-100 text-purple-800", icon: Package2 },
  EN_TRANSIT:        { label: { fr: "En transit",          en: "In transit" },         color: "bg-orange-100 text-orange-800", icon: Truck },
  EN_ENTREPOT_CM:    { label: { fr: "Entrepôt Cameroun",   en: "Warehouse CM" },       color: "bg-purple-100 text-purple-800", icon: Package2 },
  EN_LIVRAISON:      { label: { fr: "En livraison",        en: "Out for delivery" },   color: "bg-orange-100 text-orange-800", icon: Truck },
  LIVRE:             { label: { fr: "Livré",               en: "Delivered" },          color: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  ANNULE:            { label: { fr: "Annulé",              en: "Cancelled" },          color: "bg-red-100 text-red-800",     icon: AlertCircle },
  LITIGE:            { label: { fr: "Litige",              en: "Dispute" },            color: "bg-red-100 text-red-800",     icon: AlertCircle },
};

const filterGroups = [
  { key: "ALL",       label: { fr: "Tous",       en: "All" } },
  { key: "EN_COURS",  label: { fr: "En cours",   en: "In progress" } },
  { key: "LIVRE",     label: { fr: "Livrés",     en: "Delivered" } },
  { key: "ANNULE",    label: { fr: "Annulés",    en: "Cancelled" } },
] as const;

type FilterKey = typeof filterGroups[number]["key"];

const inProgress: ShipmentStatus[] = ["EN_ATTENTE","EN_COURS_MATCHING","ACCEPTE","EN_ENTREPOT_CA","EN_TRANSIT","EN_ENTREPOT_CM","EN_LIVRAISON"];

export function MesEnvoisList({ shipments, locale }: { shipments: Shipment[]; locale: string }) {
  const isFr = locale === "fr";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const filtered = shipments.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.origin.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q);
    const matchFilter =
      filter === "ALL" ? true :
      filter === "EN_COURS" ? inProgress.includes(s.status) :
      s.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: shipments.length,
    enCours: shipments.filter((s) => inProgress.includes(s.status)).length,
    livres: shipments.filter((s) => s.status === "LIVRE").length,
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            <Package2 className="inline w-6 h-6 text-primary mr-2" />
            {isFr ? "Mes envois" : "My shipments"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isFr ? `${stats.total} envoi${stats.total > 1 ? "s" : ""} au total.` : `${stats.total} shipment${stats.total !== 1 ? "s" : ""} total.`}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard/expediteur/nouveau`}
          className={cn(buttonVariants({ size: "sm" }), "gap-2")}
        >
          <PackagePlus className="w-4 h-4" />
          {isFr ? "Nouvel envoi" : "New shipment"}
        </Link>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
        {[
          { label: isFr ? "Total" : "Total", value: stats.total, color: "text-primary" },
          { label: isFr ? "En cours" : "In progress", value: stats.enCours, color: "text-orange-500" },
          { label: isFr ? "Livrés" : "Delivered", value: stats.livres, color: "text-green-500" },
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
            placeholder={isFr ? "Rechercher par ville..." : "Search by city..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterGroups.map((fg) => (
            <button
              key={fg.key}
              onClick={() => setFilter(fg.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                filter === fg.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {fg.label[isFr ? "fr" : "en"]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Liste */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {filtered.length} {isFr ? "résultat(s)" : "result(s)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground">
                <Package2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isFr ? "Aucun envoi trouvé." : "No shipments found."}</p>
                {shipments.length === 0 && (
                  <Link
                    href={`/${locale}/dashboard/expediteur/nouveau`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                  >
                    {isFr ? "Créer mon premier envoi" : "Create my first shipment"}
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        isFr ? "Trajet" : "Route",
                        isFr ? "Poids" : "Weight",
                        isFr ? "Prix" : "Price",
                        isFr ? "Statut" : "Status",
                        isFr ? "Paiement" : "Payment",
                        isFr ? "Date" : "Date",
                      ].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((s) => {
                      const cfg = statusConfig[s.status];
                      const Icon = cfg.icon;
                      const payStatus = s.payment?.status;
                      return (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium">{s.origin} → {s.destination}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{s.weight} kg</td>
                          <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(s.price)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                              {cfg.label[isFr ? "fr" : "en"]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {payStatus ? (
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                payStatus === "PAYE" ? "bg-green-100 text-green-800" :
                                payStatus === "ECHOUE" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              )}>
                                {payStatus === "PAYE" ? (isFr ? "Payé" : "Paid") :
                                 payStatus === "ECHOUE" ? (isFr ? "Échoué" : "Failed") :
                                 (isFr ? "En attente" : "Pending")}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
