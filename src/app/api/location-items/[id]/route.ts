import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  nextStatus: z.enum(["EN_TRAITEMENT", "EN_TRANSIT", "ARRIVE_DESTINATION", "PRET_RETRAIT", "EN_LIVRAISON", "LIVRE"]),
});

// PATCH : check-out + mise à jour statut
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const manager = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { managedCompany: { include: { locations: true } } },
    });
    if (!manager || manager.role !== "RESPONSABLE_ENTREPOT" || !manager.managedCompany)
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const item = await prisma.locationItem.findFirst({
      where: { id },
      include: {
        location: true,
        shipment: { include: { sender: true } },
      },
    });
    if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    if (item.departedAt) return NextResponse.json({ error: "Déjà parti" }, { status: 409 });

    // Vérifier que le point appartient à l'entreprise du manager
    const owns = manager.managedCompany.locations.some((l) => l.id === item.locationId);
    if (!owns) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { nextStatus } = parsed.data;

    await prisma.$transaction([
      prisma.locationItem.update({ where: { id }, data: { departedAt: new Date() } }),
      prisma.shipment.update({ where: { id: item.shipmentId }, data: { status: nextStatus } }),
      prisma.trackingEvent.create({
        data: {
          shipmentId: item.shipmentId,
          status: nextStatus,
          location: `${item.location.name} — ${item.location.city}`,
          note: `Parti du point ${item.location.name}`,
        },
      }),
    ]);

    const notifyOn: Record<string, string> = {
      EN_TRANSIT:         `Votre colis est en transit international.`,
      ARRIVE_DESTINATION: `Votre colis est arrivé à destination (${item.location.city}).`,
      PRET_RETRAIT:       `Votre colis est prêt à être retiré au point ${item.location.name}.`,
      EN_LIVRAISON:       `Votre colis est en cours de livraison à votre adresse.`,
      LIVRE:              `Votre colis a été livré !`,
    };

    if (notifyOn[nextStatus]) {
      await createNotification({
        userId: item.shipment.senderId,
        type: nextStatus === "LIVRE" ? "SHIPMENT_DELIVERED" : "SHIPMENT_ACCEPTED",
        message: notifyOn[nextStatus],
      });
    }

    return NextResponse.json({ success: true });
  });
}
