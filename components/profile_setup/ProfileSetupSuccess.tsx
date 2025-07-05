"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProfileSetupSuccessProps {
  onContinue?: () => void;
}

export default function ProfileSetupSuccess({ onContinue }: ProfileSetupSuccessProps) {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 3 seconds if no onContinue provided
    if (!onContinue) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [onContinue, router]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50">
      <Card className="w-full max-w-md mx-4 shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Profile Setup Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Congratulations! Your seller profile has been successfully created. 
            You can now access your dashboard and start managing your store.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              🎉 You're now a verified seller! Welcome to the platform.
            </p>
          </div>
          <Button 
            onClick={handleContinue}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go to Dashboard
          </Button>
          {!onContinue && (
            <p className="text-xs text-gray-500">
              Redirecting automatically in 3 seconds...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
