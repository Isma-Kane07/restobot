import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const links = [
  { name: 'Fonctionnalités', href: '#features' },
  { name: 'Démo', href: '#demo' },
  { name: 'Dashboard', href: '#dashboard-preview' },
  { name: 'Tarifs', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <img src="/logo-white.png" alt="RestoBot" className="h-9 w-auto" />
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium px-4 py-2"
          >
            Connexion
          </Link>
          <a
            href="#cta"
            className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand/25 hover:shadow-brand/40 flex items-center gap-2"
          >
            <Sparkles size={14} />
            Essayer gratuitement
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-strong border-t border-white/5"
          >
            <div className="px-6 py-4 space-y-2">
              {links.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-white py-2.5 text-sm font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <Link
                  to="/login"
                  className="flex-1 text-center border border-white/10 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
                <a
                  href="#cta"
                  className="flex-1 text-center bg-brand rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-dark transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Essayer
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}