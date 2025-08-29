interface RoleBadgeProps {
  role: string;
  className?: string;
}

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    const configs = {
      admin: {
        label: 'Administrador',
        className: 'bg-purple-100 text-purple-800'
      },
      supervisor: {
        label: 'Supervisor', 
        className: 'bg-blue-100 text-blue-800'
      },
      user: {
        label: 'Usuario',
        className: 'bg-green-100 text-green-800'
      },
      operator: {
        label: 'Operador',
        className: 'bg-orange-100 text-orange-800'
      }
    };
    
    return configs[role as keyof typeof configs] || configs.user;
  };

  const config = getRoleConfig(role);
  
  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm font-medium ${config.className} ${className}`}
      data-testid={`role-badge-${role}`}
    >
      {config.label}
    </span>
  );
}
