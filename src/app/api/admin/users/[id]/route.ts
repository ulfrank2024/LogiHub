import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  role: z.enum(["EXPEDITEUR", "RESPONSABLE_ENTREPOT", "ADMIN", "TRANSPORTEUR"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    // Empêcher de retirer son propre rôle admin
    if (target.clerkId === userId && parsed.data.role !== "ADMIN") {
      return NextResponse.json({ error: "Impossible de modifier votre propre rôle" }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });

    const roleLabels: Record<string, string> = {
      EXPEDITEUR: "Expéditeur",
      RESPONSABLE_ENTREPOT: "Responsable entrepôt",
      ADMIN: "Administrateur",
      TRANSPORTEUR: "Transporteur",
    };

    await createNotification({
      userId: id,
      type: "ROLE_CHANGED",
      message: `Votre rôle a été mis à jour : ${roleLabels[parsed.data.role]}. Reconnectez-vous pour accéder à votre nouveau tableau de bord.`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
