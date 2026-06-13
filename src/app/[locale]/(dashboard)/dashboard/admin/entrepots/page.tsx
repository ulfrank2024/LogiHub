import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntrepotsAdmin } from "@/components/dashboard/admin/EntrepotsAdmin";

export default async function AdminEntrepotsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const warehouses = await prisma.warehouse.findMany({
    include: {
      manager: { select: { firstName: true, lastName: true, email: true } },
      items: {
        include: { shipment: { select: { origin: true, destination: true, weight: true } } },
        orderBy: { arrivedAt: "desc" },
      },
    },
    orderBy: { country: "asc" },
  });

  return <EntrepotsAdmin warehouses={warehouses} locale={locale} />;
}
