import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  role: z.enum(["EXPEDITEUR", "TRANSPORTEUR", "RESPONSABLE_ENTREPOT", "ADMIN"]),
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
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        role: parsed.data.role,
        country: "CA",
      },
      update: {
        role: parsed.data.role,
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  });
}
