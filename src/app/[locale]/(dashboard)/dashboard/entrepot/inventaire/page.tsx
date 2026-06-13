import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EntrepotInventaire } from "@/components/dashboard/entrepot/EntrepotInventaire";

export default async function InventairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "RESPONSABLE_ENTREPOT") redirect(`/${locale}/dashboard`);

  const company = await prisma.logisticsCompany.findUnique({
    where: { managerId: user.id },
    include: {
      locations: {
        where: { isActive: true },
        orderBy: { country: "asc" },
        include: {
          items: {
            include: {
              shipment: {
                include: { sender: { select: { firstName: true, lastName: true } } },
              },
            },
            orderBy: { arrivedAt: "desc" },
          },
        },
      },
    },
  });

  if (!company) redirect(`/${locale}/dashboard/entrepot`);

  // Envois éligibles au check-in : pas encore dans un point actif de cette entreprise
  const locationIds = company.locations.map((l) => l.id);
  const alreadyPresent = await prisma.locationItem.findMany({
    where: { locationId: { in: locationIds }, departedAt: null },
    select: { shipmentId: true },
  });
  const alreadyPresentIds = alreadyPresent.map((i) => i.shipmentId);

  const availableShipments = await prisma.shipment.findMany({
    where: {
      id: { notIn: alreadyPresentIds },
      status: { in: ["EN_ATTENTE", "EN_TRANSIT"] },
    },
    include: { sender: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <EntrepotInventaire
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      company={company as any}
      availableShipments={availableShipments}
      locale={locale}
    />
  );
}
