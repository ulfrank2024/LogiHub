import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpéditeurDashboard } from "@/components/dashboard/roles/ExpéditeurDashboard";

export default async function ExpéditeurPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      sentShipments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { payment: true },
      },
    },
  });

  if (!user || user.role !== "EXPEDITEUR") redirect(`/${locale}/onboarding`);

  return <ExpéditeurDashboard user={user} locale={locale} />;
}
