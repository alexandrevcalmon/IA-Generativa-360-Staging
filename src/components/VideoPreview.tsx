import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export function VideoPreview() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-yellow-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-300/30 rounded-full blur-3xl"></div>
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
            <Play className="w-4 h-4 mr-2" />
            Aula de Apresentação
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Conheça o{' '}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Programa IA Generativa 360°
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Assista à primeira aula e descubra como transformaremos sua empresa com Inteligência Artificial Generativa
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Video Frame */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe 
                  src="https://iframe.mediadelivery.net/embed/470362/e2b09739-e1c2-40cf-abf5-1607502619a9?autoplay=false&loop=false&muted=false&preload=true&responsive=true" 
                  loading="lazy" 
                  style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }} 
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" 
                  allowFullScreen={true}
                  title="Aula de Apresentação - Programa IA Generativa 360°"
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-2xl px-8 py-4">
            <Sparkles className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-amber-700 font-semibold text-lg">
              Gostou do que viu? Junte-se a milhares de profissionais que já transformaram suas carreiras
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 