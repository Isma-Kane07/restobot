import { motion } from 'framer-motion';
import { X, Check, Phone, FileText, AlertTriangle, MessageCircle, Bot, BarChart3, ChefHat, ArrowRight } from 'lucide-react';

const beforeItems = [
  { icon: Phone, text: 'Téléphone qui sonne sans arrêt', desc: 'Vous passez votre temps au téléphone au lieu de cuisiner' },
  { icon: FileText, text: 'Commandes sur papier', desc: 'Illisibles, perdues, mélangées dans le rush' },
  { icon: AlertTriangle, text: 'Erreurs de commande', desc: '"J\'avais dit sans piment !" = clients frustrés' },
  { icon: X, text: 'Commandes oubliées', desc: 'Chaque commande perdue = un client perdu = de l\'argent perdu' },
];

const afterItems = [
  { icon: MessageCircle, text: 'WhatsApp natif', desc: 'L\'application que vos clients utilisent déjà chaque jour' },
  { icon: Bot, text: 'Bot 24h/24, 7j/7', desc: 'Ne dort jamais, ne tombe jamais malade, ne fait jamais d\'erreur' },
  { icon: BarChart3, text: 'Dashboard intelligent', desc: 'Toutes vos commandes, revenus, stats en un clin d\'œil' },
  { icon: ChefHat, text: 'Vous cuisinez', desc: 'Le bot gère les commandes, vous faites ce que vous aimez' },
];

export default function WhyChoose() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-brand font-semibold text-sm uppercase tracking-widest">Pourquoi changer</span>
          <h2 className="text-4xl md:text-6xl font-black mt-4 mb-6">
            Avant / Après <span className="text-gradient">RestoBot</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Le passage au digital transforme complètement la gestion de votre restaurant.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 border-red-500/10 hover:border-red-500/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <X className="text-red-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-red-400">Avant RestoBot</h3>
            </div>
            <div className="space-y-5">
              {beforeItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon size={18} className="text-red-400/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-300 font-medium">{item.text}</span>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 border-green-500/10 hover:border-green-500/20 transition-all glow-green"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <Check className="text-green-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-green-400">Avec RestoBot</h3>
            </div>
            <div className="space-y-5">
              {afterItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{item.text}</span>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="#cta" className="inline-flex items-center gap-2 text-brand hover:text-brand-dark font-semibold transition-colors">
            Prêt à passer au digital ? <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}