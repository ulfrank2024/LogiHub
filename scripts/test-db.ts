import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  console.log("\n🔌 Test connexion Neon PostgreSQL...\n");

  // 1. Test connexion
  await prisma.$connect();
  console.log("✅ Connexion établie\n");

  // 2. Créer un utilisateur test
  const user = await prisma.user.create({
    data: {
      clerkId: "test_clerk_id_001",
      email: "test@logihub.ca",
      firstName: "Jean",
      lastName: "Dupont",
      role: "EXPEDITEUR",
      country: "CA",
      phone: "+1-514-000-0000",
    },
  });
  console.log("✅ User créé :", user.id, `(${user.firstName} ${user.lastName} — ${user.role})`);

  // 3. Créer un entrepôt
  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Entrepôt Montréal",
      country: "CA",
      address: "123 Rue Sherbrooke",
      city: "Montréal",
      capacity: 500,
    },
  });
  console.log("✅ Warehouse créé :", warehouse.id, `(${warehouse.name})`);

  // 4. Créer un envoi
  const shipment = await prisma.shipment.create({
    data: {
      senderId: user.id,
      status: "EN_ATTENTE",
      origin: "Canada",
      destination: "Douala, Cameroun",
      weight: 5.5,
      dimensions: { l: 30, w: 20, h: 15 },
      description: "Vêtements et produits alimentaires",
      declaredValue: 200,
      price: 61.5,
    },
  });
  console.log("✅ Shipment créé :", shipment.id, `(${shipment.status} — ${shipment.price} CAD)`);

  // 5. Créer un événement de tracking
  const tracking = await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "EN_ATTENTE",
      location: "Montréal, QC",
      note: "Envoi enregistré sur la plateforme",
    },
  });
  console.log("✅ TrackingEvent créé :", tracking.id);

  // 6. Créer un paiement
  const payment = await prisma.payment.create({
    data: {
      shipmentId: shipment.id,
      amount: 61.5,
      currency: "CAD",
      method: "STRIPE",
      status: "EN_ATTENTE",
    },
  });
  console.log("✅ Payment créé :", payment.id, `(${payment.method} — ${payment.status})`);

  // 7. Créer une notification
  const notif = await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SHIPMENT_CREATED",
      title: "Envoi créé",
      message: "Votre envoi vers Douala a bien été enregistré.",
    },
  });
  console.log("✅ Notification créée :", notif.id);

  // 8. Lecture complète avec relations
  const fullShipment = await prisma.shipment.findUnique({
    where: { id: shipment.id },
    include: {
      sender: true,
      tracking: true,
      payment: true,
    },
  });
  console.log("\n📦 Envoi complet avec relations :");
  console.log("  Expéditeur :", fullShipment?.sender.firstName, fullShipment?.sender.lastName);
  console.log("  Statut     :", fullShipment?.status);
  console.log("  Tracking   :", fullShipment?.tracking.length, "événement(s)");
  console.log("  Paiement   :", fullShipment?.payment?.method, "—", fullShipment?.payment?.status);

  // 9. Compter toutes les tables
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.shipment.count(),
    prisma.trackingEvent.count(),
    prisma.payment.count(),
    prisma.warehouse.count(),
    prisma.notification.count(),
  ]);
  console.log("\n📊 Comptage tables :");
  console.log("  users            :", counts[0]);
  console.log("  shipments        :", counts[1]);
  console.log("  tracking_events  :", counts[2]);
  console.log("  payments         :", counts[3]);
  console.log("  warehouses       :", counts[4]);
  console.log("  notifications    :", counts[5]);

  // 10. Nettoyage des données test
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.payment.delete({ where: { id: payment.id } });
  await prisma.trackingEvent.deleteMany({ where: { shipmentId: shipment.id } });
  await prisma.shipment.delete({ where: { id: shipment.id } });
  await prisma.warehouse.delete({ where: { id: warehouse.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("\n🧹 Données de test nettoyées");

  console.log("\n✅ TOUS LES TESTS PASSENT — Base de données opérationnelle !\n");
}

main()
  .catch((e) => {
    console.error("\n❌ ERREUR :", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
