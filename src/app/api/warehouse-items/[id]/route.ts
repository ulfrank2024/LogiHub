import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

// PATCH /api/warehouse-items/[id] — check-out (départ du colis)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const manager = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!manager || manager.role !== "RESPONSABLE_ENTREPOT")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const warehouse = await prisma.warehouse.findUnique({ where: { managerId: manager.id } });
    if (!warehouse) return NextResponse.json({ error: "Entrepôt introuvable" }, { status: 404 });

    const { id } = await params;
    const item = await prisma.warehouseItem.findFirst({
      where: { id, warehouseId: warehouse.id },
      include: { shipment: { include: { sender: true } } },
    });
    if (!item) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    if (item.departedAt) return NextResponse.json({ error: "Déjà expédié" }, { status: 409 });

    await prisma.$transaction([
      prisma.warehouseItem.update({ where: { id }, data: { departedAt: new Date() } }),
      prisma.shipment.update({ where: { id: item.shipmentId }, data: { status: "EN_TRANSIT" } }),
      prisma.trackingEvent.create({
        data: { shipmentId: item.shipmentId, status: "EN_TRANSIT", location: `${warehouse.city}, ${warehouse.country}`, note: `Parti de l'entrepôt ${warehouse.name}` },
      }),
    ]);

    await createNotification({
      userId: item.shipment.senderId,
      type: "SHIPMENT_ACCEPTED",
      message: `Votre colis a quitté l'entrepôt ${warehouse.name} et est en transit.`,
    });

    return NextResponse.json({ success: true });
  });
}
