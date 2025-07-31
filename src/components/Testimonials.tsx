import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      stars: 5,
      quote: "A palestra sensibilizou nossos colaboradores sobre a importância da IA. Semanas depois, a equipe já buscava ferramentas para melhorar resultados.",
      name: "Lucas",
      role: "Coordenador de Marketing",
      company: "ACIUB - Associação Comercial e Industrial de Uberlândia-MG"
    },
    {
      stars: 5,
      quote: "Capacitação e consultoria elevaram drasticamente nossa produtividade. Entregamos soluções mais eficientes e personalizadas.",
      name: "Leonardo Barbosa",
      role: "",
      company: "Invest Minas - Governo de Minas Gerais"
    },
    {
      stars: 5,
      quote: "Didática incrível e consultoria sob medida resolveram nossas maiores dores; investimento mais que válido.",
      name: "Paulo Henrique",
      role: "CEO",
      company: "Empresa LoCX"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Veja o Que Dizem Aqueles Que Já Vivenciaram a Transformação
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Estrelas */}
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Citação */}
              <blockquote className="text-gray-700 italic text-center mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Nome e Cargo/Empresa */}
              <div className="text-center">
                <p className="font-bold text-gray-900">
                  {testimonial.name}
                  {testimonial.role && `, ${testimonial.role}`}
                </p>
                <p className="text-gray-600 text-sm">
                  {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
