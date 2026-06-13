import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/dashboard/roles/AdminDashboard";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect(`/${locale}/onboarding`);

  const [totalUsers, totalShipments, totalRevenue, recentShipments, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.shipment.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAYE" } }),
    prisma.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <AdminDashboard
      user={user}
      stats={{
        totalUsers,
        totalShipments,
        totalRevenue: totalRevenue._sum.amount ?? 0,
      }}
      recentShipments={recentShipments}
      recentUsers={recentUsers}
      locale={locale}
    />
  );
}
