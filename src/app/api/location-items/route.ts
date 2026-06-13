import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({ shipmentId: z.string().min(1) });

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const manager = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { managedCompany: { include: { locations: true } } },
    });
    if (!manager || manager.role !== "RESPONSABLE_ENTREPOT" || !manager.managedCompany)
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    // locationId doit appartenir à l'entreprise du manager
    const { shipmentId, locationId } = { ...parsed.data, locationId: body.locationId as string };
    if (!locationId) return NextResponse.json({ error: "locationId requis" }, { status: 400 });

    const location = manager.managedCompany.locations.find((l) => l.id === locationId);
    if (!location) return NextResponse.json({ error: "Point introuvable" }, { status: 404 });

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { sender: true },
    });
    if (!shipment) return NextResponse.json({ error: "Envoi introuvable" }, { status: 404 });

    const existing = await prisma.locationItem.findFirst({
      where: { shipmentId, locationId, departedAt: null },
    });
    if (existing) return NextResponse.json({ error: "Colis déjà présent à ce point" }, { status: 409 });

    const newStatus = location.country === "CA" ? "ARRIVE_DESTINATION" : "DEPOSE";

    await prisma.$transaction([
      prisma.locationItem.create({ data: { locationId, shipmentId } }),
      prisma.shipment.update({ where: { id: shipmentId }, data: { status: newStatus } }),
      prisma.trackingEvent.create({
        data: {
          shipmentId,
          status: newStatus,
          location: `${location.name} — ${location.city}`,
          note: `Arrivé au point ${location.name}`,
        },
      }),
    ]);

    await createNotification({
      userId: shipment.senderId,
      type: "SHIPMENT_ACCEPTED",
      message: `Votre colis est arrivé au point ${location.name} (${location.city}).`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  });
}
