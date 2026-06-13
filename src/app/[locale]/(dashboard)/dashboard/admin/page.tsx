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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers, totalShipments, totalRevenue,
    pendingRequests, newUsersToday, shipmentsEnAttente,
    recentShipments, recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.shipment.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAYE" } }),
    prisma.warehouseRequest.count({ where: { status: "EN_ATTENTE" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.shipment.count({ where: { status: "EN_ATTENTE" } }),
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
        pendingRequests,
        newUsersToday,
        shipmentsEnAttente,
      }}
      recentShipments={recentShipments}
      recentUsers={recentUsers}
      locale={locale}
    />
  );
}
