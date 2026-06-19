import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Produit: [
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'Démo', href: '#demo' },
    { name: 'Dashboard', href: '#dashboard-preview' },
    { name: 'Tarifs', href: '#pricing' },
  ],
  Ressources: [
    { name: 'FAQ', href: '#faq' },
    { name: 'Documentation', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'API', href: '#' },
  ],
  Entreprise: [
    { name: 'À propos', href: '#' },
    { name: 'Contact', href: '#cta' },
    { name: 'Devenir partenaire', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5 bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src="/logo-white.png" alt="RestoBot" className="h-8 w-auto" />
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
              Le premier assistant WhatsApp intelligent pour restaurants, fast-foods et maquis au Mali. Boostez vos commandes sans effort.
            </p>
            <div className="space-y-2 text-sm">
              <a href="https://wa.me/22300000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a href="mailto:contact@restobot.ml" className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors">
                <Mail size={16} />
                contact@restobot.ml
              </a>
              <span className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                Bamako, Mali 🇲🇱
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-5 text-gray-300">{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-500 text-sm hover:text-white transition-colors flex items-center gap-1 group">
                      {link.name}
                      {link.href.startsWith('http') && (
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} RestoBot. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">Confidentialité</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 transition-colors">Conditions</a>
            <span className="text-gray-600">Fierté malienne 🇲🇱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}