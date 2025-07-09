
import { Building2, GraduationCap, Briefcase } from 'lucide-react';

interface RoleIndicatorProps {
  role: string;
}

export function RoleIndicator({ role }: RoleIndicatorProps) {
  const getRoleInfo = () => {
    switch (role) {
      case 'producer':
        return {
          icon: <Briefcase className="h-5 w-5" />,
          title: 'Produtor de Conteúdo',
          description: 'Crie e gerencie conteúdos educacionais'
        };
      case 'company':
        return {
          icon: <Building2 className="h-5 w-5" />,
          title: 'Empresa',
          description: 'Gerencie equipes e acompanhe o desenvolvimento'
        };
      default:
        return {
          icon: <GraduationCap className="h-5 w-5" />,
          title: 'Colaborador/Estudante',
          description: 'Acesse cursos e desenvolva suas habilidades'
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="flex items-center justify-center space-x-2 mt-4 p-3 bg-gray-50 rounded-lg">
      {roleInfo.icon}
      <div className="text-left">
        <div className="font-semibold text-sm text-gray-900">{roleInfo.title}</div>
        <div className="text-xs text-gray-600">{roleInfo.description}</div>
      </div>
    </div>
  );
}
