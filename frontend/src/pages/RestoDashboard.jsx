import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, DollarSign, TrendingUp, Clock, Lock, LogOut } from 'lucide-react';

export default function RestoDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`/api/dashboard/restaurant/${id}?password=${encodeURIComponent(password)}`);
            const json = await res.json();
            
            if (res.ok) {
                setData(json);
                // Sauvegarde le mot de passe en session
                sessionStorage.setItem(`resto_${id}_auth`, password);
            } else {
                setError(json.error || 'Mot de passe incorrect');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        sessionStorage.removeItem(`resto_${id}_auth`);
        setData(null);
        setPassword('');
    }

    // Auto-login si déjà connecté
    useState(() => {
        const savedPassword = sessionStorage.getItem(`resto_${id}_auth`);
        if (savedPassword) {
            setPassword(savedPassword);
            // Re-login automatique
            fetch(`/api/dashboard/restaurant/${id}?password=${encodeURIComponent(savedPassword)}`)
                .then(r => r.json())
                .then(json => {
                    if (json.restaurant) setData(json);
                    else sessionStorage.removeItem(`resto_${id}_auth`);
                })
                .catch(() => {});
        }
    }, []);

    // Refresh toutes les 30 secondes
    useState(() => {
        if (!data) return;
        const interval = setInterval(async () => {
            const savedPassword = sessionStorage.getItem(`resto_${id}_auth`);
            if (savedPassword) {
                const res = await fetch(`/api/dashboard/restaurant/${id}?password=${encodeURIComponent(savedPassword)}`);
                const json = await res.json();
                if (json.restaurant) setData(json);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [data]);

    if (!data) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-8 w-full max-w-md border-white/10"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/20">
                            <Store size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Dashboard Restaurant</h1>
                        <p className="text-gray-500 mt-2">Connectez-vous avec votre mot de passe</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Mot de passe</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Entrez votre mot de passe"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none text-white placeholder-gray-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-brand to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-brand-dark transition-all shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Accéder au dashboard'
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{data.restaurant.name}</h1>
                        <p className="text-gray-500 mt-1 text-sm">Dashboard en temps réel</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium ${
                            data.restaurant.bot_status === 'online' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                            {data.restaurant.bot_status === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-red-500/20"
                        >
                            <LogOut size={14} />
                            Déconnexion
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { icon: ShoppingCart, label: 'Aujourd\'hui', value: data.stats.today, color: 'blue' },
                        { icon: DollarSign, label: 'Revenu jour', value: `${(data.stats.todayRevenue || 0).toLocaleString()} F`, color: 'green' },
                        { icon: TrendingUp, label: 'Revenu total', value: `${(data.stats.revenue || 0).toLocaleString()} F`, color: 'purple' },
                        { icon: Clock, label: 'En attente', value: data.stats.new, color: 'orange' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl p-4 md:p-5 border border-white/5"
                        >
                            <div className={`w-9 h-9 md:w-10 md:h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center mb-3`}>
                                <stat.icon size={16} className={`text-${stat.color}-400`} />
                            </div>
                            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                            <p className="text-gray-500 text-xs md:text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Commandes récentes */}
                <div className="glass rounded-2xl p-4 md:p-6 border border-white/5">
                    <h3 className="font-bold text-lg mb-4">📋 Commandes récentes</h3>
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <table className="w-full text-xs md:text-sm">
                            <thead>
                                <tr className="text-gray-500 border-b border-white/5">
                                    <th className="p-2 md:p-3 text-left font-medium">N°</th>
                                    <th className="p-2 md:p-3 text-left font-medium">Client</th>
                                    <th className="p-2 md:p-3 text-left font-medium hidden md:table-cell">Articles</th>
                                    <th className="p-2 md:p-3 text-left font-medium">Total</th>
                                    <th className="p-2 md:p-3 text-left font-medium">Mode</th>
                                    <th className="p-2 md:p-3 text-left font-medium">Statut</th>
                                    <th className="p-2 md:p-3 text-left font-medium hidden md:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.orders || []).map(o => (
                                    <tr key={o.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                                        <td className="p-2 md:p-3 font-mono">#{o.id}</td>
                                        <td className="p-2 md:p-3 text-gray-400">{o.customer_phone}</td>
                                        <td className="p-2 md:p-3 hidden md:table-cell">{o.items?.length || 0} art.</td>
                                        <td className="p-2 md:p-3 text-green-400 font-semibold">{o.total?.toLocaleString()} F</td>
                                        <td className="p-2 md:p-3 text-base md:text-lg">
                                            {o.service_mode === 'delivery' ? '🛵' : o.service_mode === 'takeaway' ? '🛍️' : '🍽️'}
                                        </td>
                                        <td className="p-2 md:p-3">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                o.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                o.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>{o.status}</span>
                                        </td>
                                        <td className="p-2 md:p-3 text-gray-600 text-xs hidden md:table-cell">
                                            {new Date(o.created_at).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(data.orders || []).length === 0 && (
                            <p className="text-center text-gray-600 py-8">Aucune commande pour le moment</p>
                        )}
                    </div>
                </div>

                {/* Abonnement */}
                {data.restaurant.subscription_end && (
                    <div className="glass rounded-2xl p-4 md:p-5 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Abonnement</p>
                                <p className="font-medium text-sm md:text-base">
                                    {data.restaurant.subscription_plan === 'yearly' ? 'Annuel' : 'Mensuel'}
                                    {' • '}Expire le {new Date(data.restaurant.subscription_end).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}