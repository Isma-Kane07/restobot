import { motion } from 'framer-motion';
import { Brain, CreditCard, BarChart3, MessageCircle, Image, Store, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'IA Ultra-Intelligente',
    description: 'Comprend "2 poulets sans piment" naturellement. Votre client écrit comme il parle, l\'IA comprend tout.',
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconGradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: CreditCard,
    title: 'Paiement Mobile Intégré',
    description: 'Wave, Orange Money, Moov Money. Vos clients paient avec leurs moyens habituels, capture d\'écran à l\'appui.',
    gradient: 'from-green-500/20 to-emerald-600/20',
    iconGradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Dashboard en Temps Réel',
    description: 'Commandes, revenus, tendances. Tout sur un seul écran. Aussi beau que votre cuisine est bonne.',
    gradient: 'from-blue-500/20 to-cyan-600/20',
    iconGradient: 'from-blue-500 to-cyan-600',
  },
  {
    icon: MessageCircle,
    title: '100% WhatsApp Natif',
    description: 'Zéro application à télécharger. Vos clients commandent depuis l\'app qu\'ils utilisent déjà chaque jour.',
    gradient: 'from-green-600/20 to-green-700/20',
    iconGradient: 'from-green-600 to-green-700',
  },
  {
    icon: Image,
    title: 'Photos du Menu',
    description: 'Ajoutez jusqu\'à 5 photos. Le bot les envoie automatiquement. Mettez en valeur vos meilleurs plats.',
    gradient: 'from-orange-500/20 to-red-600/20',
    iconGradient: 'from-orange-500 to-red-600',
  },
  {
    icon: Store,
    title: 'Multi-Restaurants',
    description: 'Gérez tous vos établissements depuis un seul dashboard. Parfait pour les chaînes et groupes.',
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconGradient: 'from-pink-500 to-rose-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-card/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-brand font-semibold text-sm uppercase tracking-widest">Fonctionnalités</span>
          <h2 className="text-4xl md:text-6xl font-black mt-4 mb-6">
            Tout ce dont votre<br />
            <span className="text-gradient">restaurant a besoin</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            RestoBot gère tout, de la prise de commande au paiement. Vous vous concentrez sur l'essentiel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative glass rounded-3xl p-8 overflow-hidden group cursor-default transition-all duration-300 hover:border-white/10`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="text-white" size={26} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}