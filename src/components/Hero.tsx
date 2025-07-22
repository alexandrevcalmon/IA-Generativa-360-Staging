
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function Hero() {
  const scrollToPlans = () => {
    const ctaSection = document.getElementById('plans-section');
    if (ctaSection) {
      ctaSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/calmonedaniela.jpg)' }}
      ></div>
      
      {/* Overlay Gradient for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        <div className="text-center">
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center bg-gradient-to-r from-amber-500/20 to-yellow-600/20 backdrop-blur-sm border border-amber-500/30 text-amber-300 px-6 py-3 rounded-full text-sm font-medium mb-24 hover:scale-105 transition-transform duration-300"
          >
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"></div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent font-semibold">
              A Revolução da IA Começa Agora!
            </span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight mt-12"
          >
            <span className="text-white">Programa IA Generativa</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              360°
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Transforme sua empresa para o futuro com o programa mais completo de 
            <span className="text-amber-400 font-semibold"> capacitação em Inteligência Artificial Generativa </span>
            do Brasil.
          </motion.p>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center items-center"
          >
            <Button 
              onClick={scrollToPlans}
              size="lg"
              className="group relative bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Comece Agora</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
