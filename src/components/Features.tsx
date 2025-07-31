
import { Zap, Heart, TrendingUp, Sparkles, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Zap,
    title: "Mais Tempo para Criatividade",
    description: "Imagine suas equipes dedicando mais tempo à criatividade e estratégia, liberadas das amarras de tarefas operacionais repetitivas.",
    gradient: "from-amber-500 to-yellow-600",
    bgGradient: "from-amber-500/10 to-yellow-600/10"
  },
  {
    icon: Heart,
    title: "Produtividade e Bem-estar",
    description: "Visualize um ambiente onde a produtividade floresce lado a lado com o bem-estar, graças à expertise em saúde mental integrada.",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-500/10 to-rose-600/10"
  },
  {
    icon: TrendingUp,
    title: "Decisões Mais Rápidas",
    description: "Com a IA Generativa, suas decisões se tornarão mais rápidas e embasadas, amplificando a criatividade em todas as áreas.",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10"
  },
  {
    icon: Sparkles,
    title: "Inovação Constante",
    description: "Mantenha-se à frente da concorrência com acesso às tecnologias mais avançadas e metodologias inovadoras de IA.",
    gradient: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-500/10 to-indigo-600/10"
  },
  {
    icon: Users,
    title: "Equipe Capacitada",
    description: "Transforme sua equipe em especialistas em IA, prontos para enfrentar os desafios do futuro digital.",
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-600/10"
  },
  {
    icon: Target,
    title: "Resultados Mensuráveis",
    description: "Acompanhe o ROI real do seu investimento com métricas claras e resultados tangíveis em todas as áreas.",
    gradient: "from-orange-500 to-red-600",
    bgGradient: "from-orange-500/10 to-red-600/10"
  }
];

export function Features() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/40 to-purple-300/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-200/40 to-teal-300/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Benefícios Exclusivos
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Liberte o{' '}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Potencial Máximo
            </span>
            <br />da Sua Equipe
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Ao investir no Programa IA Generativa 360°, sua empresa adquire um arsenal de 
            <span className="text-amber-600 font-semibold"> vantagens competitivas </span>
            que se traduzem em resultados tangíveis.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100`}></div>
              
              {/* Card Content */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 h-full hover:border-amber-300/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-2xl">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
                
                {/* Hover Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-2xl px-8 py-4">
            <Target className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-amber-700 font-semibold">
              Transforme sua empresa hoje mesmo
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
