import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NouvelEnvoiForm } from "@/components/dashboard/expediteur/NouvelEnvoiForm";

export default async function NouvelEnvoiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "EXPEDITEUR") redirect(`/${locale}/dashboard`);

  return <NouvelEnvoiForm locale={locale} />;
}
