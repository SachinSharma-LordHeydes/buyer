import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import ProfileSetupClient from "./ProfileSetupClient";

export default async function ProfileSetupPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Check if the user already has a profile in your DB
  const prisma = new PrismaClient();
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { profile: true },
  });
  if (dbUser?.profile) {
    redirect("/");
  }

  // Render the client-side profile setup flow
  return <ProfileSetupClient />;
}
