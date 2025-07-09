
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-calmon-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Pronto para começar sua jornada?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de profissionais que já transformaram suas carreiras conosco.
        </p>
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="bg-calmon-600 hover:bg-calmon-700 text-white px-8 py-3 text-lg"
        >
          Comece Agora
        </Button>
      </div>
    </section>
  );
}
