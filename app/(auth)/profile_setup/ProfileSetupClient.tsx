"use client";

import AddressStep from "@/components/profile_setup/AddressStep";
import DocumentationStep from "@/components/profile_setup/DocumentationStep";
import PersonalDetailsStep from "@/components/profile_setup/PersonalDetailsStep";
import ReviewStep from "@/components/profile_setup/ReviewStep";
import StoreAddressStep from "@/components/profile_setup/StoreAddressStep";
import StoreDetailsStep from "@/components/profile_setup/StoreDetailsStep";
import ProfileSetupSuccess from "@/components/profile_setup/ProfileSetupSuccess";
import { LoadingModal, useLoadingModal } from "@/components/LoadingModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { profileFormVar } from "@/lib/state/profileSetupState";
import { userVar } from "@/lib/state/userState";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SETUP_PROFILE = gql`
  mutation SetupProfile($input: ProfileSetupInput!) {
    setupProfile(input: $input) {
      success
      message
      profile {
        id
      }
    }
  }
`;

const GET_USER_DETAILS = gql`
  query Me {
    me {
      id
      email
      role
      profile {
        id
      }
    }
  }
`;

export default function ProfileSetupClient() {
  const router = useRouter();
  const [setupProfile] = useMutation(SETUP_PROFILE);
  const { data, loading } = useQuery(GET_USER_DETAILS);
  const loadingModal = useLoadingModal();

  const formData = useReactiveVar(profileFormVar);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!loading && data?.me) {
      userVar(data.me);
      // If user already has a profile, redirect to dashboard
      if (data.me.profile) {
        console.log('User already has profile, redirecting to dashboard');
        router.replace('/');
      }
    }
  }, [loading, data, router]);

  // Show skeleton while loading
  if (loading) {
    return (
      <LoadingModal
        open={true}
        title="Loading Profile"
        description="Please wait while we load your profile information"
        status="loading"
      />
    );
  }

  const updateFormData = (stepData: any, stepKey: keyof typeof formData) => {
    profileFormVar({
      ...formData,
      [stepKey]: {
        ...formData[stepKey],
        ...stepData,
      },
    });
  };

  const handleNext = () => currentStep < 6 && setCurrentStep(currentStep + 1);
  const handlePrevious = () =>
    currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    loadingModal.showLoading();
    
    try {
      console.log("Submitting form data:", formData);
      const { data } = await setupProfile({
        variables: { input: formData },
        refetchQueries: ['GetUserProfile', 'Me'], // Refetch user profile queries
        awaitRefetchQueries: true
      });
      console.log("Setup profile response:", data);
      
      if (data?.setupProfile?.success) {
        console.log("Profile setup successful!");
        loadingModal.showSuccess("Your seller profile has been created successfully!");
        
        // Wait a moment to show success, then redirect
        setTimeout(() => {
          loadingModal.close();
          toast.success("Profile setup completed successfully!", {
            description: "Welcome to the platform! Your seller account is now active."
          });
          setIsSuccess(true);
        }, 2000);
      } else {
        console.error("Profile setup failed:", data?.setupProfile?.message);
        loadingModal.showError(data?.setupProfile?.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      loadingModal.showError(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            data={formData.personalDetails}
            onUpdate={(data) => updateFormData(data, "personalDetails")}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AddressStep
            temporaryAddress={formData.temporaryAddress}
            permanentAddress={formData.permanentAddress}
            onUpdateTemporary={(data) =>
              updateFormData(data, "temporaryAddress")
            }
            onUpdatePermanent={(data) =>
              updateFormData(data, "permanentAddress")
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <StoreDetailsStep
            data={formData.storeDetails}
            onUpdate={(data) => updateFormData(data, "storeDetails")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <StoreAddressStep
            data={formData.storeAddress}
            onUpdate={(data) => updateFormData(data, "storeAddress")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <DocumentationStep
            data={formData.documentation}
            onUpdate={(data) => updateFormData(data, "documentation")}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ReviewStep
            data={formData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    {
      number: 1,
      title: "Personal Details",
      description: "Basic information about you",
    },
    {
      number: 2,
      title: "Addresses",
      description: "Your temporary and permanent addresses",
    },
    {
      number: 3,
      title: "Store Details",
      description: "Information about your store",
    },
    {
      number: 4,
      title: "Store Address",
      description: "Your store location details",
    },
    {
      number: 5,
      title: "Documentation",
      description: "Legal documents and verification",
    },
    {
      number: 6,
      title: "Review",
      description: "Review and confirm your details",
    },
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  // Show success screen if profile setup is complete
  if (isSuccess) {
    return (
      <ProfileSetupSuccess 
        onContinue={() => {
          // Force a small delay to ensure database is updated then redirect
          setTimeout(() => {
            router.replace("/");
          }, 500);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-500">
            Set up your seller profile in just a few simple steps
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-green-200" />
        </div>

        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center space-y-2 min-w-0 px-2 ${
                step.number <= currentStep ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                  step.number <= currentStep
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {step.number}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs hidden sm:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-emerald-100">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>
        
        {/* Loading Modal */}
        <LoadingModal
          open={loadingModal.isOpen}
          onOpenChange={loadingModal.setIsOpen}
          title="Setting Up Profile"
          description="Please wait while we create your seller profile"
          status={loadingModal.status}
          errorMessage={loadingModal.errorMessage}
          successMessage={loadingModal.successMessage}
          onClose={() => {
            loadingModal.close();
            if (loadingModal.status === 'error') {
              // Stay on the current step to allow retry
            }
          }}
        />
      </div>
    </div>
  );
}
