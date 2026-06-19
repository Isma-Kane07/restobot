import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Store, MoreHorizontal } from 'lucide-react';

const statsCards = [
  { icon: ShoppingCart, label: 'Commandes aujourd\'hui', value: '128', change: '+18%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: DollarSign, label: 'Revenu total', value: '245 000 F', change: '+22%', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: TrendingUp, label: 'Panier moyen', value: '6 300 F', change: '+5%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Store, label: 'Restaurants actifs', value: '9', change: 'actifs', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

const recentOrders = [
  { id: '#1045', client: '76 12 34 56', items: '2x Brochettes, 1x Coca', total: '6 250 F', status: 'new', time: '2 min' },
  { id: '#1044', client: '66 98 76 54', items: '1x Poulet braisé, Frites', total: '3 500 F', status: 'preparing', time: '8 min' },
  { id: '#1043', client: '70 11 22 33', items: '3x Riz gras, 2x Jus', total: '8 000 F', status: 'ready', time: '15 min' },
  { id: '#1042', client: '90 44 55 66', items: '2x Lasagnes, 1x Eau', total: '5 000 F', status: 'delivered', time: '25 min' },
];

export default function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-card/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Un <span className="text-gradient">dashboard</span> qui en dit long
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Toutes vos commandes, vos revenus, et vos statistiques en un coup d'œil.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 max-w-5xl mx-auto glow-white border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Aujourd'hui</h3>
              <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">En ligne</span>
              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <MoreHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={17} className={stat.color} />
                  </div>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs font-medium text-green-400">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Commandes récentes</h4>
              <button className="text-brand text-sm font-medium hover:text-brand-dark transition-colors">Voir tout →</button>
            </div>
            <div className="space-y-2">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-500">{order.id}</span>
                    <div>
                      <span className="text-sm font-medium">{order.client}</span>
                      <p className="text-xs text-gray-500">{order.items}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-semibold text-green-400">{order.total}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      order.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'preparing' ? 'bg-orange-500/20 text-orange-400' :
                      order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status === 'new' ? 'Nouvelle' :
                       order.status === 'preparing' ? 'En cours' :
                       order.status === 'ready' ? 'Prête' : 'Livrée'}
                    </span>
                    <span className="text-xs text-gray-600">{order.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}