import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { Search, Filter, ChevronDown } from 'lucide-react';

export default function Orders() {
    const { request } = useApi();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { loadOrders(); }, [filter]);

    async function loadOrders() {
        const data = await request(`/orders?status=${filter}&limit=100`);
        if (data) setOrders(data.orders || []);
    }

    async function updateStatus(id, status) {
        await request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
        loadOrders();
    }

    const filteredOrders = search
        ? orders.filter(o => o.customer_phone.includes(search) || String(o.id).includes(search))
        : orders;

    const statusFilters = [
        { value: 'all', label: 'Toutes', color: 'bg-white/5' },
        { value: 'new', label: '🆕 Nouvelles', color: 'bg-blue-500/10' },
        { value: 'preparing', label: '👨‍🍳 En cours', color: 'bg-orange-500/10' },
        { value: 'ready', label: '📦 Prêtes', color: 'bg-green-500/10' },
        { value: 'delivered', label: '✅ Livrées', color: 'bg-green-600/10' },
        { value: 'cancelled', label: '❌ Annulées', color: 'bg-red-500/10' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold">Commandes</h2>
                <p className="text-gray-500 mt-1">Suivez toutes les commandes en temps réel</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Rechercher par n° ou téléphone..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none text-white placeholder-gray-600" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statusFilters.map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filter === f.value
                                    ? 'bg-brand/20 text-brand border border-brand/30'
                                    : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:bg-white/[0.05]'
                            }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-white/5">
                                <th className="p-4 font-medium">N°</th>
                                <th className="p-4 font-medium">Client</th>
                                <th className="p-4 font-medium">Articles</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Mode</th>
                                <th className="p-4 font-medium">Statut</th>
                                <th className="p-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o, i) => (
                                <motion.tr key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono text-sm">#{o.id}</td>
                                    <td className="p-4 text-gray-400 text-sm">{o.customer_phone}</td>
                                    <td className="p-4 text-sm">{o.items?.length || 0} art.</td>
                                    <td className="p-4 font-semibold text-green-400 text-sm">{o.total?.toLocaleString()} F</td>
                                    <td className="p-4 text-lg">{o.service_mode === 'delivery' ? '🛵' : o.service_mode === 'takeaway' ? '🛍️' : '🍽️'}</td>
                                    <td className="p-4">
                                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                                            className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-brand focus:outline-none cursor-pointer">
                                            <option value="new" className="bg-dark">Nouvelle</option>
                                            <option value="confirmed" className="bg-dark">Confirmée</option>
                                            <option value="preparing" className="bg-dark">En préparation</option>
                                            <option value="ready" className="bg-dark">Prête</option>
                                            <option value="delivered" className="bg-dark">Livrée</option>
                                            <option value="cancelled" className="bg-dark">Annulée</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-gray-600 text-xs">{new Date(o.created_at).toLocaleString('fr-FR')}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <p className="text-center text-gray-600 py-12">Aucune commande trouvée</p>
                )}
            </div>
        </div>
    );
}