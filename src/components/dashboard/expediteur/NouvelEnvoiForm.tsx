"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackagePlus, ChevronRight, ChevronLeft, Loader2, CheckCircle2,
  Building2, MapPin, Home, Package, Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatCurrency, shipmentPriceCAD } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

type Step = 1 | 2 | 3 | 4 | 5;
type CountryCode = "CA" | "CM";
type DeliveryType = "PICKUP" | "HOME_DELIVERY";

type Location = {
  id: string; name: string; country: string; city: string;
  address: string; type: string;
  contactName: string | null; contactPhone: string | null;
};

type Company = {
  id: string; name: string; email: string; phone: string;
  locations: Location[];
};

const STEP_LABELS = (isFr: boolean) => [
  { n: 1, label: isFr ? "Pays" : "Country" },
  { n: 2, label: isFr ? "Dépôt" : "Drop-off" },
  { n: 3, label: isFr ? "Livraison" : "Delivery" },
  { n: 4, label: isFr ? "Colis" : "Package" },
  { n: 5, label: isFr ? "Confirmation" : "Confirm" },
];

export function NouvelEnvoiForm({ locale }: { locale: string }) {
  const router = useRouter();
  const isFr = locale === "fr";
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);

  // Step 1
  const [originCountry, setOriginCountry] = useState<CountryCode | "">("");

  // Step 2
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedDropoffId, setSelectedDropoffId] = useState("");

  // Step 3
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("PICKUP");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Step 4
  const [weight, setWeight] = useState("");
  const [l, setL] = useState(""); const [w, setW] = useState(""); const [h, setH] = useState("");
  const [description, setDescription] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");

  const destCountry: CountryCode | "" = originCountry === "CA" ? "CM" : originCountry === "CM" ? "CA" : "";
  const weightNum = parseFloat(weight) || 0;
  const declaredNum = parseFloat(declaredValue) || 0;
  const price = weightNum > 0 ? shipmentPriceCAD(weightNum, declaredNum) : 0;

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const dropoffPoints = selectedCompany?.locations.filter(
    (loc) => loc.country === originCountry && ["DEPOT", "MIXTE"].includes(loc.type)
  ) ?? [];
  const deliveryPoints = selectedCompany?.locations.filter(
    (loc) => loc.country === destCountry && ["HUB", "MIXTE"].includes(loc.type)
  ) ?? [];
  const selectedDropoff = dropoffPoints.find((l) => l.id === selectedDropoffId);
  const selectedDelivery = deliveryPoints.find((l) => l.id === selectedDeliveryId);

  // Fetch companies when step 1 is validated
  useEffect(() => {
    if (step === 2 && companies.length === 0 && originCountry) {
      setFetchingCompanies(true);
      fetch("/api/logistics-companies")
        .then((r) => r.json())
        .then(({ companies: data }) => {
          // Keep only companies with at least one valid dropoff in origin country
          const filtered = (data as Company[]).filter((c) =>
            c.locations.some((loc) => loc.country === originCountry && ["DEPOT", "MIXTE"].includes(loc.type))
          );
          setCompanies(filtered);
        })
        .catch(() => toast.error(isFr ? "Erreur lors du chargement des entreprises." : "Failed to load companies."))
        .finally(() => setFetchingCompanies(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, originCountry]);

  // Reset downstream when company changes
  useEffect(() => {
    setSelectedDropoffId("");
    setSelectedDeliveryId("");
  }, [selectedCompanyId]);

  function next() { setStep((s) => (s + 1) as Step); }
  function back() { setStep((s) => (s - 1) as Step); }

  const isStep1Valid = !!originCountry;
  const isStep2Valid = !!selectedCompanyId && !!selectedDropoffId;
  const isStep3Valid = deliveryType === "PICKUP" ? !!selectedDeliveryId : deliveryAddress.trim().length >= 5;
  const isStep4Valid = weightNum > 0 && parseFloat(l) > 0 && parseFloat(w) > 0 && parseFloat(h) > 0 && description.trim().length >= 3;

  async function handleSubmit() {
    setLoading(true);
    try {
      const destination = deliveryType === "PICKUP" && selectedDelivery
        ? `${selectedDelivery.city}${destCountry === "CA" ? ", Canada" : ", Cameroun"}`
        : deliveryAddress.trim();

      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originCountry === "CA" ? "Canada" : "Cameroun",
          destination,
          weight: weightNum,
          dimensions: { l: parseFloat(l), w: parseFloat(w), h: parseFloat(h) },
          description: description.trim(),
          declaredValue: declaredNum,
          companyId: selectedCompanyId,
          dropoffLocationId: selectedDropoffId,
          deliveryLocationId: deliveryType === "PICKUP" ? selectedDeliveryId : undefined,
          deliveryType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      toast.success(isFr ? "Envoi créé avec succès !" : "Shipment created!");
      router.push(`/${locale}/dashboard/expediteur/envois`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isFr ? "Une erreur est survenue." : "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }

  const steps = STEP_LABELS(isFr);

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <PackagePlus className="inline w-6 h-6 text-primary mr-2" />
          {isFr ? "Créer un nouvel envoi" : "Create a new shipment"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isFr ? "Configurez votre envoi en 5 étapes." : "Set up your shipment in 5 steps."}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0",
              step > s.n ? "bg-green-500 text-white" : step === s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span className={cn("text-[10px] font-medium hidden sm:block truncate", step === s.n ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {step === 1 && (isFr ? "D'où envoyez-vous ?" : "Where are you shipping from?")}
            {step === 2 && (isFr ? "Entreprise & point de dépôt" : "Company & drop-off point")}
            {step === 3 && (isFr ? "Mode de livraison" : "Delivery method")}
            {step === 4 && (isFr ? "Détails du colis" : "Package details")}
            {step === 5 && (isFr ? "Récapitulatif" : "Summary")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">

            {/* ── STEP 1 : Pays d'origine ── */}
            {step === 1 && (
              <motion.div key="step1" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {isFr ? "Sélectionnez le pays depuis lequel vous envoyez votre colis." : "Select the country you're shipping from."}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["CA", "CM"] as CountryCode[]).map((c) => (
                    <button key={c} type="button" onClick={() => setOriginCountry(c)}
                      className={cn(
                        "p-4 rounded-2xl border-2 font-semibold text-left transition-all space-y-1",
                        originCountry === c ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}>
                      <p className="text-2xl">{c === "CA" ? "🇨🇦" : "🇨🇲"}</p>
                      <p className="text-sm">{c === "CA" ? "Canada" : "Cameroun"}</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        {c === "CA"
                          ? (isFr ? "→ livraison au Cameroun" : "→ delivery to Cameroon")
                          : (isFr ? "→ livraison au Canada" : "→ delivery to Canada")}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 : Entreprise & dépôt ── */}
            {step === 2 && (
              <motion.div key="step2" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
                {fetchingCompanies ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{isFr ? "Aucune entreprise disponible dans ce pays pour l'instant." : "No companies available in this country yet."}</p>
                  </div>
                ) : (
                  <>
                    {/* Sélection entreprise */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {isFr ? "1. Choisir l'entreprise partenaire" : "1. Choose the partner company"}
                      </p>
                      <div className="space-y-2">
                        {companies.map((company) => (
                          <button key={company.id} type="button" onClick={() => setSelectedCompanyId(company.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border-2 transition-all",
                              selectedCompanyId === company.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                            )}>
                            <p className="font-semibold text-sm flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-primary" />
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 ml-6">{company.email} · {company.phone}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sélection point de dépôt */}
                    {selectedCompanyId && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {isFr ? "2. Choisir le point de dépôt" : "2. Choose the drop-off point"}
                        </p>
                        {dropoffPoints.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic px-1">
                            {isFr ? "Aucun point de dépôt disponible dans ce pays." : "No drop-off point available in this country."}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {dropoffPoints.map((loc) => (
                              <button key={loc.id} type="button" onClick={() => setSelectedDropoffId(loc.id)}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl border-2 transition-all",
                                  selectedDropoffId === loc.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                                )}>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-primary" /> {loc.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground ml-5">{loc.city} · {loc.address}</p>
                                    {loc.contactName && (
                                      <p className="text-xs text-muted-foreground ml-5">{isFr ? "Contact" : "Contact"} : {loc.contactName}{loc.contactPhone ? ` · ${loc.contactPhone}` : ""}</p>
                                    )}
                                  </div>
                                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                                    loc.type === "MIXTE" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300")}>
                                    {loc.type === "MIXTE" ? (isFr ? "Dépôt & collecte" : "Drop-off & pickup") : (isFr ? "Dépôt client" : "Drop-off")}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── STEP 3 : Mode de livraison ── */}
            {step === 3 && (
              <motion.div key="step3" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
                {/* Mode */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isFr ? "1. Mode de livraison" : "1. Delivery method"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setDeliveryType("PICKUP")}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        deliveryType === "PICKUP" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}>
                      <MapPin className={cn("w-5 h-5 mb-1", deliveryType === "PICKUP" ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-sm font-semibold">{isFr ? "Retrait au point" : "Point pickup"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isFr ? "Le destinataire vient chercher son colis." : "Recipient picks up at a location."}
                      </p>
                    </button>
                    <button type="button" onClick={() => setDeliveryType("HOME_DELIVERY")}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        deliveryType === "HOME_DELIVERY" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}>
                      <Home className={cn("w-5 h-5 mb-1", deliveryType === "HOME_DELIVERY" ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-sm font-semibold">{isFr ? "Livraison à domicile" : "Home delivery"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isFr ? "Livraison à l'adresse du destinataire." : "Delivered to recipient's address."}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Point de livraison ou adresse */}
                {deliveryType === "PICKUP" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isFr ? "2. Point de retrait" : "2. Pickup point"}
                    </p>
                    {deliveryPoints.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic px-1">
                        {isFr ? "Aucun point de retrait disponible pour cette entreprise dans le pays destination." : "No pickup point available for this company in the destination country."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {deliveryPoints.map((loc) => (
                          <button key={loc.id} type="button" onClick={() => setSelectedDeliveryId(loc.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border-2 transition-all",
                              selectedDeliveryId === loc.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                            )}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-primary" /> {loc.name}
                                </p>
                                <p className="text-xs text-muted-foreground ml-5">{loc.city} · {loc.address}</p>
                                {loc.contactName && (
                                  <p className="text-xs text-muted-foreground ml-5">{loc.contactName}{loc.contactPhone ? ` · ${loc.contactPhone}` : ""}</p>
                                )}
                              </div>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                                loc.type === "MIXTE" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300")}>
                                {loc.type === "MIXTE" ? (isFr ? "Dépôt & collecte" : "Drop-off & pickup") : "Hub"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {deliveryType === "HOME_DELIVERY" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isFr ? "2. Adresse de livraison" : "2. Delivery address"}
                    </p>
                    <Input
                      placeholder={destCountry === "CA" ? "123 Rue Exemple, Montréal, QC" : "Quartier Bastos, Yaoundé"}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {isFr ? "Des frais supplémentaires de livraison à domicile s'appliquent." : "Additional home delivery fees apply."}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4 : Détails du colis ── */}
            {step === 4 && (
              <motion.div key="step4" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isFr ? "Poids (kg)" : "Weight (kg)"}</label>
                  <Input type="number" min="0.1" step="0.1" placeholder="Ex: 5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isFr ? "Dimensions (cm) — L × l × H" : "Dimensions (cm) — L × W × H"}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" min="1" placeholder={isFr ? "Long." : "Length"} value={l} onChange={(e) => setL(e.target.value)} />
                    <Input type="number" min="1" placeholder={isFr ? "Larg." : "Width"} value={w} onChange={(e) => setW(e.target.value)} />
                    <Input type="number" min="1" placeholder={isFr ? "Haut." : "Height"} value={h} onChange={(e) => setH(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isFr ? "Description du contenu" : "Content description"}</label>
                  <textarea rows={3}
                    placeholder={isFr ? "Ex: Vêtements, livres, produits alimentaires..." : "E.g. Clothes, books, food items..."}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isFr ? "Valeur déclarée (CAD)" : "Declared value (CAD)"}</label>
                  <Input type="number" min="0" step="10" placeholder="0" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} />
                  <p className="text-xs text-muted-foreground">{isFr ? "Utilisée pour calculer l'assurance." : "Used to calculate insurance."}</p>
                </div>
                {weightNum > 0 && (
                  <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{isFr ? "Prix estimé" : "Estimated price"}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 5 : Confirmation ── */}
            {step === 5 && (
              <motion.div key="step5" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-3">
                {/* Trajet */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isFr ? "Trajet" : "Route"}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{originCountry === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{destCountry === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}</span>
                  </div>
                </div>

                {/* Entreprise */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isFr ? "Entreprise & points" : "Company & locations"}</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium">{selectedCompany?.name}</span>
                  </div>
                  {selectedDropoff && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Package className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                      <div>
                        <p>{isFr ? "Dépôt" : "Drop-off"} : <span className="text-foreground font-medium">{selectedDropoff.name}</span></p>
                        <p className="text-xs">{selectedDropoff.city} · {selectedDropoff.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-muted-foreground">
                    {deliveryType === "PICKUP" ? (
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                    ) : (
                      <Home className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                    )}
                    <div>
                      {deliveryType === "PICKUP" && selectedDelivery ? (
                        <>
                          <p>{isFr ? "Retrait" : "Pickup"} : <span className="text-foreground font-medium">{selectedDelivery.name}</span></p>
                          <p className="text-xs">{selectedDelivery.city} · {selectedDelivery.address}</p>
                        </>
                      ) : (
                        <>
                          <p>{isFr ? "Livraison à domicile" : "Home delivery"}</p>
                          <p className="text-xs text-foreground font-medium">{deliveryAddress}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colis */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isFr ? "Colis" : "Package"}</p>
                  {[
                    { label: isFr ? "Poids" : "Weight", value: `${weightNum} kg` },
                    { label: isFr ? "Dimensions" : "Dimensions", value: `${l} × ${w} × ${h} cm` },
                    { label: isFr ? "Description" : "Description", value: description },
                    { label: isFr ? "Valeur déclarée" : "Declared value", value: formatCurrency(declaredNum) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right max-w-[200px]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="rounded-xl bg-primary/10 px-4 py-3 flex items-center justify-between">
                  <span className="font-semibold">{isFr ? "Total estimé" : "Estimated total"}</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(price)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFr
                    ? "En confirmant, votre envoi sera enregistré et l'équipe partenaire vous contactera pour finaliser le ramassage."
                    : "By confirming, your shipment will be registered and the partner team will contact you to arrange pickup."}
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 1 ? (
              <Button variant="outline" onClick={back} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                {isFr ? "Retour" : "Back"}
              </Button>
            ) : <div />}

            {step < 5 ? (
              <Button onClick={next} className="gap-2"
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid) ||
                  (step === 4 && !isStep4Valid) ||
                  fetchingCompanies
                }>
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
