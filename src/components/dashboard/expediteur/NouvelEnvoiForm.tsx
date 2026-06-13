"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PackagePlus, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatCurrency, shipmentPriceCAD } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

type Step = 1 | 2 | 3;

const ORIGINS = ["Canada", "Cameroun"];
const DESTINATIONS = ["Montréal, QC", "Toronto, ON", "Vancouver, BC", "Douala", "Yaoundé", "Bafoussam", "Autre"];

export function NouvelEnvoiForm({ locale }: { locale: string }) {
  const router = useRouter();
  const isFr = locale === "fr";
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    weight: "",
    l: "", w: "", h: "",
    description: "",
    declaredValue: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const weight = parseFloat(form.weight) || 0;
  const declaredValue = parseFloat(form.declaredValue) || 0;
  const price = weight > 0 ? shipmentPriceCAD(weight, declaredValue) : 0;

  const isStep1Valid = form.origin && form.destination && form.origin !== form.destination;
  const isStep2Valid = weight > 0 && parseFloat(form.l) > 0 && parseFloat(form.w) > 0 && parseFloat(form.h) > 0 && form.description.trim().length >= 3;

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          weight,
          dimensions: { l: parseFloat(form.l), w: parseFloat(form.w), h: parseFloat(form.h) },
          description: form.description.trim(),
          declaredValue,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(isFr ? "Envoi créé avec succès !" : "Shipment created!");
      router.push(`/${locale}/dashboard/expediteur/envois`);
      router.refresh();
    } catch {
      toast.error(isFr ? "Une erreur est survenue." : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const stepLabel = [
    { n: 1, label: isFr ? "Trajet" : "Route" },
    { n: 2, label: isFr ? "Colis" : "Package" },
    { n: 3, label: isFr ? "Confirmation" : "Confirm" },
  ];

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-xl mx-auto space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <PackagePlus className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Créer un nouvel envoi" : "Create a new shipment"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Remplissez les informations de votre colis en 3 étapes." : "Fill in your package details in 3 steps."}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {stepLabel.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0",
              step > s.n ? "bg-green-500 text-white" : step === s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", step === s.n ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
            {i < 2 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {step === 1 ? (isFr ? "Origine & destination" : "Origin & destination") :
             step === 2 ? (isFr ? "Détails du colis" : "Package details") :
             (isFr ? "Résumé & confirmation" : "Summary & confirmation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Ville d'origine" : "Origin city"}</label>
                <select value={form.origin} onChange={set("origin")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">{isFr ? "Sélectionner..." : "Select..."}</option>
                  {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Ville de destination" : "Destination city"}</label>
                <select value={form.destination} onChange={set("destination")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">{isFr ? "Sélectionner..." : "Select..."}</option>
                  {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {form.origin && form.destination && form.origin === form.destination && (
                <p className="text-xs text-destructive">{isFr ? "L'origine et la destination ne peuvent pas être identiques." : "Origin and destination must differ."}</p>
              )}
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Poids (kg)" : "Weight (kg)"}</label>
                <Input type="number" min="0.1" step="0.1" placeholder="Ex: 5" value={form.weight} onChange={set("weight")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Dimensions (cm) — L × l × H" : "Dimensions (cm) — L × W × H"}</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" min="1" placeholder={isFr ? "Long." : "Length"} value={form.l} onChange={set("l")} />
                  <Input type="number" min="1" placeholder={isFr ? "Larg." : "Width"} value={form.w} onChange={set("w")} />
                  <Input type="number" min="1" placeholder={isFr ? "Haut." : "Height"} value={form.h} onChange={set("h")} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Description du contenu" : "Content description"}</label>
                <textarea
                  rows={3}
                  placeholder={isFr ? "Ex: Vêtements, livres, produits alimentaires..." : "E.g. Clothes, books, food items..."}
                  value={form.description}
                  onChange={set("description")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isFr ? "Valeur déclarée (CAD)" : "Declared value (CAD)"}</label>
                <Input type="number" min="0" step="10" placeholder="0" value={form.declaredValue} onChange={set("declaredValue")} />
                <p className="text-xs text-muted-foreground">{isFr ? "Utilisée pour calculer l'assurance." : "Used to calculate insurance."}</p>
              </div>

              {/* Prix estimé */}
              {weight > 0 && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{isFr ? "Prix estimé" : "Estimated price"}</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
                </div>
              )}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-3">
              {[
                { label: isFr ? "Trajet" : "Route", value: `${form.origin} → ${form.destination}` },
                { label: isFr ? "Poids" : "Weight", value: `${weight} kg` },
                { label: isFr ? "Dimensions" : "Dimensions", value: `${form.l} × ${form.w} × ${form.h} cm` },
                { label: isFr ? "Description" : "Description", value: form.description },
                { label: isFr ? "Valeur déclarée" : "Declared value", value: formatCurrency(declaredValue) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm gap-4 py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
              <div className="rounded-xl bg-primary/10 px-4 py-3 flex items-center justify-between mt-2">
                <span className="font-semibold">{isFr ? "Total à payer" : "Total"}</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(price)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isFr
                  ? "En confirmant, votre envoi sera enregistré et un administrateur prendra en charge votre demande."
                  : "By confirming, your shipment will be registered and an administrator will process your request."}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                {isFr ? "Retour" : "Back"}
              </Button>
            ) : <div />}

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="gap-2"
              >
                {isFr ? "Suivant" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFr ? "Confirmer l'envoi" : "Confirm shipment"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
