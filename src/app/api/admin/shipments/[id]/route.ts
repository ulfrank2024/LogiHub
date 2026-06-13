import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const VALID_STATUSES = [
  "EN_ATTENTE", "DEPOSE", "EN_TRAITEMENT",
  "EN_TRANSIT", "ARRIVE_DESTINATION", "PRET_RETRAIT",
  "EN_LIVRAISON", "LIVRE", "ANNULE", "LITIGE",
] as const;

const schema = z.object({
  status: z.enum(VALID_STATUSES),
  note: z.string().max(300).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { sender: true },
    });
    if (!shipment) return NextResponse.json({ error: "Envoi introuvable" }, { status: 404 });

    const { status, note } = parsed.data;

    await prisma.$transaction([
      prisma.shipment.update({ where: { id }, data: { status } }),
      prisma.trackingEvent.create({
        data: {
          shipmentId: id,
          status,
          location: "Mise à jour admin",
          note: note ?? `Statut mis à jour : ${status}`,
        },
      }),
    ]);

    // Notifier l'expéditeur pour les statuts clés
    const notifyStatuses: Record<string, { type: "SHIPMENT_ACCEPTED" | "SHIPMENT_DELIVERED"; msg: string }> = {
      ACCEPTE:    { type: "SHIPMENT_ACCEPTED", msg: `Votre envoi ${shipment.origin} → ${shipment.destination} a été accepté.` },
      EN_TRANSIT: { type: "SHIPMENT_ACCEPTED", msg: `Votre colis ${shipment.origin} → ${shipment.destination} est en transit.` },
      LIVRE:      { type: "SHIPMENT_DELIVERED", msg: `Votre colis ${shipment.origin} → ${shipment.destination} a été livré !` },
    };

    if (notifyStatuses[status]) {
      const n = notifyStatuses[status];
      await createNotification({ userId: shipment.senderId, type: n.type, message: n.msg });
    }

    return NextResponse.json({ success: true });
  });
}
