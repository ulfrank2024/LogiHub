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

  const warehouse = await prisma.warehouse.findUnique({
    where: { managerId: user.id },
    include: {
      items: {
        include: { shipment: true },
        orderBy: { arrivedAt: "desc" },
      },
    },
  });

  if (!warehouse) redirect(`/${locale}/dashboard/entrepot`);

  // Envois éligibles au check-in : pas encore dans cet entrepôt, statuts compatibles
  const alreadyInWarehouse = warehouse.items.map((i) => i.shipmentId);
  const availableShipments = await prisma.shipment.findMany({
    where: {
      id: { notIn: alreadyInWarehouse },
      status: { in: ["EN_ATTENTE", "ACCEPTE", "EN_COURS_MATCHING"] },
    },
    include: { sender: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <EntrepotInventaire
      warehouse={warehouse}
      availableShipments={availableShipments}
      locale={locale}
    />
  );
}
