import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { shipmentPriceCAD } from "@/lib/utils";
import { notifyAllAdmins } from "@/lib/notifications";

const schema = z.object({
  origin:             z.string().min(2).max(100),
  destination:        z.string().min(2).max(100),
  weight:             z.number().positive().max(500),
  dimensions:         z.object({ l: z.number().positive(), w: z.number().positive(), h: z.number().positive() }),
  description:        z.string().min(3).max(500),
  declaredValue:      z.number().nonnegative(),
  companyId:          z.string().optional(),
  dropoffLocationId:  z.string().optional(),
  deliveryLocationId: z.string().optional(),
  deliveryType:       z.enum(["PICKUP", "HOME_DELIVERY"]).optional(),
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "EXPEDITEUR")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

    const { origin, destination, weight, dimensions, description, declaredValue,
            companyId, dropoffLocationId, deliveryLocationId, deliveryType } = parsed.data;
    const price = shipmentPriceCAD(weight, declaredValue);

    const shipment = await prisma.shipment.create({
      data: {
        senderId:           user.id,
        origin, destination, weight, dimensions, description, declaredValue, price,
        status:             "EN_ATTENTE",
        companyId:          companyId          ?? null,
        dropoffLocationId:  dropoffLocationId  ?? null,
        deliveryLocationId: deliveryLocationId ?? null,
        deliveryType:       deliveryType       ?? "PICKUP",
      },
    });

    await notifyAllAdmins({
      type: "SHIPMENT_CREATED",
      message: `Nouvel envoi de ${user.firstName} ${user.lastName} : ${origin} → ${destination}, ${weight} kg.`,
    });

    return NextResponse.json({ shipment }, { status: 201 });
  });
}

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const where = user.role === "EXPEDITEUR" ? { senderId: user.id } : {};
    const shipments = await prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { payment: true, tracking: { orderBy: { timestamp: "desc" }, take: 1 } },
    });

    return NextResponse.json({ shipments });
  });
}
