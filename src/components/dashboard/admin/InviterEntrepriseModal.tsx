"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Link, X, Loader2, CheckCircle2, Copy, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InviterEntrepriseModal({ locale }: { locale: string }) {
  const isFr = locale === "fr";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLocale, setInviteLocale] = useState<"fr" | "en">("fr");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteLink = `${appUrl}/${inviteLocale}/onboarding?type=entreprise`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(isFr ? "Lien copié !" : "Link copied!");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: inviteLocale }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success(isFr ? `Invitation envoyée à ${email} !` : `Invitation sent to ${email}!`);
    } catch {
      toast.error(isFr ? "Erreur lors de l'envoi." : "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOpen(false);
    setEmail("");
    setSent(false);
    setLoading(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 rounded-full">
        <Mail className="w-4 h-4" />
        {isFr ? "Inviter une entreprise" : "Invite a company"}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={reset}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {isFr ? "Inviter une entreprise" : "Invite a company"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isFr ? "Envoyer un lien d'inscription partenaire" : "Send a partner registration link"}
                      </p>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {sent ? (
                    /* État succès */
                    <div className="text-center py-4 space-y-3">
                      <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                      <p className="font-medium text-foreground">
                        {isFr ? "Invitation envoyée !" : "Invitation sent!"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isFr ? `Un email a été envoyé à` : "An email has been sent to"}{" "}
                        <span className="font-medium text-foreground">{email}</span>
                      </p>
                      <Button variant="outline" onClick={reset} className="mt-2">
                        {isFr ? "Fermer" : "Close"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Sélecteur de langue */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          {isFr ? "Langue de l'invitation" : "Invitation language"}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["fr", "en"] as const).map((l) => (
                            <button key={l} type="button" onClick={() => setInviteLocale(l)}
                              className={cn("py-2 rounded-xl border-2 text-sm font-medium transition-all",
                                inviteLocale === l ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40")}>
                              {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Copier le lien */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link className="w-3.5 h-3.5" />
                          {isFr ? "Lien d'invitation à copier" : "Invitation link to copy"}
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 font-mono truncate border border-border">
                            {inviteLink}
                          </div>
                          <button onClick={handleCopy}
                            className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-xs text-muted-foreground">
                            {isFr ? "ou envoyer par email" : "or send by email"}
                          </span>
                        </div>
                      </div>

                      {/* Formulaire email */}
                      <form onSubmit={handleSend} className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email" className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {isFr ? "Email du responsable" : "Manager's email"}
                          </Label>
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="contact@entreprise.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={!email || loading} className="w-full gap-2">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                          {isFr ? "Envoyer l'invitation" : "Send invitation"}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
