import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Sparkles, Star } from 'lucide-react';

export default function CTAFinal() {
  return (
    <section id="cta" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-dark to-orange-700" />
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px] opacity-20" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-[120px] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-[150px] opacity-10" />

      {/* ChefBot */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-10 bottom-10 hidden lg:block"
      >
        <img src="/chefbot.png" alt="ChefBot" className="w-40 h-40 drop-shadow-2xl opacity-80" />
      </motion.div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles size={16} />
            Prêt à transformer votre restaurant ?
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
        >
          Prêt à gagner plus de<br />
          commandes dès aujourd'hui ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Rejoignez les restaurants maliens qui ont déjà digitalisé leurs commandes. 
          <br />
          <span className="font-semibold text-white">Premier mois à 15 000 FCFA seulement.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="https://wa.me/22300000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-dark px-8 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center justify-center gap-2 group"
          >
            <MessageCircle size={22} className="text-green-500" />
            Parler sur WhatsApp
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="mailto:contact@restobot.ml"
            className="bg-white/10 backdrop-blur text-white border-2 border-white/30 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all inline-flex items-center justify-center gap-2"
          >
            <Sparkles size={22} />
            Demander une démo
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/60 text-sm"
        >
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" /> 98% de satisfaction
          </span>
          <span>•</span>
          <span>🔒 Paiement sécurisé</span>
          <span>•</span>
          <span>🇲🇱 Support au Mali</span>
          <span>•</span>
          <span>⏱️ Installation en 15 min</span>
        </motion.div>
      </div>
    </section>
  );
}