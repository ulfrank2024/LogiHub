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

  const companies = await prisma.logisticsCompany.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    include: {
      manager: { select: { firstName: true, lastName: true, email: true } },
      locations: {
        where: { isActive: true },
        orderBy: { country: "asc" },
        include: {
          items: {
            include: {
              shipment: { select: { origin: true, destination: true, weight: true } },
            },
            orderBy: { arrivedAt: "desc" },
          },
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EntrepotsAdmin companies={companies as any} locale={locale} />;
}
