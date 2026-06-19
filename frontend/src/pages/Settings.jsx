import { motion } from 'framer-motion';
import { Server, Database, Bot, Shield, Mail, Key } from 'lucide-react';

const settings = [
    { icon: Server, title: 'API', value: 'http://localhost:5000', status: 'online', color: 'green' },
    { icon: Database, title: 'Base de données', value: 'SQLite', status: 'connectée', color: 'green' },
    { icon: Bot, title: 'Bots WhatsApp', value: 'Gérés automatiquement', status: 'actifs', color: 'green' },
    { icon: Shield, title: 'Sécurité', value: 'JWT + bcrypt', status: 'activée', color: 'green' },
    { icon: Mail, title: 'Email admin', value: 'admin@restobot.ml', status: 'configuré', color: 'green' },
    { icon: Key, title: 'Clé Gemini', value: '••••••••••••••••', status: 'configurée', color: 'green' },
];

export default function Settings() {
    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-3xl font-bold">Paramètres</h2>
                <p className="text-gray-500 mt-1">Configuration du système</p>
            </div>

            <div className="glass rounded-2xl border border-white/5 divide-y divide-white/5">
                {settings.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/[0.03] rounded-2xl flex items-center justify-center">
                                <item.icon size={18} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.value}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20`}>
                            {item.status}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}