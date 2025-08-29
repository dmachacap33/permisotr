import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PermitForm from "@/components/permit/permit-form";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { getPermitTypeConfig } from "@/lib/permits";

export default function CreatePermit() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Get permit type from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const permitType = urlParams.get('type') || 'excavation';
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Create permit mutation
  const createPermitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/permits', data);
      return response.json();
    },
    onSuccess: (permit) => {
      toast({
        title: "Permiso creado",
        description: `Permiso ${permit.permitNumber} creado exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      navigate(`/permits/${permit.id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo crear el permiso. Inténtelo nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: any, isDraft: boolean = true) => {
    const permitData = {
      ...data,
      type: permitType,
      status: isDraft ? 'draft' : 'pending_validation',
    };
    
    createPermitMutation.mutate(permitData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const config = getPermitTypeConfig(permitType);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Form Header */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/')}
                  className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground" data-testid="text-form-title">
                    {config.title}
                  </h2>
                  <p className="text-sm text-muted-foreground" data-testid="text-form-subtitle">
                    {config.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Nuevo
                </span>
              </div>
            </div>
          </div>

          <PermitForm
            permitType={permitType}
            onSave={handleSave}
            isLoading={createPermitMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}
