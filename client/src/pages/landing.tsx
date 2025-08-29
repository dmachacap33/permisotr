import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Shield, FileCheck, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HardHat className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">YPFB Permisos de Trabajo</h1>
            </div>
            <Button
              onClick={() => window.location.href = "/login"}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-login"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Sistema de Permisos de Trabajo
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Gestiona de forma segura y eficiente todos los permisos de trabajo industrial. 
              Sistema integral para excavación, trabajos en caliente y en frío con análisis de riesgos completo.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = "/login"}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg"
              data-testid="button-get-started"
            >
              Comenzar
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Características Principales
            </h3>
            <p className="text-lg text-muted-foreground">
              Todo lo que necesitas para gestionar permisos de trabajo de manera profesional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6" data-testid="card-feature-roles">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Multi-Roles
                </h4>
                <p className="text-muted-foreground">
                  Administrador, Supervisor, Usuario y Operador con permisos específicos
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-feature-permits">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  3 Tipos de Permisos
                </h4>
                <p className="text-muted-foreground">
                  Excavación, Trabajo en Caliente y Trabajo en Frío con formularios específicos
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-feature-apt">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Análisis APT
                </h4>
                <p className="text-muted-foreground">
                  Análisis de Peligros del Trabajo integrado para máxima seguridad
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6" data-testid="card-feature-workflow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HardHat className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Flujo de Aprobación
                </h4>
                <p className="text-muted-foreground">
                  Usuario → Validador → Supervisor con notificaciones automáticas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety Standards */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-foreground mb-8">
              Estándares de Seguridad Industrial
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center" data-testid="standard-fs019">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">FS.019</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Permiso de Excavación
                </h4>
                <p className="text-muted-foreground">
                  Revisión 8 - Trabajos de excavación y movimiento de tierra
                </p>
              </div>

              <div className="text-center" data-testid="standard-fs020">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">FS.020</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Trabajo en Caliente
                </h4>
                <p className="text-muted-foreground">
                  Revisión 10 - Soldadura, corte y trabajos con fuego
                </p>
              </div>

              <div className="text-center" data-testid="standard-fs021">
                <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan-600">FS.021</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Trabajo en Frío
                </h4>
                <p className="text-muted-foreground">
                  Revisión 11 - Mantenimiento sin fuego ni chispas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <HardHat className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-foreground">YPFB Permisos de Trabajo</span>
            </div>
            <p className="text-muted-foreground">
              Sistema profesional de gestión de permisos de trabajo industrial
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Espere lo inesperado – Piense en su seguridad
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
