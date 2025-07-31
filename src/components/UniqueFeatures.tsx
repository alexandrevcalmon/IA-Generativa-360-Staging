import { Brain, Star, Heart, TrendingUp } from 'lucide-react';

export function UniqueFeatures() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            O Que Torna o Programa IA Generativa 360° Único?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 - Transformação Cultural */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transformação Cultural</h3>
            <p className="text-gray-600 text-sm">
              Não apenas treinamento em ferramentas
            </p>
          </div>

          {/* Card 2 - Condução Especializada */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Condução Especializada</h3>
            <p className="text-gray-600 text-sm">
              Experiência prática em grandes corporações
            </p>
          </div>

          {/* Card 3 - Integração com Saúde Mental */}
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Integração com Saúde Mental</h3>
            <p className="text-gray-600 text-sm">
              Expertise de Daniela Magno, Mestra pela UNIFESP
            </p>
          </div>

          {/* Card 4 - Atualização Contínua */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Atualização Contínua</h3>
            <p className="text-gray-600 text-sm">
              Mentorias mensais de dúvidas e tendências
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
