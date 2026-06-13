import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({ action: z.enum(["APPROUVE", "REJETE"]) });

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
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const request = await prisma.companyRequest.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!request) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    if (request.status !== "EN_ATTENTE")
      return NextResponse.json({ error: "Demande déjà traitée" }, { status: 409 });

    if (parsed.data.action === "APPROUVE") {
      const locations = request.locations as Array<{
        name: string; country: string; city: string; address: string; type: "DEPOT" | "HUB";
      }>;

      await prisma.$transaction(async (tx) => {
        // Créer l'entreprise
        const company = await tx.logisticsCompany.create({
          data: {
            name:        request.companyName,
            email:       request.email,
            phone:       request.phone,
            website:     request.website,
            description: request.description,
            status:      "ACTIVE",
            managerId:   request.userId,
          },
        });

        // Créer tous les points
        await tx.warehouseLocation.createMany({
          data: locations.map((loc) => ({
            companyId: company.id,
            name:      loc.name,
            country:   loc.country,
            city:      loc.city,
            address:   loc.address,
            type:      loc.type,
          })),
        });

        // Promouvoir le rôle
        await tx.user.update({
          where: { id: request.userId },
          data:  { role: "RESPONSABLE_ENTREPOT" },
        });

        // Marquer la demande comme approuvée
        await tx.companyRequest.update({
          where: { id },
          data:  { status: "APPROUVE" },
        });
      });

      await createNotification({
        userId:  request.userId,
        type:    "WAREHOUSE_REQUEST_APPROVED",
        message: `Votre demande de partenariat pour "${request.companyName}" a été approuvée ! Vous pouvez accéder à votre tableau de bord.`,
      });
    } else {
      await prisma.companyRequest.update({ where: { id }, data: { status: "REJETE" } });
      await createNotification({
        userId:  request.userId,
        type:    "WAREHOUSE_REQUEST_REJECTED",
        message: `Votre demande de partenariat pour "${request.companyName}" n'a pas été retenue. Contactez l'administration pour plus d'informations.`,
      });
    }

    return NextResponse.json({ success: true });
  });
}
