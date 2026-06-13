"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Package2, MapPin, User, ArrowDownToLine, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type LocationItem = {
  id: string; arrivedAt: Date; departedAt: Date | null;
  shipment: { origin: string; destination: string; weight: number };
};

type Location = {
  id: string; name: string; country: string; city: string;
  address: string; type: string; isActive: boolean;
  items: LocationItem[];
};

type Company = {
  id: string; name: string; email: string; phone: string;
  website: string | null; status: string;
  manager: { firstName: string; lastName: string; email: string } | null;
  locations: Location[];
};

function LocationCard({ loc, isFr }: { loc: Location; isFr: boolean }) {
  const [open, setOpen] = useState(false);
  const enStock = loc.items.filter((i) => !i.departedAt);
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{loc.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {loc.city} · {loc.country === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
            loc.type === "HUB" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300")}>
            {loc.type}
          </span>
          <span className="text-xs font-semibold text-primary">{enStock.length} colis</span>
        </div>
      </div>

      {enStock.length > 0 && (
        <button onClick={() => setOpen((o) => !o)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {isFr ? "Voir les colis" : "View packages"}
        </button>
      )}
      {open && enStock.length > 0 && (
        <div className="space-y-1 pt-1 max-h-40 overflow-y-auto pr-1">
          {enStock.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs bg-background rounded-lg px-2 py-1.5 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <ArrowDownToLine className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{item.shipment.origin} → {item.shipment.destination}</span>
              </div>
              <div className="shrink-0 text-muted-foreground">
                {item.shipment.weight} kg · {formatDate(item.arrivedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EntrepotsAdmin({ companies, locale }: { companies: Company[]; locale: string }) {
  const isFr = locale === "fr";

  const totalLocations = companies.reduce((s, c) => s + c.locations.length, 0);
  const totalInStock = companies.reduce(
    (s, c) => s + c.locations.reduce((ls, l) => ls + l.items.filter((i) => !i.departedAt).length, 0),
    0
  );
  const caLocations = companies.reduce((s, c) => s + c.locations.filter((l) => l.country === "CA").length, 0);
  const cmLocations = companies.reduce((s, c) => s + c.locations.filter((l) => l.country === "CM").length, 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* En-tête */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <Building2 className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Entreprises logistiques" : "Logistics companies"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr
            ? `${companies.length} entreprise(s) active(s) · ${totalLocations} point(s) · ${totalInStock} colis en stock`
            : `${companies.length} active company(ies) · ${totalLocations} location(s) · ${totalInStock} packages in stock`}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isFr ? "Entreprises" : "Companies", value: companies.length, color: "text-primary" },
          { label: isFr ? "Colis en stock" : "In stock", value: totalInStock, color: "text-orange-500" },
          { label: "🇨🇦 Points CA", value: caLocations, color: "text-blue-500" },
          { label: "🇨🇲 Points CM", value: cmLocations, color: "text-green-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Aucune entreprise */}
      {companies.length === 0 && (
        <motion.div variants={fadeInUp}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="w-14 h-14 mb-3 opacity-20" />
              <p className="font-medium">{isFr ? "Aucune entreprise active" : "No active companies"}</p>
              <p className="text-sm mt-1">{isFr ? "Les demandes approuvées apparaîtront ici." : "Approved requests will appear here."}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cartes entreprises */}
      <div className="space-y-5">
        {companies.map((company) => {
          const inStock = company.locations.reduce((s, l) => s + l.items.filter((i) => !i.departedAt).length, 0);
          return (
            <motion.div key={company.id} variants={fadeInUp}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {company.name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{company.email}</span>
                        <span className="text-xs text-muted-foreground">{company.phone}</span>
                        {company.website && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Globe className="w-3 h-3" /> {company.website}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {isFr ? "Active" : "Active"}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary/10 text-primary">
                        {inStock} {isFr ? "colis" : "packages"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Responsable */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    {company.manager ? (
                      <span>
                        <span className="font-medium">{company.manager.firstName} {company.manager.lastName}</span>
                        <span className="text-muted-foreground"> · {company.manager.email}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">{isFr ? "Aucun responsable" : "No manager"}</span>
                    )}
                  </div>

                  {/* Points */}
                  {company.locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      {isFr ? "Aucun point configuré." : "No locations configured."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Package2 className="w-3.5 h-3.5" />
                        {isFr ? `${company.locations.length} point(s) de réseau` : `${company.locations.length} network location(s)`}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {company.locations.map((loc) => (
                          <LocationCard key={loc.id} loc={loc} isFr={isFr} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
