"use client";

import { motion } from "framer-motion";
import { Warehouse, Package2, ArrowDownToLine, ArrowUpFromLine, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";

type WarehouseItem = {
  id: string; arrivedAt: Date; departedAt: Date | null;
  shipment: { id: string; origin: string; destination: string; weight: number; description: string };
};
type WarehouseData = {
  id: string; name: string; country: string; city: string; capacity: number;
  items: WarehouseItem[];
} | null;
type User = { id: string; firstName: string };

export function EntrepotDashboard({ user, warehouse, locale }: {
  user: User; warehouse: WarehouseData; locale: string;
}) {
  const isFr = locale === "fr";

  if (!warehouse) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col items-center justify-center py-24 text-center">
        <Warehouse className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? "Aucun entrepôt assigné" : "No warehouse assigned"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {isFr
            ? "Un administrateur doit vous assigner un entrepôt pour accéder à cette section."
            : "An administrator must assign you a warehouse to access this section."}
        </p>
      </motion.div>
    );
  }

  const enStock = warehouse.items.filter((i) => !i.departedAt);
  const partis = warehouse.items.filter((i) => i.departedAt);
  const occupation = Math.round((enStock.length / warehouse.capacity) * 100);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Bonjour, ${user.firstName} 👋` : `Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" /> {warehouse.name} — {warehouse.city}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isFr ? "En stock" : "In stock", value: enStock.length, icon: Package2, color: "text-primary" },
          { label: isFr ? "Expédiés" : "Dispatched", value: partis.length, icon: ArrowUpFromLine, color: "text-green-500" },
          { label: isFr ? "Occupation" : "Capacity used", value: `${occupation}%`, icon: Warehouse, color: "text-orange-500" },
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

      {/* Barre occupation */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isFr ? `Capacité — ${enStock.length} / ${warehouse.capacity} emplacements` : `Capacity — ${enStock.length} / ${warehouse.capacity} slots`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className={cn("h-3 rounded-full transition-all duration-500",
                  occupation > 85 ? "bg-destructive" : occupation > 60 ? "bg-orange-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(occupation, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inventaire récent */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isFr ? "Articles récents" : "Recent items"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warehouse.items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isFr ? "L'entrepôt est vide." : "The warehouse is empty."}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {warehouse.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2 rounded-lg shrink-0", item.departedAt ? "bg-green-100" : "bg-muted")}>
                        {item.departedAt
                          ? <ArrowUpFromLine className="w-4 h-4 text-green-600" />
                          : <ArrowDownToLine className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.shipment.origin} → {item.shipment.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isFr ? "Arrivé le" : "Arrived"} {formatDate(item.arrivedAt)}
                          {item.departedAt && ` · ${isFr ? "Parti le" : "Left"} ${formatDate(item.departedAt)}`}
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
