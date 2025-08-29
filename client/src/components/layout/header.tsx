import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import RoleBadge from "@/components/ui/role-badge";
import { 
  HardHat, 
  Bell, 
  LogOut,
  Home,
  FileText,
  Users,
  Settings,
  UserCheck,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email || 'Usuario';
  };

  return (
    <header className="bg-white border-b border-border shadow-sm" data-testid="header-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center hover:opacity-80 transition-opacity"
              data-testid="button-home"
            >
              <HardHat className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">YPFB Permisos de Trabajo</h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Menu for larger screens */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2"
                data-testid="nav-dashboard"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/permits'}
                className="flex items-center space-x-2"
                data-testid="nav-permits"
              >
                <FileText className="w-4 h-4" />
                <span>Permisos</span>
              </Button>

              {/* Validator Dashboard */}
              {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'user') && (
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/validator'}
                  className="flex items-center space-x-2"
                  data-testid="nav-validator"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Validar</span>
                </Button>
              )}

              {/* Supervisor Dashboard */}
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/supervisor'}
                  className="flex items-center space-x-2"
                  data-testid="nav-supervisor"
                >
                  <Shield className="w-4 h-4" />
                  <span>Supervisar</span>
                </Button>
              )}
              
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center space-x-2"
                  data-testid="nav-admin"
                >
                  <Users className="w-4 h-4" />
                  <span>Administración</span>
                </Button>
              )}
            </nav>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-md hover:bg-muted transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <RoleBadge role={user?.role || 'user'} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 hover:bg-muted transition-colors"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials(user?.firstName, user?.lastName, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {getDisplayName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/profile'}
                    data-testid="menu-profile"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  
                  {/* Mobile Navigation */}
                  <div className="md:hidden">
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/'}
                      data-testid="menu-dashboard-mobile"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/permits'}
                      data-testid="menu-permits-mobile"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Permisos</span>
                    </DropdownMenuItem>
                    
                    {(user?.role === 'admin' || user?.role === 'supervisor') && (
                      <DropdownMenuItem 
                        onClick={() => window.location.href = '/admin'}
                        data-testid="menu-admin-mobile"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Administración</span>
                      </DropdownMenuItem>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-red-600 focus:text-red-600"
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
