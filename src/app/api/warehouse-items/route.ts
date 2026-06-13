import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const checkInSchema = z.object({
  shipmentId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const manager = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!manager || manager.role !== "RESPONSABLE_ENTREPOT")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const warehouse = await prisma.warehouse.findUnique({ where: { managerId: manager.id } });
    if (!warehouse) return NextResponse.json({ error: "Entrepôt introuvable" }, { status: 404 });

    const body = await req.json();
    const parsed = checkInSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const shipment = await prisma.shipment.findUnique({
      where: { id: parsed.data.shipmentId },
      include: { sender: true },
    });
    if (!shipment) return NextResponse.json({ error: "Envoi introuvable" }, { status: 404 });

    const existing = await prisma.warehouseItem.findFirst({
      where: { shipmentId: shipment.id, warehouseId: warehouse.id },
    });
    if (existing) return NextResponse.json({ error: "Déjà enregistré dans cet entrepôt" }, { status: 409 });

    const newStatus = warehouse.country === "CA" ? "EN_ENTREPOT_CA" : "EN_ENTREPOT_CM";

    await prisma.$transaction([
      prisma.warehouseItem.create({ data: { warehouseId: warehouse.id, shipmentId: shipment.id } }),
      prisma.shipment.update({ where: { id: shipment.id }, data: { status: newStatus } }),
      prisma.trackingEvent.create({
        data: { shipmentId: shipment.id, status: newStatus, location: `${warehouse.city}, ${warehouse.country}`, note: `Arrivé à l'entrepôt ${warehouse.name}` },
      }),
    ]);

    await createNotification({
      userId: shipment.senderId,
      type: "SHIPMENT_CREATED",
      message: `Votre colis est arrivé à l'entrepôt ${warehouse.name} (${warehouse.city}).`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  });
}
