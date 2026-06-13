-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EXPEDITEUR', 'TRANSPORTEUR', 'RESPONSABLE_ENTREPOT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('EN_ATTENTE', 'DEPOSE', 'EN_TRAITEMENT', 'EN_TRANSIT', 'ARRIVE_DESTINATION', 'PRET_RETRAIT', 'EN_LIVRAISON', 'LIVRE', 'ANNULE', 'LITIGE');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('PICKUP', 'HOME_DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MOBILE_MONEY', 'INTERAC');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('EN_ATTENTE', 'PAYE', 'REMBOURSE', 'ECHOUE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('EN_ATTENTE', 'ACTIVE', 'SUSPENDUE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('DEPOT', 'HUB');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'DEPOT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationItem" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departedAt" TIMESTAMP(3),

    CONSTRAINT "LocationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "locations" JSONB NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "carrierId" TEXT,
    "companyId" TEXT,
    "dropoffLocationId" TEXT,
    "deliveryLocationId" TEXT,
    "deliveryType" "DeliveryType" NOT NULL DEFAULT 'PICKUP',
    "status" "ShipmentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "declaredValue" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "note" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "stripeId" TEXT,
    "cinetpayId" TEXT,
    "interacRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsCompany_managerId_key" ON "LogisticsCompany"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRequest_userId_key" ON "CompanyRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_shipmentId_key" ON "Payment"("shipmentId");

-- AddForeignKey
ALTER TABLE "LogisticsCompany" ADD CONSTRAINT "LogisticsCompany_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseLocation" ADD CONSTRAINT "WarehouseLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "LogisticsCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationItem" ADD CONSTRAINT "LocationItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationItem" ADD CONSTRAINT "LocationItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRequest" ADD CONSTRAINT "CompanyRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "LogisticsCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_dropoffLocationId_fkey" FOREIGN KEY ("dropoffLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_deliveryLocationId_fkey" FOREIGN KEY ("deliveryLocationId") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
