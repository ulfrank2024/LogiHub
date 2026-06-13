import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { withRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["fr", "en"]).default("fr"),
});

// En dev/test Resend, utilise l'adresse sandbox si le domaine n'est pas vérifié
const FROM_EMAIL =
  process.env.NODE_ENV === "production"
    ? (process.env.RESEND_FROM_EMAIL ?? "noreply@logihub.ca")
    : "onboarding@resend.dev";

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });

    const { email, locale } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteLink = `${appUrl}/${locale}/onboarding?type=entreprise`;
    const isFr = locale === "fr";

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: isFr
        ? "Invitation — Rejoignez LOGIHUB en tant que partenaire logistique"
        : "Invitation — Join LOGIHUB as a logistics partner",
      html: buildEmailHtml({ isFr, inviteLink, adminName: `${admin.firstName} ${admin.lastName}`, locale }),
    });

    if (error) {
      console.error("[invitations] Resend error:", error);
      return NextResponse.json(
        { error: isFr ? "Erreur d'envoi email. Utilisez le lien à copier." : "Email send failed. Use the copy link instead." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  });
}

function buildEmailHtml({ isFr, inviteLink, adminName, locale }: {
  isFr: boolean; inviteLink: string; adminName: string; locale: string;
}) {
  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%);padding:36px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">LOGIHUB</h1>
      <p style="margin:6px 0 0;color:#95d5b2;font-size:14px;">
        ${isFr ? "Plateforme logistique Canada – Cameroun" : "Canada – Cameroon Logistics Platform"}
      </p>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">
        ${isFr ? "Vous êtes invité(e) à rejoindre notre réseau !" : "You're invited to join our network!"}
      </h2>
      <p style="margin:0 0 16px;color:#52525b;line-height:1.7;">
        <strong>${adminName}</strong> ${isFr
          ? "vous invite à enregistrer votre entreprise logistique sur LOGIHUB."
          : "invites you to register your logistics company on LOGIHUB."}
      </p>
      <p style="margin:0 0 24px;color:#52525b;line-height:1.7;">
        ${isFr
          ? "En rejoignant LOGIHUB :<br>• Gérez vos points de dépôt (Canada &amp; Cameroun)<br>• Recevez et traitez les colis clients<br>• Accédez à votre tableau de bord en temps réel"
          : "By joining LOGIHUB:<br>• Manage pickup/delivery points (Canada &amp; Cameroon)<br>• Receive and process client packages<br>• Access your real-time dashboard"}
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#D4A017,#E07B39);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:600;">
          ${isFr ? "Créer mon compte partenaire →" : "Create my partner account →"}
        </a>
      </div>
      <p style="margin:0;color:#a1a1aa;font-size:13px;text-align:center;">
        ${isFr ? "Lien direct :" : "Direct link:"}<br>
        <a href="${inviteLink}" style="color:#1B4332;word-break:break-all;">${inviteLink}</a>
      </p>
    </div>
    <div style="padding:20px 40px;background:#f4f4f5;border-top:1px solid #e4e4e7;text-align:center;">
      <p style="margin:0;color:#a1a1aa;font-size:12px;">
        ${isFr ? "Email envoyé par l'équipe LOGIHUB." : "Email sent by the LOGIHUB team."}
      </p>
    </div>
  </div>
</body>
</html>`;
}
