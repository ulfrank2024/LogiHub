import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  country: z.enum(["CA", "CM"]),
  capacity: z.number().int().min(1).max(100000),
  phone: z.string().min(6).max(30),
  notes: z.string().max(1000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Upsert user avec rôle EXPEDITEUR temporaire (en attente d'approbation)
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        role: "EXPEDITEUR",
        country: parsed.data.country,
        phone: parsed.data.phone,
      },
      update: {
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        phone: parsed.data.phone,
      },
    });

    // Créer ou remplacer la demande entrepôt
    const request = await prisma.warehouseRequest.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        country: parsed.data.country,
        capacity: parsed.data.capacity,
        phone: parsed.data.phone,
        notes: parsed.data.notes ?? null,
        status: "EN_ATTENTE",
      },
      update: {
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        country: parsed.data.country,
        capacity: parsed.data.capacity,
        phone: parsed.data.phone,
        notes: parsed.data.notes ?? null,
        status: "EN_ATTENTE",
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  });
}

// GET — liste pour l'admin
export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const requests = await prisma.warehouseRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return NextResponse.json({ requests }, { status: 200 });
  });
}
