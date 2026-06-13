import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/dashboard/roles/AdminDashboard";

function buildRevenueData(payments: { amount: number; createdAt: Date }[]) {
  const now = new Date();
  const days: { date: string; revenue: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
    const revenue = payments
      .filter((p) => {
        const pd = new Date(p.createdAt);
        return pd.getDate() === d.getDate() && pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);
    days.push({ date: key, revenue });
  }
  return days;
}

function buildShipmentsData(shipments: { createdAt: Date }[]) {
  const now = new Date();
  const weeks: { week: string; envois: number }[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const label = weekStart.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
    const count = shipments.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    weeks.push({ week: label, envois: count });
  }
  return weeks;
}

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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const [
    totalUsers, totalShipments, totalRevenue,
    pendingRequests, newUsersToday, shipmentsEnAttente,
    recentShipments, recentUsers,
    recentPayments, allShipments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.shipment.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAYE" } }),
    prisma.warehouseRequest.count({ where: { status: "EN_ATTENTE" } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.shipment.count({ where: { status: "EN_ATTENTE" } }),
    prisma.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.payment.findMany({
      where: { status: "PAYE", createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
    }),
    prisma.shipment.findMany({
      where: { createdAt: { gte: eightWeeksAgo } },
      select: { createdAt: true },
    }),
  ]);

  const revenueData = buildRevenueData(recentPayments);
  const shipmentsData = buildShipmentsData(allShipments);

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
      revenueData={revenueData}
      shipmentsData={shipmentsData}
      locale={locale}
    />
  );
}
