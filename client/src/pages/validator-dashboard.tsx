import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertTriangle,
  UserCheck
} from "lucide-react";
import type { Permit } from "@shared/schema";
import { getPermitTypeConfig } from "@/lib/permits";
import { useState } from "react";

export default function ValidatorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [validationComments, setValidationComments] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Necesitas iniciar sesión para acceder.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch permits pending validation
  const { data: permits, isLoading: permitsLoading } = useQuery<Permit[]>({
    queryKey: [
      '/api/permits',
      `?status=pending_validation&validatedBy=${user?.id ?? ''}`,
    ],
    enabled: isAuthenticated && !!user,
  });

  // Validation mutation
  const validatePermitMutation = useMutation({
    mutationFn: async ({ permitId, approved, comments }: { permitId: string; approved: boolean; comments: string }) => {
      const response = await apiRequest('POST', `/api/permits/${permitId}/validate`, { approved, comments });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Validación completada",
        description: "El permiso ha sido procesado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits'] });
      setSelectedPermit(null);
      setValidationComments("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Tu sesión ha expirado. Iniciando sesión...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo procesar la validación.",
        variant: "destructive",
      });
    },
  });

  const handleValidate = (approved: boolean) => {
    if (!selectedPermit) return;
    validatePermitMutation.mutate({
      permitId: selectedPermit.id,
      approved,
      comments: validationComments,
    });
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <UserCheck className="mr-3 text-blue-600 w-8 h-8" />
                Dashboard de Validación
              </h1>
              <p className="text-muted-foreground mt-1">
                Permisos pendientes de validación técnica
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="text-orange-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {permits?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Validados Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Rechazados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permits List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Permisos Pendientes de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                {permitsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cargando permisos...</p>
                  </div>
                ) : permits && permits.length > 0 ? (
                  <div className="space-y-4">
                    {permits.map((permit) => {
                      const config = getPermitTypeConfig(permit.type);
                  const IconComponent: any = config.icon;
                      
                      return (
                        <div 
                          key={permit.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                            selectedPermit?.id === permit.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setSelectedPermit(permit)}
                          data-testid={`permit-${permit.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`w-6 h-6 ${config.color}`} />
                              <div>
                                <p className="font-medium text-foreground">
                                  {permit.permitNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {permit.workDescription}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="">
                              {permit.type}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Área: {permit.areaSite} | Ejecutor: {permit.executorCompany}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay permisos pendientes de validación</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Panel de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPermit ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        {selectedPermit.permitNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPermit.workDescription}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="validation-comments">Comentarios de Validación</Label>
                      <Textarea
                        id="validation-comments"
                        placeholder="Ingrese sus comentarios sobre la validación..."
                        value={validationComments}
                        onChange={(e) => setValidationComments(e.target.value)}
                        rows={4}
                        data-testid="textarea-validation-comments"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleValidate(true)}
                        disabled={validatePermitMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-approve"
                      >
                        <CheckCircle className="mr-2 w-4 h-4" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleValidate(false)}
                        disabled={validatePermitMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                        data-testid="button-reject"
                      >
                        <XCircle className="mr-2 w-4 h-4" />
                        Rechazar
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/permits/${selectedPermit.id}`}
                      className="w-full"
                      data-testid="button-view-details"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Ver Detalles Completos
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecciona un permiso para validar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}