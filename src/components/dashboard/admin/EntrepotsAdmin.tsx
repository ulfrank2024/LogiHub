"use client";

import { motion } from "framer-motion";
import { Warehouse, Package2, MapPin, User, ArrowDownToLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type WarehouseItem = {
  id: string; arrivedAt: Date; departedAt: Date | null;
  shipment: { origin: string; destination: string; weight: number };
};

type WarehouseData = {
  id: string; name: string; country: string; city: string;
  address: string; capacity: number;
  manager: { firstName: string; lastName: string; email: string } | null;
  items: WarehouseItem[];
};

function OccupationBar({ used, capacity }: { used: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(Math.round((used / capacity) * 100), 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used} / {capacity} {used <= 1 ? "emplacement" : "emplacements"}</span>
        <span className={cn("font-semibold", pct > 85 ? "text-red-500" : pct > 60 ? "text-orange-500" : "text-green-600")}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500",
            pct > 85 ? "bg-destructive" : pct > 60 ? "bg-orange-500" : "bg-green-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function EntrepotsAdmin({ warehouses, locale }: { warehouses: WarehouseData[]; locale: string }) {
  const isFr = locale === "fr";

  const caWarehouse = warehouses.find((w) => w.country === "CA");
  const cmWarehouse = warehouses.find((w) => w.country === "CM");

  const totalItems = warehouses.reduce((sum, w) => sum + w.items.filter((i) => !i.departedAt).length, 0);
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* En-tête */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <Warehouse className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Vue des entrepôts" : "Warehouse overview"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr
            ? `${warehouses.length} entrepôt(s) — ${totalItems} colis en stock sur ${totalCapacity} emplacements.`
            : `${warehouses.length} warehouse(s) — ${totalItems} packages in stock out of ${totalCapacity} slots.`}
        </p>
      </motion.div>

      {/* KPIs globaux */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isFr ? "Entrepôts actifs" : "Active warehouses", value: warehouses.length, color: "text-primary" },
          { label: isFr ? "Colis en stock" : "Packages in stock", value: totalItems, color: "text-orange-500" },
          { label: isFr ? "Capacité totale" : "Total capacity", value: totalCapacity, color: "text-muted-foreground" },
          {
            label: isFr ? "Occupation globale" : "Overall usage",
            value: totalCapacity > 0 ? `${Math.round((totalItems / totalCapacity) * 100)}%` : "—",
            color: totalCapacity > 0 && totalItems / totalCapacity > 0.85 ? "text-red-500" : "text-green-500",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Cartes entrepôts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { data: caWarehouse, flag: "🇨🇦", country: isFr ? "Canada" : "Canada" },
          { data: cmWarehouse, flag: "🇨🇲", country: isFr ? "Cameroun" : "Cameroon" },
        ].map(({ data, flag, country }) => (
          <motion.div key={country} variants={fadeInUp}>
            {!data ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
                  <Warehouse className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">{flag} {country}</p>
                  <p className="text-sm mt-1">{isFr ? "Aucun entrepôt configuré." : "No warehouse configured."}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="text-xl">{flag}</span>
                        {data.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {data.address}, {data.city}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 shrink-0">
                      {isFr ? "Actif" : "Active"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Responsable */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    {data.manager ? (
                      <span>
                        <span className="font-medium">{data.manager.firstName} {data.manager.lastName}</span>
                        <span className="text-muted-foreground"> · {data.manager.email}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">{isFr ? "Aucun responsable" : "No manager"}</span>
                    )}
                  </div>

                  {/* Occupation */}
                  <OccupationBar
                    used={data.items.filter((i) => !i.departedAt).length}
                    capacity={data.capacity}
                  />

                  {/* Articles en stock */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Package2 className="w-3.5 h-3.5" />
                      {isFr ? "Articles en stock" : "Items in stock"}
                      <span className="ml-1 bg-muted rounded-full px-1.5 py-0.5 text-[10px]">
                        {data.items.filter((i) => !i.departedAt).length}
                      </span>
                    </p>
                    {data.items.filter((i) => !i.departedAt).length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        {isFr ? "Entrepôt vide." : "Empty warehouse."}
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {data.items.filter((i) => !i.departedAt).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs bg-muted/40 rounded-lg px-3 py-2 gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <ArrowDownToLine className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate font-medium">{item.shipment.origin} → {item.shipment.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                              <span>{item.shipment.weight} kg</span>
                              <span>·</span>
                              <span>{formatDate(item.arrivedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
