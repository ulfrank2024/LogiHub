"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Clock, CheckCircle2, XCircle, MapPin, Phone, Mail,
  Loader2, FileText, Globe, ChevronDown, ChevronUp, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { InviterEntrepriseModal } from "./InviterEntrepriseModal";

type RequestStatus = "EN_ATTENTE" | "APPROUVE" | "REJETE";
type LocationEntry = {
  name: string; country: string; city: string; address: string; type: string;
  contactName?: string; contactPhone?: string; contactEmail?: string;
};

type Demande = {
  id: string; companyName: string; email: string; phone: string;
  website: string | null; description: string | null;
  locations: LocationEntry[];
  status: RequestStatus; createdAt: Date;
  user: { id: string; firstName: string; lastName: string; email: string };
};

const statusConfig: Record<RequestStatus, { label: { fr: string; en: string }; color: string; icon: React.ElementType }> = {
  EN_ATTENTE: { label: { fr: "En attente", en: "Pending" }, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  APPROUVE:   { label: { fr: "Approuvé", en: "Approved" }, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  REJETE:     { label: { fr: "Rejeté", en: "Rejected" }, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

function LocationsList({ locations, isFr }: { locations: LocationEntry[]; isFr: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <button onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
        <MapPin className="w-3.5 h-3.5" />
        {isFr ? `${locations.length} point(s) de réseau` : `${locations.length} network location(s)`}
        {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>
      {open && (
        <div className="space-y-1.5 pt-1">
          {locations.map((loc, i) => (
            <div key={i} className="bg-muted/40 rounded-lg px-3 py-2 text-xs space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{loc.name}</p>
                  <p className="text-muted-foreground">{loc.city} · {loc.country === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}</p>
                  <p className="text-muted-foreground truncate max-w-[240px]">{loc.address}</p>
                </div>
                <span className={cn("shrink-0 px-2 py-0.5 rounded-full font-medium text-center",
                  loc.type === "HUB" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : loc.type === "MIXTE" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300")}>
                  {loc.type === "DEPOT" ? "Dépôt client" : loc.type === "MIXTE" ? "Dépôt & collecte" : "Hub / livraison"}
                </span>
              </div>
              {(loc.contactName || loc.contactPhone || loc.contactEmail) && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground border-t border-border/50 pt-1.5">
                  {loc.contactName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{loc.contactName}</span>}
                  {loc.contactPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{loc.contactPhone}</span>}
                  {loc.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{loc.contactEmail}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DemandesEntrepotList({ demandes: initial, locale }: { demandes: Demande[]; locale: string }) {
  const isFr = locale === "fr";
  const [demandes, setDemandes] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "APPROUVE" | "REJETE") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/company-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: action } : d)));
      toast.success(
        action === "APPROUVE"
          ? isFr ? "Entreprise approuvée — accès activé !" : "Company approved — access granted!"
          : isFr ? "Demande rejetée." : "Request rejected."
      );
    } catch {
      toast.error(isFr ? "Une erreur est survenue." : "Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  const pending = demandes.filter((d) => d.status === "EN_ATTENTE");
  const processed = demandes.filter((d) => d.status !== "EN_ATTENTE");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            <Building2 className="inline w-6 h-6 text-primary mr-2" />
            {isFr ? "Demandes de partenariat entreprise" : "Company partnership requests"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isFr
              ? `${pending.length} demande${pending.length !== 1 ? "s" : ""} en attente de validation.`
              : `${pending.length} request${pending.length !== 1 ? "s" : ""} pending review.`}
          </p>
        </div>
        <InviterEntrepriseModal locale={isFr ? "fr" : "en"} />
      </motion.div>

      {/* Demandes EN_ATTENTE */}
      {pending.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-3 text-green-400" />
              <p>{isFr ? "Aucune demande en attente." : "No pending requests."}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isFr ? "En attente" : "Pending"}
          </h3>
          {pending.map((d) => (
            <Card key={d.id} className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-900/10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {d.companyName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {d.user.firstName} {d.user.lastName} · {d.user.email}
                    </p>
                  </div>
                  <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusConfig[d.status].color)}>
                    {statusConfig[d.status].label[isFr ? "fr" : "en"]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 shrink-0" /> {d.email}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 shrink-0" /> {d.phone}
                  </p>
                  {d.website && (
                    <p className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Globe className="w-4 h-4 shrink-0" /> {d.website}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground col-span-2">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />{formatDate(d.createdAt)}
                  </p>
                </div>

                {d.description && (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                    {d.description}
                  </p>
                )}

                <LocationsList locations={d.locations} isFr={isFr} />

                <div className="flex gap-3 pt-2">
                  <Button size="sm" disabled={loadingId === d.id} onClick={() => handleAction(d.id, "APPROUVE")}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    {loadingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isFr ? "Approuver" : "Approve"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={loadingId === d.id} onClick={() => handleAction(d.id, "REJETE")}
                    className="gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <XCircle className="w-4 h-4" />
                    {isFr ? "Rejeter" : "Reject"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Demandes traitées */}
      {processed.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isFr ? "Traitées" : "Processed"}
          </h3>
          {processed.map((d) => {
            const cfg = statusConfig[d.status];
            const Icon = cfg.icon;
            return (
              <Card key={d.id} className="opacity-70">
                <CardContent className="flex items-center justify-between py-4 px-5 gap-4">
                  <div>
                    <p className="font-medium text-sm">{d.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.user.firstName} {d.user.lastName} · {d.locations.length} point(s) · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <span className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0", cfg.color)}>
                    <Icon className="w-3 h-3" />
                    {cfg.label[isFr ? "fr" : "en"]}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
