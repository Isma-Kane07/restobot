import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const messages = [
  { from: 'client', text: 'Menu', delay: 0.5 },
  { from: 'bot', text: '👋 Bienvenue chez Chez Awa !\n\n📋 Voici notre menu du jour 🍽️', delay: 1 },
  { from: 'client', text: 'Je prends 2 brochettes et 3 cocas', delay: 1.5 },
  { from: 'bot', text: '✅ J\'ai noté :\n• 2x Brochettes - 5000F\n• 3x Coca - 2250F\n💰 Total : 7250F\n\nAutre chose ?', delay: 2 },
  { from: 'client', text: 'Non c\'est tout', delay: 2.5 },
  { from: 'bot', text: '🚀 Mode de service ?\n1️⃣ Livraison\n2️⃣ À emporter\n3️⃣ Sur place', delay: 3 },
  { from: 'client', text: '1', delay: 3.5 },
  { from: 'bot', text: '📍 Adresse de livraison ?', delay: 4 },
  { from: 'client', text: 'Hippodrome rue 100', delay: 4.5 },
  { from: 'bot', text: '💳 PAIEMENT\n🟠 Wave: 76 01 02 03\n📸 Envoyez la capture', delay: 5 },
  { from: 'client', text: '📸 [Capture envoyée]', delay: 5.5 },
  { from: 'bot', text: '🎉 COMMANDE #1042 CONFIRMÉE !\n✅ Paiement reçu : 7250F\n🛵 Livraison dans 45 min', delay: 6 },
];

const steps = [
  { emoji: '📱', title: 'Client envoie "Menu"', desc: 'Simple comme un message WhatsApp' },
  { emoji: '🤖', title: 'Bot répond avec le menu', desc: 'Photos + liste des plats automatiquement' },
  { emoji: '💬', title: 'Commande en langage naturel', desc: '"2 brochettes, 1 coca" suffit' },
  { emoji: '💳', title: 'Paiement mobile sécurisé', desc: 'Wave, Orange Money, Moov Money' },
  { emoji: '✅', title: 'Commande confirmée', desc: 'Le resto reçoit tout sur son dashboard' },
];

export default function Demo() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [started, setStarted] = useState(false);

  const startDemo = () => {
    setStarted(true);
    messages.forEach((_, i) => {
      setTimeout(() => setVisibleMessages(i + 1), messages[i].delay * 1000);
    });
  };

  return (
    <section id="demo" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-card/50 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[150px]" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles size={16} />
            Démonstration interactive
          </span>
          <h2 className="text-4xl md:text-6xl font-black mt-6 mb-6">
            Voyez <span className="text-gradient">RestoBot en action</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Une vraie conversation WhatsApp. Le client commande, le bot répond, la commande est confirmée.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/10 blur-[60px] rounded-full" />
              <div className="relative w-72 h-[540px] bg-dark-card rounded-[2.5rem] border-4 border-dark-border shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
                <div className="bg-[#075E54] pt-10 pb-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
                      <span className="text-white">🤖</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">RestoBot</div>
                      <div className="text-green-300 text-xs">en ligne</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E5DDD5] h-full p-3 space-y-2 overflow-y-auto">
                  {messages.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.from === 'bot' && (
                        <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mr-1 mt-1">
                          <span className="text-white text-[10px]">🤖</span>
                        </div>
                      )}
                      <div className={`rounded-2xl p-3 shadow text-xs max-w-[85%] whitespace-pre-line ${
                        msg.from === 'client'
                          ? 'bg-[#DCF8C6] rounded-br-none text-gray-800'
                          : 'bg-white rounded-bl-none text-gray-800'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {!started && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
                      <button
                        onClick={startDemo}
                        className="bg-brand text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-2xl animate-pulse"
                      >
                        ▶ Lancer la démo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-8">Comment ça marche</h3>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 group-hover:bg-brand/20 transition-all">
                  {step.emoji}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{step.title}</h4>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}