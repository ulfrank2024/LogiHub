"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Warehouse, ArrowRight, Loader2, Clock, CheckCircle2,
  MapPin, Phone, Building2, Hash, FileText, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

type Step = "choose" | "expediteur-form" | "entrepot-form" | "pending";
type Country = "CA" | "CM";

const roleCards = [
  {
    value: "EXPEDITEUR" as const,
    icon: Package,
    title: { fr: "Je veux envoyer des colis", en: "I want to send packages" },
    desc: {
      fr: "Créez votre compte expéditeur et commencez à envoyer entre le Canada et le Cameroun.",
      en: "Create your sender account and start shipping between Canada and Cameroon.",
    },
    color: "from-[#D4A017]/20 to-[#E07B39]/10",
    border: "border-[#D4A017]/40 hover:border-[#D4A017]",
    iconColor: "text-[#D4A017]",
  },
  {
    value: "RESPONSABLE_ENTREPOT" as const,
    icon: Warehouse,
    title: { fr: "Je gère un entrepôt", en: "I manage a warehouse" },
    desc: {
      fr: "Soumettez une demande de gestion d'entrepôt. Un administrateur vérifiera votre dossier.",
      en: "Submit a warehouse management request. An administrator will review your application.",
    },
    color: "from-[#1A3A5C]/20 to-[#2E86AB]/10",
    border: "border-[#1A3A5C]/40 hover:border-[#1A3A5C]",
    iconColor: "text-[#2E86AB]",
  },
];

export default function OnboardingPage() {
  const { locale } = useParams<{ locale: string }>();
  const { user } = useUser();
  const router = useRouter();
  const isFr = locale === "fr";

  const [step, setStep] = useState<Step>("choose");
  const [selected, setSelected] = useState<"EXPEDITEUR" | "RESPONSABLE_ENTREPOT" | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulaire expéditeur
  const [country, setCountry] = useState<Country | "">("");
  const [phone, setPhone] = useState("");

  // Formulaire demande entrepôt
  const [wName, setWName] = useState("");
  const [wAddress, setWAddress] = useState("");
  const [wCity, setWCity] = useState("");
  const [wCountry, setWCountry] = useState<Country | "">("");
  const [wCapacity, setWCapacity] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [wNotes, setWNotes] = useState("");

  function handleCardClick(value: "EXPEDITEUR" | "RESPONSABLE_ENTREPOT") {
    setSelected(value);
    setStep(value === "EXPEDITEUR" ? "expediteur-form" : "entrepot-form");
  }

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

  async function handleEntrepotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wName || !wAddress || !wCity || !wCountry || !wCapacity || !wPhone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/warehouse-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wName, address: wAddress, city: wCity,
          country: wCountry, capacity: Number(wCapacity),
          phone: wPhone, notes: wNotes || null,
        }),
      });
      if (!res.ok) throw new Error();
      setStep("pending");
    } catch {
      toast.error(isFr ? "Une erreur est survenue." : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen kente-pattern bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">

          {/* ── Étape 1 : Choisir son type ── */}
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
                {roleCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.value}
                      variants={scaleIn}
                      onClick={() => handleCardClick(card.value)}
                      className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-gradient-to-br ${card.color} ${card.border} hover:scale-[1.02]`}
                    >
                      <Icon className={`w-10 h-10 mb-4 ${card.iconColor}`} />
                      <h3 className="font-semibold text-foreground text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        {card.title[isFr ? "fr" : "en"]}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.desc[isFr ? "fr" : "en"]}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* ── Étape 2a : Formulaire Expéditeur ── */}
          {step === "expediteur-form" && (
            <motion.div key="expediteur" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <div className="mb-8">
                <button onClick={() => setStep("choose")} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                  ← {isFr ? "Retour" : "Back"}
                </button>
                <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  <Package className="inline w-7 h-7 text-primary mr-2" />
                  {isFr ? "Compte expéditeur" : "Sender account"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {isFr ? "Quelques informations pour compléter votre profil." : "A few details to complete your profile."}
                </p>
              </div>

              <form onSubmit={handleExpéditeurSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    {isFr ? "Vous êtes basé en *" : "You are based in *"}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["CA", "CM"] as Country[]).map((c) => (
                      <button
                        key={c} type="button"
                        onClick={() => setCountry(c)}
                        className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                          country === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                        }`}
                      >
                        {c === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {isFr ? "Téléphone (optionnel)" : "Phone (optional)"}
                  </Label>
                  <Input id="phone" type="tel" placeholder="+1 514 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <Button type="submit" size="lg" disabled={!country || loading} className="w-full h-12 text-base font-semibold rounded-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  {isFr ? "Créer mon compte" : "Create my account"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── Étape 2b : Formulaire Demande entrepôt ── */}
          {step === "entrepot-form" && (
            <motion.div key="entrepot" variants={fadeInUp} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              <div className="mb-8">
                <button onClick={() => setStep("choose")} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                  ← {isFr ? "Retour" : "Back"}
                </button>
                <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  <Warehouse className="inline w-7 h-7 text-[#2E86AB] mr-2" />
                  {isFr ? "Demande de gestion d'entrepôt" : "Warehouse management request"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {isFr
                    ? "Remplissez les informations de l'entrepôt. Un admin vérifiera et activera votre accès."
                    : "Fill in the warehouse details. An admin will verify and activate your access."}
                </p>
              </div>

              <form onSubmit={handleEntrepotSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wName" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {isFr ? "Nom de l'entrepôt *" : "Warehouse name *"}
                    </Label>
                    <Input id="wName" required placeholder={isFr ? "Ex: Entrepôt Montréal Nord" : "Ex: Montreal North Warehouse"} value={wName} onChange={(e) => setWName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {isFr ? "Téléphone *" : "Phone *"}
                    </Label>
                    <Input id="wPhone" required type="tel" placeholder="+1 514 000 0000" value={wPhone} onChange={(e) => setWPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {isFr ? "Adresse complète *" : "Full address *"}
                  </Label>
                  <Input id="wAddress" required placeholder="123 rue Saint-Denis" value={wAddress} onChange={(e) => setWAddress(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wCity">
                      {isFr ? "Ville *" : "City *"}
                    </Label>
                    <Input id="wCity" required placeholder={isFr ? "Montréal" : "Montreal"} value={wCity} onChange={(e) => setWCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {isFr ? "Pays *" : "Country *"}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["CA", "CM"] as Country[]).map((c) => (
                        <button
                          key={c} type="button"
                          onClick={() => setWCountry(c)}
                          className={`py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                            wCountry === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {c === "CA" ? "🇨🇦 Canada" : "🇨🇲 Cameroun"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wCapacity" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    {isFr ? "Capacité (nombre de colis) *" : "Capacity (number of packages) *"}
                  </Label>
                  <Input id="wCapacity" required type="number" min="1" placeholder="500" value={wCapacity} onChange={(e) => setWCapacity(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wNotes" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {isFr ? "Notes / informations complémentaires" : "Notes / additional information"}
                  </Label>
                  <textarea
                    id="wNotes"
                    rows={3}
                    placeholder={isFr ? "Horaires d'ouverture, équipements disponibles, références..." : "Opening hours, available equipment, references..."}
                    value={wNotes}
                    onChange={(e) => setWNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button
                  type="submit" size="lg"
                  disabled={!wName || !wAddress || !wCity || !wCountry || !wCapacity || !wPhone || loading}
                  className="w-full h-12 text-base font-semibold rounded-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  {isFr ? "Soumettre ma demande" : "Submit my request"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── Étape 3 : Demande en attente ── */}
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
                  ? "Votre demande de gestion d'entrepôt a bien été reçue. Un administrateur examinera votre dossier et vous contactera par email."
                  : "Your warehouse management request has been received. An administrator will review your application and contact you by email."}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 mb-8">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {isFr ? "Délai de traitement : 24–48h" : "Processing time: 24–48h"}
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
