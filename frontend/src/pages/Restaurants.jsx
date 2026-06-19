import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { 
    Plus, Store, Edit, Power, PowerOff, Trash2, 
    Phone, MapPin, X, Search, Wallet, QrCode,
    Calendar, Clock, ExternalLink, Copy, Check,
    CreditCard, Truck, MapPinHouse
} from 'lucide-react';

export default function Restaurants() {
    const { request } = useApi();
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestos, setFilteredRestos] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedResto, setSelectedResto] = useState(null);
    const [qrTab, setQrTab] = useState('whatsapp'); // 'whatsapp' | 'dashboard'
    const [copied, setCopied] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: '', phone: '', slogan: '', address: '',
        delivery_zones: [{ name: '', fee: 0 }],
        delivery_fee_default: 500,
        delivery_time: '45 minutes',
        wave_active: true, wave_nom: '', wave_numero: '',
        orange_active: false, orange_numero: '',
        moov_active: false, moov_numero: '',
        subscription_plan: 'monthly'
    });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => { loadRestaurants(); }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredRestos(restaurants);
        } else {
            const s = search.toLowerCase();
            setFilteredRestos(restaurants.filter(r =>
                r.name.toLowerCase().includes(s) || 
                r.phone.includes(s) ||
                (r.address && r.address.toLowerCase().includes(s)) ||
                (r.delivery_zone && r.delivery_zone.toLowerCase().includes(s))
            ));
        }
    }, [search, restaurants]);

    async function loadRestaurants() {
        const data = await request('/restaurants');
        if (data) {
            setRestaurants(data);
            setFilteredRestos(data);
        }
    }

    function openCreate() {
        setEditingId(null);
        setForm({
            name: '', phone: '', slogan: '', address: '',
            delivery_zones: [{ name: '', fee: 0 }],
            delivery_fee_default: 500,
            delivery_time: '45 minutes',
            wave_active: true, wave_nom: '', wave_numero: '',
            orange_active: false, orange_numero: '',
            moov_active: false, moov_numero: '',
            subscription_plan: 'monthly'
        });
        setShowModal(true);
    }

    function openEdit(resto) {
        setEditingId(resto.id);
        let zones = [];
        try { zones = JSON.parse(resto.delivery_zones || '[]'); } catch (e) { zones = [{ name: '', fee: 0 }]; }
        if (zones.length === 0) zones = [{ name: '', fee: 0 }];

        setForm({
            name: resto.name || '', phone: resto.phone || '', slogan: resto.slogan || '',
            address: resto.address || '', delivery_zones: zones,
            delivery_fee_default: resto.delivery_fee_default ?? 500,
            delivery_time: resto.delivery_time || '45 minutes',
            wave_active: !!resto.wave_active, wave_nom: resto.wave_nom || '', wave_numero: resto.wave_numero || '',
            orange_active: !!resto.orange_active, orange_numero: resto.orange_numero || '',
            moov_active: !!resto.moov_active, moov_numero: resto.moov_numero || '',
            subscription_plan: resto.subscription_plan || 'monthly'
        });
        setShowModal(true);
    }

    function addZone() { setForm({ ...form, delivery_zones: [...form.delivery_zones, { name: '', fee: 0 }] }); }
    function updateZone(index, field, value) { const zones = [...form.delivery_zones]; zones[index][field] = field === 'fee' ? Number(value) : value; setForm({ ...form, delivery_zones: zones }); }
    function removeZone(index) { const zones = form.delivery_zones.filter((_, i) => i !== index); setForm({ ...form, delivery_zones: zones }); }

    async function handleSubmit(e) {
    e.preventDefault();
    setSubmitLoading(true);
    const payload = {
        name: form.name, phone: form.phone, slogan: form.slogan, address: form.address,
        delivery_zones: form.delivery_zones.filter(z => z.name.trim() !== ''),
        delivery_fee_default: Number(form.delivery_fee_default), delivery_time: form.delivery_time,
        wave_active: form.wave_active, wave_nom: form.wave_active ? form.wave_nom : '', wave_numero: form.wave_active ? form.wave_numero : '',
        orange_active: form.orange_active, orange_numero: form.orange_active ? form.orange_numero : '',
        moov_active: form.moov_active, moov_numero: form.moov_active ? form.moov_numero : '',
        subscription_plan: form.subscription_plan
    };
    if (editingId) {
        await request(`/restaurants/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
        await request('/restaurants', { method: 'POST', body: JSON.stringify(payload) });
    }
    setSubmitLoading(false);
    setShowModal(false);
    
    // 🆕 Recharge la liste après 3 secondes (le temps que le bot démarre et génère le QR)
    loadRestaurants();
    if (!editingId) {
        setTimeout(() => loadRestaurants(), 3000);
        setTimeout(() => loadRestaurants(), 6000);
    }
}
    async function toggleActive(id) { await request(`/restaurants/${id}/toggle`, { method: 'PATCH' }); loadRestaurants(); }
    async function handleDelete(id) { await request(`/restaurants/${id}`, { method: 'DELETE' }); setDeleteConfirm(null); loadRestaurants(); }

    function openQR(resto) { setSelectedResto(resto); setQrTab('whatsapp'); setShowQRModal(true); setCopied(false); }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function getPaymentMethods(resto) { const m = []; if (resto.wave_active) m.push('Wave'); if (resto.orange_active) m.push('Orange'); if (resto.moov_active) m.push('Moov'); return m.length > 0 ? m.join(' • ') : 'Non configuré'; }
    function getSubscriptionLabel(resto) { return resto.subscription_plan === 'yearly' ? 'Annuel' : 'Mensuel'; }
    function getDaysLeft(resto) { if (!resto.subscription_end) return null; return Math.ceil((new Date(resto.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)); }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold">Restaurants</h2>
                    <p className="text-gray-500 mt-1">Gérez vos restaurants, zones de livraison et abonnements</p>
                </div>
                <button onClick={openCreate} className="bg-gradient-to-r from-brand to-orange-500 text-white px-5 py-3 rounded-2xl font-semibold hover:from-brand-dark hover:to-orange-600 transition-all shadow-lg shadow-brand/25 flex items-center gap-2">
                    <Plus size={20} /> Nouveau Restaurant
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Rechercher par nom, téléphone, adresse ou zone..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600" />
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                    {filteredRestos.map((r, i) => {
                        const daysLeft = getDaysLeft(r);
                        return (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                                className={`glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all ${!r.is_active ? 'opacity-50' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center"><Store className="text-brand" size={22} /></div>
                                        <div><h3 className="font-bold text-lg">{r.name}</h3><p className="text-gray-500 text-xs line-clamp-1">{r.slogan || 'Pas de slogan'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!r.is_active && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-lg font-medium">Inactif</span>}
                                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.bot_status === 'online' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-600'}`} title={r.bot_status === 'online' ? 'En ligne' : 'Hors ligne'} />
                                    </div>
                                </div>
                                <div className="space-y-2.5 text-sm text-gray-400 mb-4">
                                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-500 flex-shrink-0" /><span className="truncate">{r.phone}</span></div>
                                    {r.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-500 flex-shrink-0" /><span className="truncate">{r.address}</span></div>}
                                    <div className="flex items-center gap-2"><Wallet size={14} className="text-gray-500 flex-shrink-0" /><span className="truncate text-xs">{getPaymentMethods(r)}</span></div>
                                    <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-500 flex-shrink-0" /><span className="text-xs">{getSubscriptionLabel(r)}{daysLeft !== null && <span className={daysLeft <= 7 ? 'text-red-400 ml-1' : 'text-gray-500 ml-1'}>• {daysLeft} jour(s)</span>}</span></div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Link to={`/admin/restaurants/${r.id}`} className="flex-1 bg-white/[0.03] text-gray-300 py-2.5 rounded-xl font-medium text-sm hover:bg-white/[0.06] transition-all text-center border border-white/5 flex items-center justify-center gap-1.5 min-w-[100px]"><Edit size={14} /> Menu</Link>
                                    <button onClick={() => openQR(r)} className="flex-1 bg-white/[0.03] text-gray-300 py-2.5 rounded-xl font-medium text-sm hover:bg-white/[0.06] transition-all text-center border border-white/5 flex items-center justify-center gap-1.5 min-w-[100px]" title="QR Codes"><QrCode size={14} /> QR</button>
                                    <button onClick={() => toggleActive(r.id)} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${r.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`} title={r.is_active ? 'Désactiver' : 'Activer'}>{r.is_active ? <PowerOff size={16} /> : <Power size={16} />}</button>
                                    <button onClick={() => setDeleteConfirm(r.id)} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex-shrink-0" title="Supprimer"><Trash2 size={16} /></button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {filteredRestos.length === 0 && !search && (
                    <div className="col-span-full text-center py-16">
                        <div className="w-20 h-20 bg-white/[0.02] rounded-3xl flex items-center justify-center mx-auto mb-4"><Store size={36} className="text-gray-700" /></div>
                        <p className="text-gray-500 text-lg mb-2">Aucun restaurant</p>
                        <p className="text-gray-600 text-sm mb-4">Créez votre premier restaurant pour commencer</p>
                        <button onClick={openCreate} className="text-brand hover:text-brand-dark font-medium transition-colors inline-flex items-center gap-1"><Plus size={16} /> Créer un restaurant</button>
                    </div>
                )}
                {filteredRestos.length === 0 && search && (
                    <div className="col-span-full text-center py-16"><Search size={36} className="text-gray-700 mx-auto mb-4" /><p className="text-gray-500">Aucun résultat pour "{search}"</p></div>
                )}
            </div>

            {/* MODAL QR CODE (WhatsApp + Dashboard) */}
            <AnimatePresence>
                {showQRModal && selectedResto && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-strong rounded-3xl p-8 w-full max-w-lg border-white/10" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2"><QrCode size={20} className="text-brand" /> {selectedResto.name}</h3>
                                <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl"><X size={20} /></button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button onClick={() => setQrTab('whatsapp')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${qrTab === 'whatsapp' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/[0.02] text-gray-400 border border-white/5'}`}>
                                    📱 QR WhatsApp
                                </button>
                                <button onClick={() => setQrTab('dashboard')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${qrTab === 'dashboard' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/[0.02] text-gray-400 border border-white/5'}`}>
                                    📊 QR Dashboard
                                </button>
                            </div>

                            {qrTab === 'whatsapp' ? (
                                /* QR WHATSAPP */
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Scannez ce QR avec le numéro WhatsApp du restaurant</p>
                                    {selectedResto.qr_code ? (
                                        <img src={selectedResto.qr_code} alt="QR WhatsApp" className="w-56 h-56 mx-auto mb-4 rounded-2xl border border-white/10" />
                                    ) : selectedResto.bot_status === 'online' ? (
                                        <div className="w-56 h-56 bg-green-500/10 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center text-green-400 border border-green-500/20">
                                            <Check size={48} className="mb-2" />
                                            <span className="font-medium">Connecté</span>
                                            <span className="text-xs mt-1">Bot en ligne</span>
                                        </div>
                                    ) : (
                                        <div className="w-56 h-56 bg-yellow-500/10 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center text-yellow-400 border border-yellow-500/20">
                                            <QrCode size={48} className="mb-2" />
                                            <span className="font-medium">En attente</span>
                                            <span className="text-xs mt-1">Redémarrez le bot</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-600 mt-2">Numéro : {selectedResto.phone}</p>
                                </div>
                            ) : (
                                /* QR DASHBOARD */
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Scannez pour accéder au dashboard</p>
                                    <div className="w-56 h-56 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center"><QrCode size={140} className="text-dark" /></div>
                                    <div className="bg-white/[0.03] rounded-2xl p-4 text-left space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Lien dashboard</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-brand text-xs break-all flex-1">{window.location.origin}/resto/{selectedResto.id}</code>
                                                <button onClick={() => copyToClipboard(`${window.location.origin}/resto/${selectedResto.id}`)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Mot de passe</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-white font-bold text-lg">{selectedResto.dashboard_password || 'Non défini'}</code>
                                                <button onClick={() => copyToClipboard(selectedResto.dashboard_password)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <a href={`/resto/${selectedResto.id}`} target="_blank" rel="noopener noreferrer"
                                        className="mt-4 w-full bg-brand text-white py-3 rounded-2xl font-semibold hover:bg-brand-dark transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={16} /> Ouvrir le dashboard
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL CREATE/EDIT - FORMULAIRE PLUS GRAND */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
                            className="glass-strong rounded-3xl p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand to-orange-500 rounded-2xl flex items-center justify-center"><Store size={20} className="text-white" /></div>
                                    {editingId ? 'Modifier le restaurant' : 'Nouveau restaurant'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><X size={22} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* SECTION 1 : INFORMATIONS GÉNÉRALES */}
                                <div className="bg-white/[0.01] rounded-2xl p-6 border border-white/5 space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center"><Store size={16} className="text-blue-400" /></div>
                                        <h4 className="font-semibold text-gray-200">Informations générales</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1.5">Nom du restaurant *</label>
                                            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ex: Chez Awa"
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1.5">Slogan</label>
                                            <input type="text" value={form.slogan} onChange={e => setForm({...form, slogan: e.target.value})} placeholder="Ex: Les meilleurs plats de Bamako !"
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Numéro WhatsApp *</label>
                                            <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="223XXXXXXXXX"
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600" />
                                            <p className="text-xs text-gray-600 mt-1">Format international : 223 suivi du numéro</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Adresse du restaurant</label>
                                            <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Ex: Hippodrome, Rue 100"
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none transition-all text-white placeholder-gray-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2 : LIVRAISON */}
                                <div className="bg-white/[0.01] rounded-2xl p-6 border border-white/5 space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center"><Truck size={16} className="text-green-400" /></div>
                                        <h4 className="font-semibold text-gray-200">Livraison</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Délai estimé</label>
                                            <input type="text" value={form.delivery_time} onChange={e => setForm({...form, delivery_time: e.target.value})} placeholder="45 minutes"
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none text-white placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Frais par défaut (FCFA)</label>
                                            <input type="number" value={form.delivery_fee_default} onChange={e => setForm({...form, delivery_fee_default: Number(e.target.value)})}
                                                className="w-full px-4 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl focus:border-brand focus:outline-none text-white" />
                                            <p className="text-xs text-gray-600 mt-1">Appliqué si la zone du client n'est pas reconnue</p>
                                        </div>
                                    </div>

                                    {/* Zones de livraison */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm text-gray-400 flex items-center gap-2"><MapPinHouse size={14} /> Zones et tarifs spécifiques</label>
                                            <button type="button" onClick={addZone} className="text-brand hover:text-brand-dark text-sm font-medium flex items-center gap-1 transition-colors"><Plus size={14} /> Ajouter</button>
                                        </div>
                                        <div className="space-y-2">
                                            <AnimatePresence>
                                                {form.delivery_zones.map((zone, index) => (
                                                    <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                                        <MapPin size={14} className="text-gray-500 ml-2" />
                                                        <input type="text" value={zone.name} onChange={e => updateZone(index, 'name', e.target.value)} placeholder="Zone (ex: Faladié)"
                                                            className="flex-1 px-3 py-2.5 bg-transparent border border-white/10 rounded-xl focus:border-brand focus:outline-none text-white text-sm placeholder-gray-600" />
                                                        <input type="number" value={zone.fee} onChange={e => updateZone(index, 'fee', e.target.value)} placeholder="0"
                                                            className="w-28 px-3 py-2.5 bg-transparent border border-white/10 rounded-xl focus:border-brand focus:outline-none text-white text-sm placeholder-gray-600" />
                                                        <span className="text-gray-500 text-sm">FCFA</span>
                                                        <button type="button" onClick={() => removeZone(index)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3 : PAIEMENT MOBILE */}
                                <div className="bg-white/[0.01] rounded-2xl p-6 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center"><CreditCard size={16} className="text-purple-400" /></div>
                                        <h4 className="font-semibold text-gray-200">Paiement Mobile</h4>
                                    </div>
                                    <p className="text-xs text-gray-600">Activez les moyens de paiement acceptés par ce restaurant</p>

                                    {[
                                        { key: 'wave', emoji: '🟠', label: 'Wave', fields: ['nom', 'numero'], color: 'orange' },
                                        { key: 'orange', emoji: '🟠', label: 'Orange Money', fields: ['numero'], color: 'orange' },
                                        { key: 'moov', emoji: '🟣', label: 'Moov Money', fields: ['numero'], color: 'purple' },
                                    ].map(method => (
                                        <div key={method.key} className={`rounded-2xl p-5 border transition-all ${form[`${method.key}_active`] ? `bg-${method.color}-500/5 border-${method.color}-500/20` : 'bg-white/[0.01] border-white/5'}`}>
                                            <label className="flex items-center justify-between cursor-pointer">
                                                <span className="flex items-center gap-3">
                                                    <span className="text-2xl">{method.emoji}</span>
                                                    <p className="font-medium text-sm">{method.label}</p>
                                                </span>
                                                <button type="button" onClick={() => setForm({...form, [`${method.key}_active`]: !form[`${method.key}_active`]})}
                                                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${form[`${method.key}_active`] ? 'bg-brand' : 'bg-white/10'}`}>
                                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${form[`${method.key}_active`] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </label>
                                            <AnimatePresence>
                                                {form[`${method.key}_active`] && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                        className={`space-y-3 pt-4 overflow-hidden ${method.fields.length === 1 ? '' : ''}`}>
                                                        {method.fields.includes('nom') && (
                                                            <input type="text" value={form[`${method.key}_nom`]} onChange={e => setForm({...form, [`${method.key}_nom`]: e.target.value})}
                                                                placeholder="Nom sur le compte"
                                                                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600" />
                                                        )}
                                                        <input type="text" value={form[`${method.key}_numero`]} onChange={e => setForm({...form, [`${method.key}_numero`]: e.target.value})}
                                                            placeholder="Numéro"
                                                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>

                                {/* SECTION 4 : ABONNEMENT */}
                                <div className="bg-white/[0.01] rounded-2xl p-6 border border-white/5 space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-yellow-400" /></div>
                                        <h4 className="font-semibold text-gray-200">Abonnement</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setForm({...form, subscription_plan: 'monthly'})}
                                            className={`p-5 rounded-2xl border text-center transition-all ${
                                                form.subscription_plan === 'monthly' ? 'bg-brand/10 border-brand/30 ring-1 ring-brand/30' : 'bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/[0.04]'
                                            }`}>
                                            <p className="font-bold text-xl">Mensuel</p>
                                            <p className="text-sm opacity-70 mt-1">20 000 FCFA / mois</p>
                                            <p className="text-xs text-gray-500 mt-2">Flexible, sans engagement</p>
                                        </button>
                                        <button type="button" onClick={() => setForm({...form, subscription_plan: 'yearly'})}
                                            className={`p-5 rounded-2xl border text-center transition-all ${
                                                form.subscription_plan === 'yearly' ? 'bg-brand/10 border-brand/30 ring-1 ring-brand/30' : 'bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/[0.04]'
                                            }`}>
                                            <p className="font-bold text-xl">Annuel</p>
                                            <p className="text-sm opacity-70 mt-1">200 000 FCFA / an</p>
                                            <p className="text-xs text-green-400 mt-2 font-medium">Économisez 40 000 FCFA</p>
                                        </button>
                                    </div>
                                </div>

                                {/* BOUTONS */}
                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button type="button" onClick={() => setShowModal(false)} 
                                        className="flex-1 py-4 border border-white/10 rounded-2xl font-semibold text-gray-400 hover:bg-white/5 transition-all text-lg">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={submitLoading}
                                        className="flex-[2] bg-gradient-to-r from-brand to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-brand-dark hover:to-orange-600 transition-all shadow-xl shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {submitLoading ? (
                                            <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            editingId ? '💾 Modifier le restaurant' : '✨ Créer le restaurant'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DELETE */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center border-red-500/20" onClick={e => e.stopPropagation()}>
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-400" size={28} /></div>
                            <h3 className="text-xl font-bold mb-2">Supprimer ce restaurant ?</h3>
                            <p className="text-gray-400 text-sm mb-6">Cette action supprimera également tous les menus, images et commandes associés. Elle est irréversible.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-white/10 rounded-2xl font-semibold text-gray-400 hover:bg-white/5 transition-all">Annuler</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition-all">Supprimer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}