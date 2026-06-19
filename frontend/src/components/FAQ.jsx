import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Comment mes clients commandent-ils avec RestoBot ?',
    answer: 'Vos clients envoient simplement "Menu" sur votre numéro WhatsApp. Le bot répond automatiquement avec la photo de votre menu et la liste des plats. Ils écrivent leur commande en langage naturel : "2 brochettes, 1 coca" et l\'IA Gemini comprend tout instantanément.'
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer: 'Wave, Orange Money et Moov Money. Le bot envoie automatiquement les informations de paiement au client (numéro et nom du compte). Le client effectue le paiement et envoie une capture d\'écran. La commande est alors confirmée et apparaît sur votre dashboard.'
  },
  {
    question: 'Puis-je gérer plusieurs restaurants ?',
    answer: 'Absolument ! RestoBot est conçu pour le multi-restaurants. Gérez tous vos établissements depuis un seul tableau de bord. Chaque restaurant a son propre bot WhatsApp, son propre menu avec photos, et ses propres statistiques.'
  },
  {
    question: 'Que se passe-t-il si le bot ne comprend pas une commande ?',
    answer: 'Notre IA (Google Gemini) est entraînée pour comprendre le français naturel et les expressions maliennes. Avec un taux de précision de 98%, les erreurs sont rares. Si le bot ne comprend vraiment pas, il demande poliment au client de reformuler. Aucune commande n\'est perdue.'
  },
  {
    question: 'Combien de temps prend l\'installation ?',
    answer: 'L\'installation complète prend 15 minutes. Nous configurons votre bot WhatsApp, intégrons votre menu avec photos, et vous formons à l\'utilisation du dashboard. Il vous suffit d\'avoir un numéro WhatsApp dédié pour votre restaurant.'
  },
  {
    question: 'Y a-t-il un engagement de durée ?',
    answer: 'Aucun engagement. Vous payez les frais d\'installation une fois (25 000 FCFA) puis un abonnement mensuel de 20 000 FCFA. Pour votre premier mois, profitez d\'une réduction à 15 000 FCFA. Vous pouvez résilier à tout moment, sans frais. Le premier mois est remboursé si vous n\'êtes pas satisfait.'
  },
  {
    question: 'Mes données sont-elles en sécurité ?',
    answer: 'Oui. Toutes les données sont stockées localement dans une base de données sécurisée. Les conversations WhatsApp restent privées. Nous ne partageons jamais vos données clients. Votre dashboard est protégé par authentification.'
  },
  {
    question: 'Puis-je personnaliser les messages du bot ?',
    answer: 'Oui ! Vous pouvez personnaliser le message de bienvenue, les photos du menu, les informations de paiement, les horaires, la zone de livraison, et les frais de livraison. Tout est modifiable depuis votre dashboard en quelques clics.'
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium">
            <HelpCircle size={16} />
            Questions fréquentes
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-6 mb-6">
            Vous avez des <span className="text-gradient">questions</span> ?
          </h2>
          <p className="text-gray-400">
            Tout ce que vous devez savoir sur RestoBot.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden border border-transparent hover:border-white/5 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    openIndex === i ? 'bg-brand/20 text-brand' : 'text-gray-500'
                  }`}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10 p-6 glass rounded-2xl"
        >
          <p className="text-gray-400 mb-3">Vous ne trouvez pas votre réponse ?</p>
          <a href="https://wa.me/22300000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors">
            <MessageCircle size={18} />
            Posez votre question sur WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}