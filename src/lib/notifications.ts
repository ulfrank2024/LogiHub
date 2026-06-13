import { prisma } from "@/lib/prisma";

type NotifType =
  | "WAREHOUSE_REQUEST_APPROVED"
  | "WAREHOUSE_REQUEST_REJECTED"
  | "ROLE_CHANGED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_ACCEPTED"
  | "SHIPMENT_DELIVERED"
  | "PAYMENT_CONFIRMED"
  | "NEW_WAREHOUSE_REQUEST"; // pour admin

const titles: Record<NotifType, { fr: string; en: string }> = {
  WAREHOUSE_REQUEST_APPROVED:  { fr: "Demande approuvée",         en: "Request approved" },
  WAREHOUSE_REQUEST_REJECTED:  { fr: "Demande rejetée",           en: "Request rejected" },
  ROLE_CHANGED:                { fr: "Rôle mis à jour",           en: "Role updated" },
  SHIPMENT_CREATED:            { fr: "Envoi créé",                en: "Shipment created" },
  SHIPMENT_ACCEPTED:           { fr: "Envoi accepté",             en: "Shipment accepted" },
  SHIPMENT_DELIVERED:          { fr: "Colis livré",               en: "Package delivered" },
  PAYMENT_CONFIRMED:           { fr: "Paiement confirmé",         en: "Payment confirmed" },
  NEW_WAREHOUSE_REQUEST:       { fr: "Nouvelle demande entrepôt", en: "New warehouse request" },
};

export async function createNotification({
  userId,
  type,
  message,
}: {
  userId: string;
  type: NotifType;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title: titles[type].fr,
      message,
    },
  });
}

export async function notifyAllAdmins({
  type,
  message,
}: {
  type: NotifType;
  message: string;
}) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type,
      title: titles[type].fr,
      message,
    })),
  });
}
