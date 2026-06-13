"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package2 } from "lucide-react";

type RevenuePoint  = { date: string; revenue: number };
type ShipmentPoint = { week: string; envois: number };

export function AdminCharts({
  revenueData,
  shipmentsData,
  locale,
}: {
  revenueData: RevenuePoint[];
  shipmentsData: ShipmentPoint[];
  locale: string;
}) {
  const isFr = locale === "fr";

  const revenueFormatter = (v: number) =>
    new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenus 30 jours */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            {isFr ? "Revenus — 30 derniers jours" : "Revenue — last 30 days"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              {isFr ? "Aucune donnée." : "No data."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `${v} $`}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v) => [revenueFormatter(Number(v ?? 0)), isFr ? "Revenus" : "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Envois par semaine */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package2 className="w-4 h-4 text-primary" />
            {isFr ? "Envois créés par semaine" : "Shipments created per week"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shipmentsData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              {isFr ? "Aucune donnée." : "No data."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shipmentsData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  formatter={(v) => [Number(v ?? 0), isFr ? "Envois" : "Shipments"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Legend formatter={() => (isFr ? "Envois" : "Shipments")} iconType="square" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="envois" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
