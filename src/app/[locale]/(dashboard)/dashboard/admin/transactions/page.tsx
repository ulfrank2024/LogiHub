import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransactionsAdmin } from "@/components/dashboard/admin/TransactionsAdmin";

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const [shipments, totalRevenue, totalPending] = await Promise.all([
    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        payment: true,
      },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAYE" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "EN_ATTENTE" } }),
  ]);

  return (
    <TransactionsAdmin
      shipments={shipments}
      totalRevenue={totalRevenue._sum.amount ?? 0}
      totalPending={totalPending._sum.amount ?? 0}
      locale={locale}
    />
  );
}
