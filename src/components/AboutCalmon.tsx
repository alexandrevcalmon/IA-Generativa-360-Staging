import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Zap, Users, Award, Star } from 'lucide-react';

const purposes = [
  {
    icon: Target,
    title: "Propósito",
    description: "Democratizar o acesso à Inteligência Artificial Generativa, transformando a forma como empresas e profissionais trabalham e inovam no Brasil.",
    gradient: "from-amber-500 to-yellow-600"
  },
  {
    icon: Heart,
    title: "Missão",
    description: "Capacitar organizações com soluções de IA generativa personalizadas, criando valor real e impulsionando a competitividade no mercado global.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: Award,
    title: "Valores",
    description: "Inovação constante, excelência técnica, transparência e compromisso com o sucesso dos nossos clientes e parceiros.",
    gradient: "from-emerald-500 to-teal-600"
  }
];

const founders = [
  {
    name: "Alexandre Calmon",
    role: "CEO & Fundador",
    description: "Cientista de dados, neurocientista, ex-consultor da Deloitte e mentor da ABStartups, com mais de 33 anos de carreira multifacetada e de impacto. Acumulou mais de 1.000 horas em mentorias, consultorias e palestras para empresas do calibre de Governo de Minas, FIEMG, FIESP, Sebrae, Ambev, FMU, ACIUB, entre outras.",
    gradient: "from-amber-500 to-yellow-600",
    image: "/alexandrecalmon.png"
  },
  {
    name: "Daniela Magno",
    role: "Terapeuta Especialista",
    description: "Mestra em saúde mental pela Universidade Federal de São Paulo, já realizou palestras de Saúde Mental para instituições como Força Aérea Brasileira, Sebrae, Sicoob, Faculdade Presbiteriana entre outras. Traz uma contribuição vital ao programa com palestras e direcionamentos sobre gestão emocional e bem-estar, oferecendo uma abordagem verdadeiramente 360º.",
    gradient: "from-purple-500 to-indigo-600",
    image: "/danielamagno.png"
  }
];

const AboutCalmon: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-50"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/20 to-yellow-600/20 backdrop-blur-sm border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Sobre Nós
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Sobre o{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Grupo Calmon
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Uma empresa brasileira especializada em Inteligência Artificial Generativa, 
            comprometida em democratizar o acesso à tecnologia mais avançada do mundo.
          </p>
        </motion.div>

        {/* Propósito, Missão e Valores */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {purposes.map((purpose, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${purpose.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-20`}></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-8 h-full hover:border-amber-400/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${purpose.gradient} rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <purpose.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">{purpose.title}</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  {purpose.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fundadores */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-12">
            Nossos{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Fundadores
            </span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${founder.gradient} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-20`}></div>
                <div className="relative bg-slate-800/80 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 hover:border-amber-400/50 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                  <div className={`flex items-center justify-center w-40 h-40 bg-gradient-to-br ${founder.gradient} rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden`}>
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">{founder.name}</h4>
                  <p className="text-amber-400 font-semibold mb-4">{founder.role}</p>
                  <p className="text-gray-300 leading-relaxed flex-1">
                    {founder.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCalmon; 
