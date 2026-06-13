import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect(`/${locale}/onboarding`);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={user} locale={locale} />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader user={user} locale={locale} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
