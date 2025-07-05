"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  status?: 'loading' | 'success' | 'error';
  errorMessage?: string;
  successMessage?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function LoadingModal({
  open,
  onOpenChange,
  title,
  description,
  status = 'loading',
  errorMessage,
  successMessage,
  showCloseButton = false,
  onClose,
}: LoadingModalProps) {
  const [dots, setDots] = useState('');

  // Animated dots for loading state
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [status]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return successMessage || 'Completed successfully!';
      case 'error':
        return errorMessage || 'An error occurred. Please try again.';
      default:
        return description || 'Please wait while we process your request';
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={status === 'loading' ? undefined : onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[400px]" 
        onPointerDownOutside={(e) => {
          if (status === 'loading') {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (status === 'loading') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span className={getStatusColor()}>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {getStatusMessage()}
              {status === 'loading' && (
                <span className="inline-block w-6 text-left">{dots}</span>
              )}
            </p>
            
            {status === 'loading' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-700">
                    Processing your information...
                  </span>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Your profile has been set up successfully!
                  </span>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Please check your information and try again.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {(showCloseButton || status !== 'loading') && (
          <div className="flex justify-center">
            <Button 
              onClick={handleClose}
              variant={status === 'error' ? 'destructive' : 'default'}
              className="min-w-[100px]"
            >
              {status === 'error' ? 'Try Again' : 'Close'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage loading modal state
export function useLoadingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const showLoading = (message?: string) => {
    setStatus('loading');
    if (message) setSuccessMessage(message);
    setIsOpen(true);
  };

  const showSuccess = (message?: string) => {
    setStatus('success');
    if (message) setSuccessMessage(message);
  };

  const showError = (message?: string) => {
    setStatus('error');
    if (message) setErrorMessage(message);
  };

  const close = () => {
    setIsOpen(false);
    // Reset state after modal closes
    setTimeout(() => {
      setStatus('loading');
      setErrorMessage('');
      setSuccessMessage('');
    }, 300);
  };

  return {
    isOpen,
    status,
    errorMessage,
    successMessage,
    showLoading,
    showSuccess,
    showError,
    close,
    setIsOpen,
  };
}
