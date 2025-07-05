"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Image, Video, Package, Loader2 } from "lucide-react";

export interface UploadStep {
  id: string;
  label: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
  details?: string;
}

interface UploadProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: UploadStep[];
  currentStep: string;
  overallProgress: number;
  title: string;
}

export function UploadProgressModal({
  open,
  onOpenChange,
  steps,
  currentStep,
  overallProgress,
  title,
}: UploadProgressModalProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  const getStepIcon = (step: UploadStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <div className="w-5 h-5 rounded-full bg-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStepColor = (step: UploadStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'uploading':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(displayProgress)}%</span>
            </div>
            <Progress 
              value={displayProgress} 
              className="h-3"
            />
          </div>

          {/* Step Progress */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getStepColor(step)}`}>
                        {step.label}
                      </span>
                      {step.status === 'uploading' && (
                        <span className="text-xs text-muted-foreground">
                          {step.progress}%
                        </span>
                      )}
                    </div>
                    {step.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.details}
                      </p>
                    )}
                    {step.status === 'uploading' && (
                      <Progress 
                        value={step.progress} 
                        className="h-2 mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-700">
                {steps.find(s => s.id === currentStep)?.label || 'Processing...'}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage upload progress
export function useUploadProgress() {
  const [steps, setSteps] = useState<UploadStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const initializeSteps = (initialSteps: Omit<UploadStep, 'status' | 'progress'>[]) => {
    const newSteps = initialSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      progress: 0,
    }));
    setSteps(newSteps);
    setOverallProgress(0);
    setCurrentStep(newSteps[0]?.id || '');
  };

  const updateStep = (stepId: string, updates: Partial<UploadStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const startStep = (stepId: string, details?: string) => {
    setCurrentStep(stepId);
    updateStep(stepId, { 
      status: 'uploading', 
      progress: 0,
      details 
    });
  };

  const updateStepProgress = (stepId: string, progress: number, details?: string) => {
    updateStep(stepId, { 
      progress: Math.min(100, Math.max(0, progress)),
      details 
    });
    
    // Calculate overall progress
    setSteps(prev => {
      const updatedSteps = prev.map(step => 
        step.id === stepId ? { ...step, progress: Math.min(100, Math.max(0, progress)) } : step
      );
      const totalProgress = updatedSteps.reduce((sum, step) => sum + step.progress, 0);
      setOverallProgress(totalProgress / updatedSteps.length);
      return updatedSteps;
    });
  };

  const completeStep = (stepId: string, details?: string) => {
    updateStep(stepId, { 
      status: 'completed', 
      progress: 100,
      details: details || 'Completed'
    });
  };

  const errorStep = (stepId: string, error: string) => {
    updateStep(stepId, { 
      status: 'error', 
      details: error 
    });
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const reset = () => {
    setSteps([]);
    setCurrentStep('');
    setOverallProgress(0);
    setIsOpen(false);
  };

  return {
    steps,
    currentStep,
    overallProgress,
    isOpen,
    initializeSteps,
    updateStep,
    startStep,
    updateStepProgress,
    completeStep,
    errorStep,
    openModal,
    closeModal,
    reset,
  };
}
