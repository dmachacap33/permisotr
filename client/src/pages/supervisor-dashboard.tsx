import { useEffect, useState } from "react";
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
  Shield,
  Download,
  Eye,
  StopCircle
} from "lucide-react";
import type { Permit } from "@shared/schema";
import { getPermitTypeConfig } from "@/lib/permits";

export default function SupervisorDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [approvalComments, setApprovalComments] = useState("");

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'supervisor'))) {
      toast({
        title: "No autorizado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user?.role, toast]);

  // Fetch permits pending approval
  const { data: permits, isLoading: permitsLoading } = useQuery<Permit[]>({
    queryKey: [
      '/api/permits',
      `?status=pending_approval&approvedBy=${user?.id ?? ''}`,
    ],
    enabled:
      isAuthenticated &&
      (user?.role === 'admin' || user?.role === 'supervisor') &&
      !!user,
  });

  // Fetch active permits for closure
  const { data: activePermits, isLoading: activePermitsLoading } = useQuery<Permit[]>({
    queryKey: [
      '/api/permits',
      `?status=approved&approvedBy=${user?.id ?? ''}`,
    ],
    enabled:
      isAuthenticated &&
      (user?.role === 'admin' || user?.role === 'supervisor') &&
      !!user,
  });

  // Approval mutation
  const approvePermitMutation = useMutation({
    mutationFn: async ({ permitId, approved, comments }: { permitId: string; approved: boolean; comments: string }) => {
      const response = await apiRequest('POST', `/api/permits/${permitId}/approve`, { approved, comments });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Aprobación completada",
        description: "El permiso ha sido procesado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits'] });
      setSelectedPermit(null);
      setApprovalComments("");
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
        description: "No se pudo procesar la aprobación.",
        variant: "destructive",
      });
    },
  });

  // Close permit mutation
  const closePermitMutation = useMutation({
    mutationFn: async ({ permitId, comments }: { permitId: string; comments: string }) => {
      const response = await apiRequest('POST', `/api/permits/${permitId}/close`, { comments });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permiso cerrado",
        description: "El permiso ha sido cerrado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "No se pudo cerrar el permiso.",
        variant: "destructive",
      });
    },
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (permitId: string) => {
      const response = await apiRequest('GET', `/api/permits/${permitId}/pdf`);
      return response.blob();
    },
    onSuccess: (blob, permitId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `permiso-${permitId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF generado",
        description: "El documento PDF ha sido descargado.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (approved: boolean) => {
    if (!selectedPermit) return;
    approvePermitMutation.mutate({
      permitId: selectedPermit.id,
      approved,
      comments: approvalComments,
    });
  };

  const handleClosePermit = (permit: Permit) => {
    const comments = `Permiso cerrado al final del día - ${new Date().toLocaleDateString()}`;
    closePermitMutation.mutate({
      permitId: permit.id,
      comments,
    });
  };

  const handleGeneratePDF = (permitId: string) => {
    generatePDFMutation.mutate(permitId);
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

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'supervisor')) {
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
                <Shield className="mr-3 text-green-600 w-8 h-8" />
                Dashboard de Supervisión
              </h1>
              <p className="text-muted-foreground mt-1">
                Aprobación final y cierre de permisos de trabajo
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="text-orange-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {permits?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Pendientes Aprobación</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {activePermits?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <StopCircle className="text-red-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Cerrados Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Download className="text-blue-600 mr-3 w-6 h-6" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">PDFs Generados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Section */}
            <Card>
              <CardHeader>
                <CardTitle>Permisos Pendientes de Aprobación</CardTitle>
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
                          data-testid={`permit-approval-${permit.id}`}
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
                              Validado
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay permisos pendientes de aprobación</p>
                  </div>
                )}

                {/* Approval Panel */}
                {selectedPermit && (
                  <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        {selectedPermit.permitNumber}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approval-comments">Comentarios de Aprobación</Label>
                      <Textarea
                        id="approval-comments"
                        placeholder="Ingrese sus comentarios sobre la aprobación..."
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        rows={3}
                        data-testid="textarea-approval-comments"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleApprove(true)}
                        disabled={approvePermitMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-final-approve"
                      >
                        <CheckCircle className="mr-2 w-4 h-4" />
                        Aprobar Final
                      </Button>
                      <Button
                        onClick={() => handleApprove(false)}
                        disabled={approvePermitMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                        data-testid="button-final-reject"
                      >
                        <XCircle className="mr-2 w-4 h-4" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Permits for Closure */}
            <Card>
              <CardHeader>
                <CardTitle>Permisos Activos - Cierre del Día</CardTitle>
              </CardHeader>
              <CardContent>
                {activePermitsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cargando permisos activos...</p>
                  </div>
                ) : activePermits && activePermits.length > 0 ? (
                  <div className="space-y-4">
                    {activePermits.map((permit) => {
                      const config = getPermitTypeConfig(permit.type);
                      const IconComponent: any = config.icon;
                      
                      return (
                        <div 
                          key={permit.id}
                          className="p-4 border rounded-lg border-border"
                          data-testid={`permit-active-${permit.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
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
                            <Badge className="bg-green-100 text-green-800">
                              Activo
                            </Badge>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/permits/${permit.id}`}
                              data-testid={`button-view-${permit.id}`}
                            >
                              <Eye className="mr-2 w-4 h-4" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePDF(permit.id)}
                              disabled={generatePDFMutation.isPending}
                              data-testid={`button-pdf-${permit.id}`}
                            >
                              <Download className="mr-2 w-4 h-4" />
                              PDF
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleClosePermit(permit)}
                              disabled={closePermitMutation.isPending}
                              data-testid={`button-close-${permit.id}`}
                            >
                              <StopCircle className="mr-2 w-4 h-4" />
                              Cerrar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay permisos activos</p>
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