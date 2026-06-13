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
  if (!user || user.role !== "RESPONSABLE_ENTREPOT") redirect(`/${locale}/dashboard`);

  const company = await prisma.logisticsCompany.findUnique({
    where: { managerId: user.id },
    include: {
      locations: {
        where: { isActive: true },
        orderBy: { country: "asc" },
        include: {
          items: {
            include: {
              shipment: {
                select: { id: true, origin: true, destination: true, weight: true, description: true },
              },
            },
            orderBy: { arrivedAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EntrepotDashboard user={user} company={company as any} locale={locale} />;
}
