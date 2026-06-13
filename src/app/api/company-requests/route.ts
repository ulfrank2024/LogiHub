import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { notifyAllAdmins } from "@/lib/notifications";

const locationSchema = z.object({
  name:    z.string().min(2).max(100),
  country: z.enum(["CA", "CM"]),
  city:    z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  type:    z.enum(["DEPOT", "HUB"]),
});

const schema = z.object({
  companyName: z.string().min(2).max(150),
  email:       z.string().email(),
  phone:       z.string().min(6).max(30),
  website:     z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  locations:   z.array(locationSchema).min(1).max(10),
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const existing = await prisma.companyRequest.findUnique({ where: { userId: user.id } });
    if (existing) return NextResponse.json({ error: "Vous avez déjà soumis une demande." }, { status: 409 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });

    const { companyName, email, phone, website, description, locations } = parsed.data;

    const request = await prisma.companyRequest.create({
      data: {
        userId: user.id,
        companyName,
        email,
        phone,
        website: website || null,
        description: description || null,
        locations,
      },
    });

    await notifyAllAdmins({
      type: "NEW_WAREHOUSE_REQUEST",
      message: `Nouvelle demande de partenariat de "${companyName}" soumise par ${user.firstName} ${user.lastName}.`,
    });

    return NextResponse.json({ request }, { status: 201 });
  });
}

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN")
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const requests = await prisma.companyRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return NextResponse.json({ requests });
  });
}
