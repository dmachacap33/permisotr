import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PermitForm from "@/components/permit/permit-form";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { getPermitTypeConfig } from "@/lib/permits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RoleBadge from "@/components/ui/role-badge";
import type { Permit } from "@shared/schema";

export default function PermitDetails() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Get permit ID from URL
  const permitId = location.split('/').pop();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch permit details
  const { data: permit, isLoading: permitLoading, error } = useQuery<Permit>({
    queryKey: ['/api/permits', permitId],
    enabled: isAuthenticated && !!permitId,
  });

  // Update permit mutation
  const updatePermitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/permits/${permitId}`, data);
      return response.json();
    },
    onSuccess: (updatedPermit) => {
      toast({
        title: "Permiso actualizado",
        description: `Permiso ${updatedPermit.permitNumber} actualizado exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits', permitId] });
      queryClient.invalidateQueries({ queryKey: ['/api/permits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso. Inténtelo nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Submit for validation mutation
  const submitForValidationMutation = useMutation({
    mutationFn: async (data: { validatorId: string; comments?: string }) => {
      const response = await apiRequest('POST', `/api/permits/${permitId}/submit-for-validation`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enviado para validación",
        description: "El permiso ha sido enviado para validación",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits', permitId] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo enviar el permiso para validación",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: any, isDraft: boolean = true) => {
    const updateData = {
      ...data,
      status: isDraft ? 'draft' : permit?.status,
    };
    
    updatePermitMutation.mutate(updateData);
  };

  const handleSubmitForValidation = (validatorId: string, comments?: string) => {
    submitForValidationMutation.mutate({ validatorId, comments });
  };

  if (authLoading || permitLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando permiso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !permit) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Permiso no encontrado</h2>
                <p className="text-muted-foreground mb-4">El permiso solicitado no existe o no tienes permisos para verlo.</p>
                <Button onClick={() => navigate('/')}>
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const config = getPermitTypeConfig(permit.type);
  const canEdit = permit.status === 'draft' && permit.createdBy === user?.id;
  const canValidate = (user?.role === 'supervisor' || user?.role === 'admin') && 
                     permit.status === 'pending_validation';
  const canApprove = (user?.role === 'supervisor' || user?.role === 'admin') && 
                    permit.status === 'pending_approval';

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-800' },
      pending_validation: { label: 'Pendiente Validación', class: 'bg-yellow-100 text-yellow-800' },
      pending_approval: { label: 'Pendiente Aprobación', class: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rechazado', class: 'bg-red-100 text-red-800' },
      expired: { label: 'Vencido', class: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

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
                {getStatusBadge(permit.status || 'draft')}
                <span className="text-sm text-muted-foreground" data-testid="text-permit-number">
                  {permit.permitNumber}
                </span>
              </div>
            </div>
            
            {/* Permit metadata */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Creado por:</span>
                  <span className="ml-2 font-medium">{permit.executorCompany || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <span className="ml-2 font-medium">
                    {permit.createdAt ? new Date(permit.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="ml-2 font-medium">
                    {permit.stationDuct && permit.areaSite ? 
                      `${permit.stationDuct} - ${permit.areaSite}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <PermitForm
            permitType={permit.type}
            initialData={permit}
            onSave={handleSave}
            onSubmitForValidation={handleSubmitForValidation}
            isLoading={updatePermitMutation.isPending || submitForValidationMutation.isPending}
            canEdit={canEdit}
            canValidate={canValidate}
            canApprove={canApprove}
            readOnly={!canEdit && !canValidate && !canApprove}
          />
        </div>
      </main>
    </div>
  );
}
