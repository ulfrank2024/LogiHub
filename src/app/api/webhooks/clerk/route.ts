import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    deleted?: boolean;
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "whsec_...") {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Headers manquants" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" && data.id) {
    await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId:   data.id,
        email:     data.email_addresses[0]?.email_address ?? "",
        firstName: data.first_name ?? "",
        lastName:  data.last_name ?? "",
        role:      "EXPEDITEUR",
        country:   "CA",
      },
      update: {},
    });
  }

  if (type === "user.updated" && data.id) {
    await prisma.user.updateMany({
      where: { clerkId: data.id },
      data: {
        firstName: data.first_name ?? "",
        lastName:  data.last_name ?? "",
        email:     data.email_addresses[0]?.email_address ?? "",
      },
    });
  }

  if (type === "user.deleted" && data.id) {
    await prisma.user.deleteMany({ where: { clerkId: data.id } });
  }

  return NextResponse.json({ received: true });
}
