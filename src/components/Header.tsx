
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, GraduationCap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCompanyClick = () => {
    setIsModalOpen(false);
    navigate('/auth?role=company');
  };

  const handleStudentClick = () => {
    setIsModalOpen(false);
    navigate('/auth?role=student');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/Logomarca Calmon Academy.png" 
                alt="Calmon Academy" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Botão Entrar */}
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium"
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-4xl mx-4 relative shadow-2xl">
            {/* Botão Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Logo e Título do Modal */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img 
                  src="/Logomarca Calmon Academy.png" 
                  alt="Calmon Academy" 
                  className="h-16 w-auto filter brightness-0 invert"
                />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Escolha seu perfil
              </h2>
            </div>

            {/* Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empresa */}
              <div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 border border-gray-600/30 cursor-pointer group hover:scale-[1.02]" 
                onClick={handleCompanyClick}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sou Empresa</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed">
                  Gerencie equipes e acompanhe o desenvolvimento corporativo
                </p>
                <ul className="text-left text-sm text-gray-300 mb-8 space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Gestão de colaboradores
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Relatórios e analytics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Configuração de planos
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Dashboard executivo
                  </li>
                </ul>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 group-hover:scale-105">
                  Acessar Painel da Empresa →
                </div>
              </div>

              {/* Colaborador */}
              <div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-600/30 cursor-pointer group hover:scale-[1.02]" 
                onClick={handleStudentClick}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sou Colaborador</h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed">
                  Acesse cursos, trilhas e desenvolva suas habilidades
                </p>
                <ul className="text-left text-sm text-gray-300 mb-8 space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Cursos e certificações
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Progresso personalizado
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Comunidade e mentoria
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Gamificação e rewards
                  </li>
                </ul>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/30 group-hover:scale-105">
                  Acessar Área do Colaborador →
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
