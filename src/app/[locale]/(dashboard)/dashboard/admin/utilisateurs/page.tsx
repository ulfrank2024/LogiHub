import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersManagement } from "@/components/dashboard/admin/UsersManagement";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      role: true, country: true, phone: true, createdAt: true,
      _count: { select: { sentShipments: true } },
    },
  });

  return <UsersManagement users={users} currentAdminId={admin.id} locale={locale} />;
}
