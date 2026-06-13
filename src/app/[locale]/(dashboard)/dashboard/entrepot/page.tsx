import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntrepotDashboard } from "@/components/dashboard/roles/EntrepotDashboard";

export default async function EntrepotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "RESPONSABLE_ENTREPOT") redirect(`/${locale}/onboarding`);

  const warehouse = await prisma.warehouse.findUnique({
    where: { managerId: user.id },
    include: {
      items: {
        include: { shipment: true },
        orderBy: { arrivedAt: "desc" },
        take: 10,
      },
    },
  });

  return <EntrepotDashboard user={user} warehouse={warehouse} locale={locale} />;
}
