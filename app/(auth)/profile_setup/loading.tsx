"use client";

import { LoadingModal } from "@/components/LoadingModal";

export default function ProfileSetupLoading() {
  return (
    <LoadingModal
      open={true}
      title="Loading Profile Setup"
      description="Please wait while we prepare your profile setup"
      status="loading"
    />
  );
}
