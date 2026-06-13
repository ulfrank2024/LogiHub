import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect(`/${locale}/onboarding`);

  switch (user.role) {
    case "EXPEDITEUR":
      redirect(`/${locale}/dashboard/expediteur`);
    case "TRANSPORTEUR":
      redirect(`/${locale}/dashboard/transporteur`);
    case "RESPONSABLE_ENTREPOT":
      redirect(`/${locale}/dashboard/entrepot`);
    case "ADMIN":
      redirect(`/${locale}/dashboard/admin`);
    default:
      redirect(`/${locale}/onboarding`);
  }
}
