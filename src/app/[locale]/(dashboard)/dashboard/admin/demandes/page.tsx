import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DemandesEntrepotList } from "@/components/dashboard/admin/DemandesEntrepotList";

export default async function DemandesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!admin || admin.role !== "ADMIN") redirect(`/${locale}/dashboard`);

  const demandes = await prisma.warehouseRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return <DemandesEntrepotList demandes={demandes} locale={locale} />;
}
