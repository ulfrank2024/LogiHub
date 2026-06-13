import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransporteurDashboard } from "@/components/dashboard/roles/TransporteurDashboard";

export default async function TransporteurPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "TRANSPORTEUR") redirect(`/${locale}/onboarding`);

  const [missions, disponibles] = await Promise.all([
    prisma.shipment.findMany({
      where: { carrierId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.shipment.findMany({
      where: { status: "EN_ATTENTE", carrierId: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <TransporteurDashboard
      user={user}
      missions={missions}
      disponibles={disponibles}
      locale={locale}
    />
  );
}
