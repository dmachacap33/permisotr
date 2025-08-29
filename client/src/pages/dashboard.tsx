import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import RoleBadge from "@/components/ui/role-badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Shovel,
  Flame,
  Wrench,
  Eye,
  ArrowRight
} from "lucide-react";

import type { Permit } from "@shared/schema";

interface DashboardStats {
  activePermits: number;
  pendingPermits: number;
  approvedToday: number;
  expiringToday: number;
}

const permitTypeConfig = {
  excavation: {
    title: 'Excavación',
    subtitle: 'FS.019 R8',
    icon: Shovel,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-l-purple-500'
  },
  hot: {
    title: 'Trabajo en Caliente', 
    subtitle: 'FS.020 R10',
    icon: Flame,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    borderColor: 'border-l-yellow-500'
  },
  cold: {
    title: 'Trabajo en Frío',
    subtitle: 'FS.021 R11', 
    icon: Wrench,
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-600',
    borderColor: 'border-l-cyan-500'
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-800' },
    pending_validation: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' },
    pending_approval: { label: 'Por Aprobar', class: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazado', class: 'bg-red-100 text-red-800' },
    expired: { label: 'Vencido', class: 'bg-gray-100 text-gray-800' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  );
};

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isAuthenticated,
  });

  // Fetch recent permits
  const { data: permits, isLoading: permitsLoading } = useQuery<Permit[]>({
    queryKey: ['/api/permits'],
    enabled: isAuthenticated,
  });

  const createPermit = (type: 'excavation' | 'hot' | 'cold') => {
    window.location.href = `/permits/create?type=${type}`;
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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="space-y-8">
          
          {/* Welcome Section */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Bienvenido, {user.firstName || user.email}
                </h2>
                <p className="text-muted-foreground">
                  Gestiona tus permisos de trabajo de forma segura y eficiente
                </p>
              </div>
              <RoleBadge role={user.role || 'user'} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-active-permits">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Permisos Activos</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-count">
                      {statsLoading ? '...' : stats?.activePermits || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-pending-permits">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-pending-count">
                      {statsLoading ? '...' : stats?.pendingPermits || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-approved-today">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Aprobados Hoy</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-approved-count">
                      {statsLoading ? '...' : stats?.approvedToday || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-expiring-today">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Vencen Hoy</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-expiring-count">
                      {statsLoading ? '...' : stats?.expiringToday || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card data-testid="card-create-permits">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Crear Nuevo Permiso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {Object.entries(permitTypeConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <div 
                      key={key}
                      className={`permit-card bg-white rounded-lg p-6 border border-border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${config.borderColor}`}
                      onClick={() => createPermit(key as 'excavation' | 'hot' | 'cold')}
                      data-testid={`card-create-${key}`}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`p-3 ${config.bgColor} rounded-lg`}>
                          <IconComponent className={`${config.textColor} w-6 h-6`} />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold text-foreground">{config.title}</h4>
                          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {key === 'excavation' && 'Permiso para trabajos de excavación y movimiento de tierra'}
                        {key === 'hot' && 'Permiso para soldadura, corte y trabajos con fuego'}  
                        {key === 'cold' && 'Permiso para trabajos de mantenimiento sin fuego'}
                      </p>
                      <div className={`flex items-center text-sm ${config.textColor}`}>
                        <span>Crear permiso</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Permits */}
          <Card data-testid="card-recent-permits">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-foreground">Permisos Recientes</h3>
                <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
                  Ver todos
                </Button>
              </div>
              
              {permitsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {permits?.slice(0, 5).map((permit: Permit) => {
                    const config = permitTypeConfig[permit.type as keyof typeof permitTypeConfig];
                    const IconComponent = config.icon;
                    
                    return (
                      <div 
                        key={permit.id} 
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        data-testid={`permit-${permit.id}`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 ${config.bgColor} rounded-lg mr-4`}>
                            <IconComponent className={`${config.textColor} w-6 h-6`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground" data-testid={`permit-description-${permit.id}`}>
                              {config.title} - {permit.workDescription}
                            </h4>
                            <p className="text-sm text-muted-foreground" data-testid={`permit-location-${permit.id}`}>
                              {(permit.stationDuct || "")} - {(permit.areaSite || "")} • {permit.permitNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Creado el {new Date(permit.createdAt || Date.now()).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div data-testid={`permit-status-${permit.id}`}>
                            {getStatusBadge(permit.status || 'draft')}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.href = `/permits/${permit.id}`}
                            data-testid={`button-view-${permit.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!permits || permits.length === 0) && (
                    <div className="text-center py-8" data-testid="text-no-permits">
                      <p className="text-muted-foreground">No hay permisos recientes</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Crea tu primer permiso usando las opciones de arriba
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
