// app/api/webhooks/clerk/route.ts
import { prisma } from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET || process.env.SIGNING_SECRET;

  console.log("=== CLERK WEBHOOK CALLED ===");
  console.log("Secret configured:", !!secret);

  if (!secret) {
    console.error("Webhook secret not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const payload = await req.text();
  const headerList = await headers();

  console.log("Payload length:", payload.length);
  console.log("Headers:", Object.fromEntries(headerList.entries()));

  // Get headers with null checks
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  // Validate required headers exist
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required headers:", { svixId, svixTimestamp, svixSignature });
    return new Response("Missing required headers", { status: 400 });
  }

  const wh = new Webhook(secret);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
    console.log("Webhook verified successfully. Event type:", event.type);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated":
      try {
        const { id, email_addresses } = event.data;
        const email = email_addresses[0]?.email_address;

        console.log("Processing user event:", { 
          eventType: event.type, 
          clerkId: id, 
          email,
          emailAddresses: email_addresses 
        });

        if (!email) {
          console.error("No email found in webhook payload", { email_addresses });
          throw new Error("No email found in webhook payload");
        }

        // First, try to find existing user by clerkId
        let result = await prisma.user.findUnique({
          where: { clerkId: id }
        });

        if (result) {
          // User exists with this clerkId, update it
          result = await prisma.user.update({
            where: { clerkId: id },
            data: {
              email,
              role: "SELLER",
            },
          });
          console.log("Updated existing user by clerkId:", result.clerkId);
        } else {
          // Check if a user exists with this email but different clerkId
          const existingEmailUser = await prisma.user.findUnique({
            where: { email }
          });

          if (existingEmailUser) {
            // Update the existing user's clerkId (user might have recreated account)
            result = await prisma.user.update({
              where: { email },
              data: {
                clerkId: id,
                role: "SELLER",
              },
            });
            console.log("Updated user with new clerkId for existing email:", {
              oldClerkId: existingEmailUser.clerkId,
              newClerkId: id,
              email
            });
          } else {
            // Create new user
            result = await prisma.user.create({
              data: {
                clerkId: id,
                email,
                role: "SELLER",
              },
            });
            console.log("Created new user:", result.clerkId);
          }
        }
        
        console.log("User upserted successfully:", {
          userId: result.id,
          clerkId: result.clerkId,
          email: result.email,
          role: result.role
        });
        
      } catch (err) {
        console.error("Error processing user event:", err);
        return new Response("Error processing user data", { status: 500 });
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response("OK", { status: 200 });
}
