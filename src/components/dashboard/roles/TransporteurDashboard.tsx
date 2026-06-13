"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Package2, Truck, CheckCircle2, MapPin, Weight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, buttonVariants, formatCurrency, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer, cardHover } from "@/lib/animations";

type Shipment = {
  id: string; status: string; origin: string; destination: string;
  weight: number; price: number; createdAt: Date;
};
type User = { id: string; firstName: string };

export function TransporteurDashboard({
  user, missions, disponibles, locale,
}: {
  user: User;
  missions: Shipment[];
  disponibles: Shipment[];
  locale: string;
}) {
  const isFr = locale === "fr";
  const actives = missions.filter((m) => !["LIVRE", "ANNULE"].includes(m.status));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isFr ? `Bonjour, ${user.firstName} 👋` : `Hello, ${user.firstName} 👋`}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Gérez vos missions et trouvez de nouveaux envois." : "Manage your missions and find new shipments."}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: isFr ? "Missions actives" : "Active missions", value: actives.length, icon: Truck, color: "text-orange-500" },
          { label: isFr ? "Total complétées" : "Completed", value: missions.filter((m) => m.status === "LIVRE").length, icon: CheckCircle2, color: "text-green-500" },
          { label: isFr ? "Disponibles" : "Available", value: disponibles.length, icon: Package2, color: "text-primary" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Envois disponibles */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                {isFr ? "Envois disponibles" : "Available shipments"}
              </CardTitle>
              <Link href={`/${locale}/dashboard/transporteur/disponibles`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                {isFr ? "Voir tout" : "See all"}
              </Link>
            </CardHeader>
            <CardContent>
              {disponibles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{isFr ? "Aucun envoi disponible." : "No available shipments."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disponibles.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.origin} → {s.destination}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Weight className="w-3 h-3" /> {s.weight} kg
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-primary shrink-0">{formatCurrency(s.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mes missions */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                {isFr ? "Mes missions récentes" : "Recent missions"}
              </CardTitle>
              <Link href={`/${locale}/dashboard/transporteur/missions`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                {isFr ? "Voir tout" : "See all"}
              </Link>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{isFr ? "Aucune mission pour l'instant." : "No missions yet."}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {missions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">{s.origin} → {s.destination}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
