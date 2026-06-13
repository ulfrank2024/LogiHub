"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Warehouse, Package2, ArrowDownToLine, ArrowUpFromLine,
  Search, Loader2, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type WarehouseItem = {
  id: string; arrivedAt: Date; departedAt: Date | null;
  shipment: { id: string; origin: string; destination: string; weight: number; description: string; senderId: string };
};

type AvailableShipment = {
  id: string; origin: string; destination: string; weight: number; description: string;
  sender: { firstName: string; lastName: string };
};

type WarehouseData = {
  id: string; name: string; country: string; city: string; capacity: number;
  items: WarehouseItem[];
};

export function EntrepotInventaire({
  warehouse,
  availableShipments,
  locale,
}: {
  warehouse: WarehouseData;
  availableShipments: AvailableShipment[];
  locale: string;
}) {
  const isFr = locale === "fr";
  const [items, setItems] = useState(warehouse.items);
  const [search, setSearch] = useState("");
  const [checkInId, setCheckInId] = useState("");
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState<string | null>(null);

  const enStock = items.filter((i) => !i.departedAt);
  const partis = items.filter((i) => i.departedAt);
  const occupation = Math.round((enStock.length / warehouse.capacity) * 100);

  const filtered = enStock.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.shipment.origin.toLowerCase().includes(q) || i.shipment.destination.toLowerCase().includes(q) || i.shipment.description.toLowerCase().includes(q);
  });

  async function handleCheckIn() {
    if (!checkInId) return;
    setLoadingCheckIn(true);
    try {
      const res = await fetch("/api/warehouse-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: checkInId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      toast.success(isFr ? "Colis enregistré en entrepôt !" : "Package checked in!");
      setCheckInId("");
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isFr ? "Erreur lors du check-in." : "Check-in failed."));
    } finally {
      setLoadingCheckIn(false);
    }
  }

  async function handleCheckOut(itemId: string) {
    setLoadingOut(itemId);
    try {
      const res = await fetch(`/api/warehouse-items/${itemId}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success(isFr ? "Colis marqué en transit !" : "Package marked as in transit!");
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, departedAt: new Date() } : i));
    } catch {
      toast.error(isFr ? "Erreur lors du check-out." : "Check-out failed.");
    } finally {
      setLoadingOut(null);
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* En-tête */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <Warehouse className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Inventaire" : "Inventory"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {warehouse.name} — {warehouse.city} · {enStock.length}/{warehouse.capacity} {isFr ? "emplacements occupés" : "slots used"}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
        {[
          { label: isFr ? "En stock" : "In stock", value: enStock.length, color: "text-primary" },
          { label: isFr ? "Occupation" : "Capacity", value: `${occupation}%`, color: occupation > 85 ? "text-destructive" : occupation > 60 ? "text-orange-500" : "text-green-500" },
          { label: isFr ? "Expédiés" : "Dispatched", value: partis.length, color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Barre occupation */}
      <motion.div variants={fadeInUp}>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={cn("h-2.5 rounded-full transition-all", occupation > 85 ? "bg-destructive" : occupation > 60 ? "bg-orange-500" : "bg-primary")}
            style={{ width: `${Math.min(occupation, 100)}%` }}
          />
        </div>
      </motion.div>

      {/* Check-in */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-primary" />
              {isFr ? "Enregistrer une arrivée (check-in)" : "Check in a package"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableShipments.length === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {isFr ? "Aucun envoi en attente d'arrivée." : "No shipments awaiting arrival."}
              </p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <select
                  value={checkInId}
                  onChange={(e) => setCheckInId(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{isFr ? "Sélectionner un envoi..." : "Select a shipment..."}</option>
                  {availableShipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sender.firstName} {s.sender.lastName} — {s.origin} → {s.destination} ({s.weight} kg)
                    </option>
                  ))}
                </select>
                <Button onClick={handleCheckIn} disabled={!checkInId || loadingCheckIn} className="gap-2 shrink-0">
                  {loadingCheckIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                  {isFr ? "Check-in" : "Check in"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock actuel */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package2 className="w-4 h-4 text-primary" />
                {isFr ? `Stock actuel (${enStock.length})` : `Current stock (${enStock.length})`}
              </CardTitle>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isFr ? "Rechercher..." : "Search..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isFr ? "Aucun colis en stock." : "No packages in stock."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[isFr ? "Trajet" : "Route", isFr ? "Poids" : "Weight", isFr ? "Description" : "Description", isFr ? "Arrivé le" : "Arrived", isFr ? "Action" : "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{item.shipment.origin} → {item.shipment.destination}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.shipment.weight} kg</td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">{item.shipment.description}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(item.arrivedAt)}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm" variant="outline"
                            disabled={loadingOut === item.id}
                            onClick={() => handleCheckOut(item.id)}
                            className="gap-1 text-xs h-7"
                          >
                            {loadingOut === item.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <ArrowUpFromLine className="w-3 h-3" />}
                            {isFr ? "Expédier" : "Dispatch"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Historique */}
      {partis.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4 text-green-500" />
                {isFr ? `Historique des départs (${partis.length})` : `Dispatch history (${partis.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {partis.slice(0, 20).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.shipment.origin} → {item.shipment.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {isFr ? "Arrivé" : "In"} {formatDate(item.arrivedAt)} · {isFr ? "Parti" : "Out"} {formatDate(item.departedAt!)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 shrink-0">
                      {isFr ? "Expédié" : "Dispatched"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
