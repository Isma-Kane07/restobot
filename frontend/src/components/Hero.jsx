import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, TrendingUp, Star, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const stats = [
  { value: 5000, suffix: '+', label: 'commandes traitées' },
  { value: 98, suffix: '%', label: 'précision IA' },
  { value: 24, suffix: '/7', label: 'disponible' },
  { value: 15, suffix: ' min', label: 'installation' },
];

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

function AnimatedStat({ value, suffix, label, delay = 0 }) {
  const [start, setStart] = useState(false);
  const count = useCountUp(start ? value : 0, 2000);
  useEffect(() => { const t = setTimeout(() => setStart(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay / 1000 }}
      className="text-center"
    >
      <div className="text-2xl md:text-3xl font-black text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-500 text-xs md:text-sm mt-1">{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-dark">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-brand/5 rounded-full blur-[180px]" />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm"
            >
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
              </span>
              <span className="text-gray-300">Adopté par 50+ restaurants</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08]"
            >
              Pendant que vous<br />
              <span className="text-gradient">cuisinez, RestoBot</span><br />
              prend les commandes.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-lg leading-relaxed"
            >
              Le premier assistant WhatsApp intelligent qui comprend vos clients, gère les commandes et booste vos revenus.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="#cta" className="bg-brand text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/25 inline-flex items-center justify-center gap-2 group">
                <Sparkles size={20} />
                Essayer gratuitement
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#demo" className="glass-strong px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2">
                <Play size={20} />
                Voir la démo
              </a>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {stats.map((stat, i) => (
                <AnimatedStat key={i} {...stat} delay={i * 150} />
              ))}
            </div>
          </div>

          {/* Right - ChefBot + Phone */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* ChefBot Mascot */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-16 -right-8 z-20"
              >
                <img src="/chefbot.png" alt="ChefBot" className="w-28 h-28 drop-shadow-2xl" />
              </motion.div>

              {/* Glow */}
              <div className="absolute inset-0 bg-brand/20 blur-[80px] rounded-full" />

              {/* Phone */}
              <div className="relative w-72 h-[560px] bg-dark-card rounded-[2.5rem] border-4 border-dark-border shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
                
                <div className="bg-[#075E54] pt-10 pb-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center animate-pulse-glow">
                      <span className="text-white font-bold text-lg">🤖</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">RestoBot</div>
                      <div className="text-green-300 text-xs">en ligne</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E5DDD5] h-full p-3 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#DCF8C6] rounded-2xl rounded-br-none p-3 shadow text-sm text-gray-800 max-w-[80%]">
                      Salut, 2 brochettes et 3 Coca
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 }}
                    className="flex items-end gap-2"
                  >
                    <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">🤖</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none p-3 shadow text-sm text-gray-800 max-w-[80%]">
                      ✅ Commande comprise !<br />
                      2x Brochettes - 5000F<br />
                      3x Coca - 2250F<br />
                      <b>Total : 7250F</b>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4 }}
                    className="flex justify-center"
                  >
                    <div className="bg-dark-card text-white rounded-2xl p-3 shadow-lg text-xs max-w-[90%]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                          <TrendingUp size={12} className="text-white" />
                        </div>
                        <span>📊 Nouvelle commande sur le dashboard !</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll */}
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="text-gray-600" size={24} />
      </motion.div>
    </section>
  );
}