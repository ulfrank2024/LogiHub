"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package2, PackagePlus, Clock, CheckCircle2, Truck, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, buttonVariants, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";

type ShipmentStatus =
  | "EN_ATTENTE" | "DEPOSE" | "EN_TRAITEMENT"
  | "EN_TRANSIT" | "ARRIVE_DESTINATION" | "PRET_RETRAIT"
  | "EN_LIVRAISON" | "LIVRE" | "ANNULE" | "LITIGE";

type Shipment = {
  id: string; status: ShipmentStatus; origin: string; destination: string;
  weight: number; price: number; createdAt: Date;
  payment: { status: string } | null;
};

type User = {
  id: string; firstName: string; lastName: string;
  sentShipments: Shipment[];
};

const statusConfig: Record<ShipmentStatus, { label: { fr: string; en: string }; color: string; icon: React.ElementType }> = {
  EN_ATTENTE:         { label: { fr: "En attente",         en: "Pending" },           color: "bg-yellow-100 text-yellow-800", icon: Clock },
  DEPOSE:             { label: { fr: "Déposé",             en: "Dropped off" },       color: "bg-blue-100 text-blue-800",    icon: Package2 },
  EN_TRAITEMENT:      { label: { fr: "En traitement",      en: "Processing" },        color: "bg-indigo-100 text-indigo-800", icon: Clock },
  EN_TRANSIT:         { label: { fr: "En transit",         en: "In transit" },        color: "bg-orange-100 text-orange-800", icon: Truck },
  ARRIVE_DESTINATION: { label: { fr: "Arrivé destination", en: "Arrived" },           color: "bg-purple-100 text-purple-800", icon: Package2 },
  PRET_RETRAIT:       { label: { fr: "Prêt au retrait",    en: "Ready for pickup" },  color: "bg-teal-100 text-teal-800",    icon: CheckCircle2 },
  EN_LIVRAISON:       { label: { fr: "En livraison",       en: "Out for delivery" },  color: "bg-orange-100 text-orange-800", icon: Truck },
  LIVRE:              { label: { fr: "Livré",              en: "Delivered" },         color: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  ANNULE:             { label: { fr: "Annulé",             en: "Cancelled" },         color: "bg-red-100 text-red-800",     icon: AlertCircle },
  LITIGE:             { label: { fr: "Litige",             en: "Dispute" },           color: "bg-red-100 text-red-800",     icon: AlertCircle },
};

export function ExpéditeurDashboard({ user, locale }: { user: User; locale: string }) {
  const isFr = locale === "fr";
  const shipments = user.sentShipments;

  const stats = {
    total: shipments.length,
    enCours: shipments.filter((s) => !["LIVRE", "ANNULE"].includes(s.status)).length,
    livres: shipments.filter((s) => s.status === "LIVRE").length,
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Salutation */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Bonjour, ${user.firstName} 👋` : `Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Voici un résumé de vos envois." : "Here's a summary of your shipments."}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isFr ? "Total envois" : "Total shipments", value: stats.total, icon: Package2, color: "text-primary" },
          { label: isFr ? "En cours" : "In progress", value: stats.enCours, icon: Truck, color: "text-orange-500" },
          { label: isFr ? "Livrés" : "Delivered", value: stats.livres, icon: CheckCircle2, color: "text-green-500" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={cardHover} whileHover="hover">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={cn("p-3 rounded-xl bg-muted", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Raccourci */}
      <motion.div variants={fadeInUp}>
        <Link
          href={`/${locale}/dashboard/expediteur/nouveau`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2")}
        >
          <PackagePlus className="w-5 h-5" />
          {isFr ? "Créer un nouvel envoi" : "Create a new shipment"}
        </Link>
      </motion.div>

      {/* Derniers envois */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isFr ? "Derniers envois" : "Recent shipments"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isFr ? "Aucun envoi pour l'instant." : "No shipments yet."}</p>
                <Link
                  href={`/${locale}/dashboard/expediteur/nouveau`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
                >
                  {isFr ? "Créer mon premier envoi" : "Create my first shipment"}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {shipments.map((s) => {
                  const cfg = statusConfig[s.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={s.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-muted shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {s.origin} → {s.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                          {cfg.label[isFr ? "fr" : "en"]}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(s.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
