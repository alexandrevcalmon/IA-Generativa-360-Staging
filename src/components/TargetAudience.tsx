import { Users, Zap, TrendingUp } from 'lucide-react';

export function TargetAudience() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-calmon-600 to-calmon-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Para Quem Foi Desenhado Este Programa?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1 - Líderes Visionários */}
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Líderes Visionários</h3>
            <p className="text-white/80 leading-relaxed">
              CEOs, Diretores, Gerentes que buscam vanguarda e eficiência.
            </p>
          </div>

          {/* Coluna 2 - Profissionais Inovadores */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Profissionais Inovadores</h3>
            <p className="text-white/80 leading-relaxed">
              Marketing, Vendas, RH, Operações que desejam otimizar processos e criar soluções disruptivas.
            </p>
          </div>

          {/* Coluna 3 - Organizações de Todos os Portes */}
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Organizações de Todos os Portes</h3>
            <p className="text-white/80 leading-relaxed">
              De startups a grandes corporações, que reconhecem a IA Generativa como motor de transformação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
