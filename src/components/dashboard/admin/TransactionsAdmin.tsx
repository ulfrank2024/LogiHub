"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package2, DollarSign, Clock, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type PaymentStatus = "EN_ATTENTE" | "PAYE" | "REMBOURSE" | "ECHOUE";
type ShipmentStatus = string;

type Shipment = {
  id: string; status: ShipmentStatus; origin: string; destination: string;
  weight: number; price: number; createdAt: Date;
  sender: { firstName: string; lastName: string; email: string };
  payment: { amount: number; status: PaymentStatus; method: string; createdAt: Date } | null;
};

const paymentStatusConfig: Record<PaymentStatus, { label: { fr: string; en: string }; color: string }> = {
  EN_ATTENTE: { label: { fr: "En attente", en: "Pending" },     color: "bg-yellow-100 text-yellow-800" },
  PAYE:       { label: { fr: "Payé",       en: "Paid" },        color: "bg-green-100 text-green-800" },
  REMBOURSE:  { label: { fr: "Remboursé",  en: "Refunded" },    color: "bg-blue-100 text-blue-800" },
  ECHOUE:     { label: { fr: "Échoué",     en: "Failed" },      color: "bg-red-100 text-red-800" },
};

const methodLabel: Record<string, string> = {
  STRIPE: "Stripe", MOBILE_MONEY: "Mobile Money", INTERAC: "Interac",
};

export function TransactionsAdmin({ shipments, totalRevenue, totalPending, locale }: {
  shipments: Shipment[]; totalRevenue: number; totalPending: number; locale: string;
}) {
  const isFr = locale === "fr";
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "ALL">("ALL");

  const filtered = shipments.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.sender.firstName.toLowerCase().includes(q) ||
      s.sender.lastName.toLowerCase().includes(q) ||
      s.sender.email.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" ||
      (s.payment?.status ?? "EN_ATTENTE") === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <TrendingUp className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Toutes les transactions" : "All transactions"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? `${shipments.length} envois au total.` : `${shipments.length} total shipments.`}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isFr ? "Revenus encaissés" : "Revenue collected", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-green-500" },
          { label: isFr ? "Paiements en attente" : "Pending payments", value: formatCurrency(totalPending), icon: Clock, color: "text-yellow-500" },
          { label: isFr ? "Total envois" : "Total shipments", value: shipments.length, icon: Package2, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={cn("p-3 rounded-xl bg-muted", s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isFr ? "Rechercher par expéditeur, origine..." : "Search by sender, origin..."}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {(["ALL", "PAYE", "EN_ATTENTE", "ECHOUE", "REMBOURSE"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
              )}>
              {s === "ALL" ? (isFr ? "Tous" : "All") : paymentStatusConfig[s].label[isFr ? "fr" : "en"]}
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
                      isFr ? "Montant" : "Amount",
                      isFr ? "Méthode" : "Method",
                      isFr ? "Statut paiement" : "Payment status",
                      isFr ? "Date" : "Date",
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      {isFr ? "Aucune transaction." : "No transactions."}
                    </td></tr>
                  ) : filtered.map((s) => {
                    const pStatus = s.payment?.status ?? "EN_ATTENTE";
                    const cfg = paymentStatusConfig[pStatus];
                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{s.sender.firstName} {s.sender.lastName}</p>
                          <p className="text-xs text-muted-foreground">{s.sender.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.origin} → {s.destination}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.weight} kg</td>
                        <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(s.payment?.amount ?? s.price)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.payment ? methodLabel[s.payment.method] ?? s.payment.method : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                            {cfg.label[isFr ? "fr" : "en"]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
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
