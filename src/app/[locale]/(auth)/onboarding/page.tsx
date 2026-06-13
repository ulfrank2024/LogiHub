"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Warehouse, ArrowRight, ArrowLeft, Loader2, Clock, CheckCircle2,
  Phone, Globe, Plus, Trash2, MapPin, Building2, Mail, Link as LinkIcon,
  FileText, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

type Country = "CA" | "CM";
type LocationType = "DEPOT" | "HUB";
type Step = "choose" | "expediteur-form" | "company-info" | "company-locations" | "company-review" | "pending";

type Location = {
  name: string; country: Country | ""; city: string; address: string; type: LocationType;
};

const emptyLocation = (): Location => ({ name: "", country: "", city: "", address: "", type: "DEPOT" });

export default function OnboardingPage() {
  const { locale } = useParams<{ locale: string }>();
  const { user } = useUser();
  const router = useRouter();
  const isFr = locale === "fr";
  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);

  // Expéditeur
  const [country, setCountry] = useState<Country | "">("");
  const [phone, setPhone] = useState("");

  // Entreprise
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [companyPhone, setCompanyPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState<Location[]>([emptyLocation()]);

  function addLocation() {
    if (locations.length >= 10) return;
    setLocations((prev) => [...prev, emptyLocation()]);
  }
  function removeLocation(i: number) {
    setLocations((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateLocation(i: number, field: keyof Location, value: string) {
    setLocations((prev) => prev.map((loc, idx) => idx === i ? { ...loc, [field]: value } : loc));
  }

  const isCompanyInfoValid = companyName.trim().length >= 2 && companyEmail.includes("@") && companyPhone.trim().length >= 6;
  const isLocationsValid = locations.length >= 1 && locations.every(
    (l) => l.name.trim() && l.country && l.city.trim() && l.address.trim()
  );

  async function handleExpéditeurSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!country) return;
    setLoading(true);
    try {
      const res = await fetch("/api/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "EXPEDITEUR", country, phone: phone || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(isFr ? "Profil créé !" : "Profile created!");
      router.push(`/${locale}/dashboard`);
    } catch {
      toast.error(isFr ? "Une erreur est survenue." : "Something went wrong.");
      setLoading(false);
    }
  }

  async function handleCompanySubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/company-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          email: companyEmail.trim(),
          phone: companyPhone.trim(),
          website: website.trim() || undefined,
          description: description.trim() || undefined,
          locations: locations.map((l) => ({
            name: l.name.trim(),
            country: l.country,
            city: l.city.trim(),
            address: l.address.trim(),
            type: l.type,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      setStep("pending");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (isFr ? "Une erreur est survenue." : "Something went wrong."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen kente-pattern bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {/* ── Étape 1 : Choisir son rôle ── */}
          {step === "choose" && (
            <motion.div key="choose" variants={staggerContainer} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <motion.div variants={fadeInUp} className="text-center mb-10">
                <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {isFr ? "Bienvenue" : "Welcome"}{" "}
                  <span className="text-primary">{user?.firstName ?? ""}</span> 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isFr ? "Quel est votre rôle sur LOGIHUB ?" : "What is your role on LOGIHUB?"}
                </p>
              </motion.div>

              <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.button
                  variants={scaleIn}
                  onClick={() => setStep("expediteur-form")}
                  className="text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-gradient-to-br from-[#D4A017]/20 to-[#E07B39]/10 border-[#D4A017]/40 hover:border-[#D4A017] hover:scale-[1.02]"
                >
                  <Package className="w-10 h-10 mb-4 text-[#D4A017]" />
                  <h3 className="font-semibold text-foreground text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {isFr ? "Je veux envoyer des colis" : "I want to send packages"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isFr
                      ? "Créez votre compte expéditeur et commencez à envoyer entre le Canada et le Cameroun."
                      : "Create your sender account and start shipping between Canada and Cameroon."}
                  </p>
                </motion.button>

                <motion.button
                  variants={scaleIn}
                  onClick={() => setStep("company-info")}
                  className="text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-gradient-to-br from-[#1B4332]/20 to-[#52B788]/10 border-[#1B4332]/40 hover:border-[#1B4332] hover:scale-[1.02]"
                >
                  <Warehouse className="w-10 h-10 mb-4 text-[#52B788]" />
                  <h3 className="font-semibold text-foreground text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {isFr ? "Je gère une entreprise logistique" : "I manage a logistics company"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isFr
                      ? "Enregistrez votre entreprise avec vos points de dépôt et de livraison. Un admin validera votre dossier."
                      : "Register your company with your pickup and delivery points. An admin will validate your application."}
                  </p>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Expéditeur : pays + téléphone ── */}
          {step === "expediteur-form" && (
            <motion.div key="expediteur" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <button onClick={() => setStep("choose")} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                <Package className="inline w-7 h-7 text-primary mr-2" />
                {isFr ? "Compte expéditeur" : "Sender account"}
              </h2>
              <p className="text-muted-foreground mb-8">{isFr ? "Quelques informations pour compléter votre profil." : "A few details to complete your profile."}</p>

              <form onSubmit={handleExpéditeurSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" />{isFr ? "Vous êtes basé en *" : "You are based in *"}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["CA", "CM"] as Country[]).map((c) => (
                      <button key={c} type="button" onClick={() => setCountry(c)}
                        className={cn("py-3 rounded-xl border-2 font-semibold transition-all", country === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
                        {c === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{isFr ? "Téléphone (optionnel)" : "Phone (optional)"}</Label>
                  <Input id="phone" type="tel" placeholder="+1 514 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <Button type="submit" size="lg" disabled={!country || loading} className="w-full h-12 text-base font-semibold rounded-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  {isFr ? "Créer mon compte" : "Create my account"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── Entreprise étape 1 : Infos générales ── */}
          {step === "company-info" && (
            <motion.div key="company-info" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <button onClick={() => setStep("choose")} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                <Building2 className="inline w-7 h-7 text-primary mr-2" />
                {isFr ? "Votre entreprise" : "Your company"}
              </h2>
              <p className="text-muted-foreground mb-8">{isFr ? "Informations générales sur votre entreprise logistique." : "General information about your logistics company."}</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />{isFr ? "Nom de l'entreprise *" : "Company name *"}</Label>
                  <Input placeholder={isFr ? "Express Douala SARL" : "Express Douala SARL"} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{isFr ? "Email professionnel *" : "Business email *"}</Label>
                    <Input type="email" placeholder="contact@entreprise.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{isFr ? "Téléphone *" : "Phone *"}</Label>
                    <Input type="tel" placeholder="+237 6 00 00 00 00" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-muted-foreground" />{isFr ? "Site web (optionnel)" : "Website (optional)"}</Label>
                  <Input type="url" placeholder="https://www.entreprise.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" />{isFr ? "Description (optionnel)" : "Description (optional)"}</Label>
                  <textarea rows={3} placeholder={isFr ? "Décrivez votre activité, vos services, votre expérience..." : "Describe your activity, services, experience..."} value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button size="lg" disabled={!isCompanyInfoValid} onClick={() => setStep("company-locations")} className="w-full h-12 text-base font-semibold rounded-full">
                  {isFr ? "Suivant — Ajouter mes points" : "Next — Add my locations"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Entreprise étape 2 : Points de l'entreprise ── */}
          {step === "company-locations" && (
            <motion.div key="company-locations" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <button onClick={() => setStep("company-info")} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                <MapPin className="inline w-7 h-7 text-primary mr-2" />
                {isFr ? "Points de votre réseau" : "Your network points"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isFr
                  ? "Ajoutez chaque point de dépôt ou entrepôt de votre entreprise (Canada et/ou Cameroun)."
                  : "Add each drop-off or warehouse point of your company (Canada and/or Cameroon)."}
              </p>

              <div className="space-y-4">
                {locations.map((loc, i) => (
                  <motion.div key={i} variants={fadeInUp}
                    className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {isFr ? `Point ${i + 1}` : `Location ${i + 1}`}
                      </p>
                      {locations.length > 1 && (
                        <button onClick={() => removeLocation(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{isFr ? "Nom du point *" : "Point name *"}</Label>
                        <Input placeholder={isFr ? "Point Douala Centre" : "Douala Center Point"} value={loc.name} onChange={(e) => updateLocation(i, "name", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isFr ? "Type *" : "Type *"}</Label>
                        <div className="relative">
                          <select value={loc.type} onChange={(e) => updateLocation(i, "type", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            <option value="DEPOT">{isFr ? "DÉPÔT — collecte client" : "DEPOT — client drop-off"}</option>
                            <option value="HUB">{isFr ? "HUB — entrepôt / livraison" : "HUB — warehouse / delivery"}</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">{isFr ? "Pays *" : "Country *"}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["CA", "CM"] as Country[]).map((c) => (
                          <button key={c} type="button" onClick={() => updateLocation(i, "country", c)}
                            className={cn("py-2 rounded-xl border-2 font-semibold text-sm transition-all", loc.country === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
                            {c === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{isFr ? "Ville *" : "City *"}</Label>
                        <Input placeholder={isFr ? "Douala" : "Douala"} value={loc.city} onChange={(e) => updateLocation(i, "city", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isFr ? "Adresse *" : "Address *"}</Label>
                        <Input placeholder="123 Rue de la Paix" value={loc.address} onChange={(e) => updateLocation(i, "address", e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {locations.length < 10 && (
                  <button onClick={addLocation}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    {isFr ? "Ajouter un point" : "Add a location"}
                  </button>
                )}

                <Button size="lg" disabled={!isLocationsValid} onClick={() => setStep("company-review")} className="w-full h-12 text-base font-semibold rounded-full">
                  {isFr ? "Vérifier et soumettre" : "Review and submit"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Entreprise étape 3 : Confirmation ── */}
          {step === "company-review" && (
            <motion.div key="company-review" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <button onClick={() => setStep("company-locations")} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
              </button>
              <h2 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {isFr ? "Récapitulatif" : "Summary"}
              </h2>
              <p className="text-muted-foreground mb-6">{isFr ? "Vérifiez les informations avant de soumettre." : "Review your information before submitting."}</p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{isFr ? "Entreprise" : "Company"}</p>
                  {[
                    { label: isFr ? "Nom" : "Name", value: companyName },
                    { label: "Email", value: companyEmail },
                    { label: isFr ? "Téléphone" : "Phone", value: companyPhone },
                    ...(website ? [{ label: "Site web", value: website }] : []),
                    ...(description ? [{ label: isFr ? "Description" : "Description", value: description }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right max-w-[200px] truncate">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {isFr ? `${locations.length} point(s) de réseau` : `${locations.length} network location(s)`}
                  </p>
                  <div className="space-y-2">
                    {locations.map((loc, i) => (
                      <div key={i} className="flex items-start justify-between text-sm py-2 border-b border-border/50 last:border-0 gap-3">
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.city} · {loc.country === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{loc.address}</p>
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                          loc.type === "HUB" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300")}>
                          {loc.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button size="lg" onClick={handleCompanySubmit} disabled={loading} className="w-full h-12 text-base font-semibold rounded-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {isFr ? "Soumettre ma demande" : "Submit my request"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── En attente de validation ── */}
          {step === "pending" && (
            <motion.div key="pending" variants={fadeInUp} initial="hidden" animate="visible" className="text-center py-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                {isFr ? "Demande envoyée !" : "Request submitted!"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-2">
                {isFr
                  ? `Votre demande de partenariat pour "${companyName}" a bien été reçue. Un administrateur examinera votre dossier sous 24–48h.`
                  : `Your partnership request for "${companyName}" has been received. An administrator will review your application within 24–48h.`}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 mb-8">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {isFr ? "Vous serez notifié par email dès validation." : "You will be notified by email upon approval."}
              </div>
              <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
                {isFr ? "Retour à l'accueil" : "Back to home"}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
