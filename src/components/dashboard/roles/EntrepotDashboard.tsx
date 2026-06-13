"use client";

import { motion } from "framer-motion";
import { Building2, Package2, ArrowDownToLine, ArrowUpFromLine, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";

type LocationItem = {
  id: string; arrivedAt: Date; departedAt: Date | null;
  shipment: { id: string; origin: string; destination: string; weight: number; description: string };
};

type Location = {
  id: string; name: string; country: string; city: string; type: string;
  items: LocationItem[];
};

type Company = {
  id: string; name: string; email: string; phone: string;
  locations: Location[];
} | null;

type User = { id: string; firstName: string };

export function EntrepotDashboard({ user, company, locale }: {
  user: User; company: Company; locale: string;
}) {
  const isFr = locale === "fr";

  if (!company) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col items-center justify-center py-24 text-center">
        <Clock className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? "En attente de validation" : "Awaiting validation"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {isFr
            ? "Votre demande de partenariat est en cours d'examen. Un administrateur vous contactera sous 24–48h."
            : "Your partnership request is under review. An administrator will contact you within 24–48h."}
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          {isFr ? "Demande envoyée avec succès." : "Request submitted successfully."}
        </div>
      </motion.div>
    );
  }

  const totalInStock = company.locations.reduce(
    (s, l) => s + l.items.filter((i) => !i.departedAt).length, 0
  );
  const totalDispatched = company.locations.reduce(
    (s, l) => s + l.items.filter((i) => i.departedAt).length, 0
  );

  const recentItems = company.locations
    .flatMap((l) => l.items.map((item) => ({ ...item, locationName: l.name, locationCity: l.city })))
    .sort((a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime())
    .slice(0, 8);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Bonjour, ${user.firstName} 👋` : `Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="w-4 h-4" /> {company.name} · {company.locations.length} {isFr ? "point(s)" : "location(s)"}
        </p>
      </motion.div>

      {/* Stats globales */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isFr ? "En stock" : "In stock", value: totalInStock, icon: Package2, color: "text-primary" },
          { label: isFr ? "Expédiés" : "Dispatched", value: totalDispatched, icon: ArrowUpFromLine, color: "text-green-500" },
          { label: isFr ? "Points actifs" : "Active points", value: company.locations.length, icon: Building2, color: "text-orange-500" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={cardHover} whileHover="hover">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={cn("p-3 rounded-xl bg-muted", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Points du réseau */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {isFr ? "Mes points de réseau" : "My network points"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {company.locations.map((loc) => {
              const inStock = loc.items.filter((i) => !i.departedAt).length;
              return (
                <div key={loc.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{loc.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {loc.city} · {loc.country === "CA" ? "🇨🇦" : "🇨🇲"}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                        loc.type === "HUB" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : loc.type === "MIXTE" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300")}>
                        {loc.type === "DEPOT" ? "Dépôt client" : loc.type === "MIXTE" ? "Dépôt & collecte" : "Hub / livraison"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-primary font-semibold">
                    {inStock} {isFr ? "colis en stock" : "packages in stock"}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activité récente */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isFr ? "Activité récente" : "Recent activity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isFr ? "Aucun colis enregistré." : "No packages recorded."}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2 rounded-lg shrink-0", item.departedAt ? "bg-green-100 dark:bg-green-900/30" : "bg-muted")}>
                        {item.departedAt
                          ? <ArrowUpFromLine className="w-4 h-4 text-green-600" />
                          : <ArrowDownToLine className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.shipment.origin} → {item.shipment.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.locationName} · {isFr ? "Arrivé le" : "Arrived"} {formatDate(item.arrivedAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: item.departedAt ? "#dcfce7" : "#fef9c3", color: item.departedAt ? "#166534" : "#854d0e" }}>
                      {item.departedAt ? (isFr ? "Expédié" : "Dispatched") : (isFr ? "En stock" : "In stock")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
