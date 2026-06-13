import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MesEnvoisList } from "@/components/dashboard/expediteur/MesEnvoisList";

export default async function EnvoisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "EXPEDITEUR") redirect(`/${locale}/dashboard`);

  const shipments = await prisma.shipment.findMany({
    where: { senderId: user.id },
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });

  return <MesEnvoisList shipments={shipments} locale={locale} />;
}
