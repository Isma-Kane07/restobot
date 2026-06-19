import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { 
    Store, ShoppingCart, DollarSign, TrendingUp, 
    Package, Clock, CheckCircle, ChefHat, Truck,
    ArrowUp, ArrowDown, MoreHorizontal
} from 'lucide-react';

export default function Dashboard() {
    const { request } = useApi();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 15000);
        return () => clearInterval(interval);
    }, []);

    async function loadStats() {
        const data = await request('/dashboard/global');
        if (data) setStats(data);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        { icon: Store, label: 'Restaurants', value: stats.totalRestaurants, sub: `${stats.activeRestaurants || 0} actifs`, color: 'orange' },
        { icon: ShoppingCart, label: 'Commandes totales', value: stats.totalOrders, sub: `${stats.todayOrders || 0} aujourd'hui`, color: 'blue' },
        { icon: DollarSign, label: 'Revenus', value: `${(stats.totalRevenue || 0).toLocaleString()} F`, sub: `${(stats.todayRevenue || 0).toLocaleString()} F auj.`, color: 'green' },
        { icon: TrendingUp, label: 'Ce mois', value: `${(stats.monthRevenue || 0).toLocaleString()} F`, sub: `${stats.monthOrders || 0} commandes`, color: 'purple' },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            <div>
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-${card.color}-500/10 rounded-2xl flex items-center justify-center`}>
                                <card.icon className={`text-${card.color}-400`} size={22} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{card.label}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Dernières commandes */}
            <div className="glass rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">📋 Dernières commandes</h3>
                    <span className="text-sm text-gray-500">
                        {stats.newOrders || 0} nouvelle(s)
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-white/5">
                                <th className="pb-3 font-medium">N°</th>
                                <th className="pb-3 font-medium">Client</th>
                                <th className="pb-3 font-medium">Articles</th>
                                <th className="pb-3 font-medium">Total</th>
                                <th className="pb-3 font-medium">Mode</th>
                                <th className="pb-3 font-medium">Statut</th>
                                <th className="pb-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentOrders || []).slice(0, 8).map(order => (
                                <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 font-mono text-sm">#{order.id}</td>
                                    <td className="py-3 text-gray-400 text-sm">{order.customer_phone}</td>
                                    <td className="py-3 text-sm">{order.items?.length || 0} art.</td>
                                    <td className="py-3 font-semibold text-green-400 text-sm">{order.total?.toLocaleString()} F</td>
                                    <td className="py-3 text-lg">
                                        {order.service_mode === 'delivery' ? '🛵' : order.service_mode === 'takeaway' ? '🛍️' : '🍽️'}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                            order.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>{order.status}</span>
                                    </td>
                                    <td className="py-3 text-gray-600 text-xs">
                                        {new Date(order.created_at).toLocaleString('fr-FR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                        <p className="text-center text-gray-600 py-8">Aucune commande pour le moment</p>
                    )}
                </div>
            </div>
        </div>
    );
}