
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-calmon-50 to-calmon-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu
            <span className="text-calmon-600"> desenvolvimento</span> profissional
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Acesse cursos, trilhas de aprendizado e desenvolva suas habilidades com a melhor plataforma educacional corporativa do Brasil.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-calmon-600 hover:bg-calmon-700 text-white px-8 py-3 text-lg"
          >
            Comece Agora
          </Button>
        </div>
      </div>
    </section>
  );
}
