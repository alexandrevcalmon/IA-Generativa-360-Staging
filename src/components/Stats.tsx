import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';

const stats = [
  { 
    number: 1000, 
    suffix: "+", 
    label: "de colaboradores capacitados",
    icon: Users,
    color: "from-blue-500 to-cyan-600"
  },
  { 
    number: 300, 
    suffix: "+", 
    label: "empresas atendidas",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600"
  },
  { 
    number: 1000, 
    suffix: "hs+", 
    label: "de mentorias especializadas",
    icon: Clock,
    color: "from-purple-500 to-indigo-600"
  },
  { 
    number: 95, 
    suffix: "%", 
    label: "de satisfação",
    icon: Star,
    color: "from-amber-500 to-yellow-600"
  }
];

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        setCount(Math.floor(progress * value));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
      {count}{suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-30"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            Números que{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Inspiram
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Resultados reais que demonstram o impacto transformador do nosso programa
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-20`}></div>
              
              {/* Card Content */}
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover:border-amber-500/30 transition-all duration-300 hover:transform hover:scale-105">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                
                {/* Number */}
                <div className="text-white mb-2 sm:mb-4">
                  <AnimatedCounter value={stat.number} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <div className="text-gray-300 text-sm sm:text-base lg:text-lg font-medium">
                  {stat.label}
                </div>
                
                {/* Hover Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl sm:rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
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
          className="text-center mt-8 sm:mt-12 lg:mt-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/20 to-yellow-600/20 backdrop-blur-sm border border-amber-500/30 rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 sm:mr-3" />
            <span className="text-amber-300 font-semibold text-xs sm:text-sm lg:text-base">
              Junte-se aos milhares de profissionais que já transformaram suas carreiras
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
