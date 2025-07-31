
import { Building2, GraduationCap, Briefcase } from 'lucide-react';

interface RoleIndicatorProps {
  role: string;
}

export function RoleIndicator({ role }: RoleIndicatorProps) {
  const getRoleInfo = () => {
    switch (role) {
      case 'producer':
        return {
          icon: <Briefcase className="h-5 w-5 text-purple-400" />,
          title: 'Produtor de Conteúdo',
          description: 'Crie e gerencie conteúdos educacionais',
          gradient: 'from-purple-500/20 to-pink-500/20'
        };
      case 'company':
        return {
          icon: <Building2 className="h-5 w-5 text-emerald-400" />,
          title: 'Empresa',
          description: 'Gerencie equipes e acompanhe o desenvolvimento',
          gradient: 'from-emerald-500/20 to-teal-500/20'
        };
      default:
        return {
          icon: <GraduationCap className="h-5 w-5 text-blue-400" />,
          title: 'Colaborador/Estudante',
          description: 'Acesse cursos e desenvolva suas habilidades',
          gradient: 'from-blue-500/20 to-cyan-500/20'
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className={`flex items-center justify-center space-x-3 mt-6 p-4 bg-gradient-to-r ${roleInfo.gradient} rounded-xl border border-gray-600/30 backdrop-blur-sm`}>
      <div className="p-2 bg-gray-700/50 rounded-lg">
        {roleInfo.icon}
      </div>
      <div className="text-left">
        <div className="font-semibold text-sm text-white">{roleInfo.title}</div>
        <div className="text-xs text-gray-300">{roleInfo.description}</div>
      </div>
    </div>
  );
}
