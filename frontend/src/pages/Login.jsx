import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, LogIn, ArrowLeft, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/admin';
            } else {
                setError(data.error || 'Identifiants invalides');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative glass-strong rounded-3xl p-8 md:p-10 w-full max-w-md border-white/10 glow-white"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        className="w-20 h-20 bg-gradient-to-br from-brand to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand/30 animate-pulse-glow"
                    >
                        <Bot className="text-white" size={36} />
                    </motion.div>
                    <h1 className="text-2xl font-bold">RestoBot</h1>
                    <p className="text-gray-400 mt-2">Connectez-vous à votre espace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600"
                                placeholder="admin@restobot.ml"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600 pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-brand-dark hover:to-orange-600 transition-all shadow-xl shadow-brand/25 hover:shadow-brand/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                        <ArrowLeft size={14} />
                        Retour au site
                    </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-xs">
                        Par défaut : admin@restobot.ml / admin123
                    </p>
                </div>
            </motion.div>
        </div>
    );
}