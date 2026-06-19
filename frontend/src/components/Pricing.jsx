import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ArrowRight, BadgePercent } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-dark-card/30" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-brand font-semibold text-sm uppercase tracking-widest">Tarifs</span>
          <h2 className="text-4xl md:text-6xl font-black mt-4 mb-6">
            Simple, <span className="text-gradient">transparent</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pas de frais cachés. Commencez quand vous voulez, arrêtez quand vous voulez.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto">
          {/* Carte Installation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center">
                <Zap className="text-brand" size={24} />
              </div>
              <h3 className="text-xl font-bold">Installation unique</h3>
            </div>
            <div className="text-5xl font-black mb-2">25 000 <span className="text-lg text-gray-400 font-normal">FCFA</span></div>
            <p className="text-gray-400 mb-6">Paiement une seule fois</p>
            <div className="text-left space-y-3 mb-0">
              {['Configuration du bot WhatsApp', 'Intégration de votre menu', 'Dashboard personnalisé', 'Formation de 30 minutes', 'Support prioritaire'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Carte Abonnement */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative glass rounded-3xl p-8 text-center border-brand/50 glow-orange overflow-hidden"
          >
            {/* Badge promo */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-brand to-orange-500 text-white px-6 py-2 rounded-bl-2xl text-sm font-bold flex items-center gap-1">
              <BadgePercent size={16} />
              1er mois à -25%
            </div>

            <div className="flex items-center justify-center gap-3 mb-4 mt-4">
              <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Sparkles className="text-brand" size={24} />
              </div>
              <h3 className="text-xl font-bold">Abonnement mensuel</h3>
            </div>

            {/* Prix barré */}
            <div className="text-gray-500 line-through text-lg mb-1">20 000 FCFA</div>
            
            {/* Prix promo */}
            <div className="text-5xl font-black mb-1">
              <span className="text-gradient">15 000</span>
              <span className="text-lg text-gray-400 font-normal"> FCFA</span>
            </div>
            <p className="text-brand font-semibold text-sm mb-2">le premier mois</p>
            <p className="text-gray-500 text-sm mb-6">puis 20 000 FCFA/mois</p>

            <div className="text-left space-y-3 mb-8">
              {[
                'Bot WhatsApp illimité 24h/24',
                'Commandes illimitées',
                'IA de compréhension naturelle',
                'Jusqu\'à 5 photos du menu',
                'Paiement Wave & Orange Money',
                'Dashboard temps réel',
                'Multi-restaurants',
                'Mises à jour gratuites',
                'Satisfait ou remboursé 30j',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <a
              href="#cta"
              className="block bg-brand hover:bg-brand-dark text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand/25 hover:shadow-brand/40 flex items-center justify-center gap-2 group"
            >
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-gray-600 text-xs mt-4">
              📌 Sans engagement. Arrêtez quand vous voulez.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}