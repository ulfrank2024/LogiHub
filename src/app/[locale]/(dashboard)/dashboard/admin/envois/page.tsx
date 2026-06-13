import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShipmentsAdmin } from "@/components/dashboard/admin/ShipmentsAdmin";

export default async function AdminEnvoisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { firstName: true, lastName: true, email: true } },
      payment: { select: { status: true, amount: true } },
    },
  });

  return <ShipmentsAdmin shipments={shipments} locale={locale} />;
}
