import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileSetupClient from "./ProfileSetupClient";
import ProfileSetupGuard from "@/components/ProfileSetupGuard";

export default async function ProfileSetupPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <ProfileSetupGuard>
      <ProfileSetupClient />
    </ProfileSetupGuard>
  );
}
