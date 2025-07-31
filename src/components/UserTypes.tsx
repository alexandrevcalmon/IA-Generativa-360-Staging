import { Building2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function UserTypes() {
  const navigate = useNavigate();

  const handleCompanyClick = () => {
    console.log('Company button clicked');
    navigate('/auth?role=company');
  };

  const handleStudentClick = () => {
    console.log('Student button clicked');
    navigate('/auth?role=student');
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Solução completa para aprendizagem corporativa
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Para empresas que querem capacitar equipes e profissionais que buscam desenvolvimento. Transforme sua carreira com educação de qualidade.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Empresa */}
          <div className="bg-gradient-to-br from-calmon-100 to-calmon-200 rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-shadow border border-calmon-300 w-full max-w-sm">
            <div className="w-16 h-16 bg-calmon-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Sou Empresa</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Gerencie equipes e acompanhe o desenvolvimento corporativo
            </p>
            <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
              <li>• Gestão de colaboradores</li>
              <li>• Relatórios e analytics</li>
              <li>• Configuração de planos</li>
              <li>• Dashboard executivo</li>
            </ul>
            <Button 
              onClick={handleCompanyClick}
              className="w-full bg-calmon-700 hover:bg-calmon-800 text-white h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
            >
              Acessar Painel da Empresa →
            </Button>
          </div>

          {/* Colaborador */}
          <div className="bg-gradient-to-br from-calmon-200 to-calmon-300 rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-shadow border border-calmon-400 w-full max-w-sm">
            <div className="w-16 h-16 bg-calmon-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Sou Colaborador</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Acesse cursos, trilhas e desenvolva suas habilidades
            </p>
            <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
              <li>• Cursos e certificações</li>
              <li>• Progresso personalizado</li>
              <li>• Comunidade e mentoria</li>
              <li>• Gamificação e rewards</li>
            </ul>
            <Button 
              onClick={handleStudentClick}
              className="w-full bg-calmon-800 hover:bg-calmon-900 text-white h-12 sm:h-14 text-base sm:text-lg font-medium touch-manipulation"
            >
              Acessar Área do Colaborador →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 
