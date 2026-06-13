import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  action: z.enum(["APPROUVE", "REJETE"]),
});

// PATCH /api/warehouse-requests/[id] — admin approuve ou rejette
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const warehouseRequest = await prisma.warehouseRequest.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!warehouseRequest) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    if (parsed.data.action === "APPROUVE") {
      // Transaction : approuver demande + promouvoir rôle + créer entrepôt
      await prisma.$transaction([
        prisma.warehouseRequest.update({ where: { id }, data: { status: "APPROUVE" } }),
        prisma.user.update({ where: { id: warehouseRequest.userId }, data: { role: "RESPONSABLE_ENTREPOT" } }),
        prisma.warehouse.create({
          data: {
            name: warehouseRequest.name,
            address: warehouseRequest.address,
            city: warehouseRequest.city,
            country: warehouseRequest.country,
            capacity: warehouseRequest.capacity,
            managerId: warehouseRequest.userId,
          },
        }),
      ]);
    } else {
      await prisma.warehouseRequest.update({ where: { id }, data: { status: "REJETE" } });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
