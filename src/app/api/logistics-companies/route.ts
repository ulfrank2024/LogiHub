import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const companies = await prisma.logisticsCompany.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: { country: "asc" },
        },
      },
    });

    return NextResponse.json({ companies });
  });
}
