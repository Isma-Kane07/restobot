import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { 
    ArrowLeft, Upload, Trash2, Plus, Image, X, 
    Phone, MapPin, Clock, Store, 
    Edit3, Save, Wallet, QrCode,
    Calendar, ExternalLink, Copy, Check,
    CreditCard, Truck, MapPinHouse, RefreshCw
} from 'lucide-react';

export default function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { request } = useApi();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState({ plats: [], extras: [], boissons: [] });
    const [images, setImages] = useState([]);
    const [activeTab, setActiveTab] = useState('plats');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrTab, setQrTab] = useState('whatsapp');
    const [copied, setCopied] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { loadAll(); }, [id]);

    async function loadAll() {
        const r = await request(`/restaurants/${id}`);
        if (r) { 
            setRestaurant(r); 
            setImages(r.images || []);
            
            let zones = [];
            try { zones = JSON.parse(r.delivery_zones || '[]'); } catch (e) { zones = []; }
            if (zones.length === 0) zones = [{ name: '', fee: 0 }];

            setEditForm({
                name: r.name || '', slogan: r.slogan || '', phone: r.phone || '',
                address: r.address || '', delivery_zones: zones,
                delivery_fee_default: r.delivery_fee_default ?? 500,
                delivery_time: r.delivery_time || '45 minutes',
                wave_active: !!r.wave_active, wave_nom: r.wave_nom || '', wave_numero: r.wave_numero || '',
                orange_active: !!r.orange_active, orange_numero: r.orange_numero || '',
                moov_active: !!r.moov_active, moov_numero: r.moov_numero || '',
                subscription_plan: r.subscription_plan || 'monthly'
            });
        }
        const m = await request(`/menus/${id}`);
        if (m) setMenu(m);
    }

    async function refreshData() {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
    }

    function addZone() { setEditForm({ ...editForm, delivery_zones: [...editForm.delivery_zones, { name: '', fee: 0 }] }); }
    function updateZone(index, field, value) { const zones = [...editForm.delivery_zones]; zones[index][field] = field === 'fee' ? Number(value) : value; setEditForm({ ...editForm, delivery_zones: zones }); }
    function removeZone(index) { const zones = editForm.delivery_zones.filter((_, i) => i !== index); setEditForm({ ...editForm, delivery_zones: zones }); }

    async function saveRestaurant() {
        setSaving(true);
        await request(`/restaurants/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify({ ...editForm, delivery_zones: editForm.delivery_zones.filter(z => z.name.trim() !== '') }) 
        });
        setSaving(false);
        setEditMode(false);
        loadAll();
    }

    async function uploadImages(e) {
        const files = e.target.files;
        if (!files.length) return;
        const formData = new FormData();
        for (const f of files) formData.append('images', f);
        await request(`/restaurants/${id}/images`, { method: 'POST', body: formData });
        loadAll();
    }

    async function deleteImage(imageId) {
        await request(`/restaurants/${id}/images/${imageId}`, { method: 'DELETE' });
        loadAll();
    }

    async function addProduct(e) {
        e.preventDefault();
        const form = e.target;
        await request(`/menus/${id}/products`, {
            method: 'POST',
            body: JSON.stringify({ name: form.name.value, price: Number(form.price.value), emoji: form.emoji.value || '🍽️', type: activeTab.slice(0, -1) })
        });
        form.reset();
        loadAll();
    }

    async function deleteProduct(productId) {
        await request(`/menus/products/${productId}`, { method: 'DELETE' });
        loadAll();
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function getPaymentMethods() {
        const methods = [];
        if (restaurant?.wave_active) methods.push({ name: 'Wave', nom: restaurant.wave_nom, numero: restaurant.wave_numero, emoji: '🟠', color: 'orange' });
        if (restaurant?.orange_active) methods.push({ name: 'Orange Money', nom: '', numero: restaurant.orange_numero, emoji: '🟠', color: 'orange' });
        if (restaurant?.moov_active) methods.push({ name: 'Moov Money', nom: '', numero: restaurant.moov_numero, emoji: '🟣', color: 'purple' });
        return methods;
    }

    function getDaysLeft() {
        if (!restaurant?.subscription_end) return null;
        return Math.ceil((new Date(restaurant.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
    }

    if (!restaurant) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const tabs = [
        { key: 'plats', label: '🍽️ Plats' },
        { key: 'extras', label: '🍟 Extras' },
        { key: 'boissons', label: '🥤 Boissons' },
    ];

    const paymentMethods = getPaymentMethods();
    const daysLeft = getDaysLeft();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/admin/restaurants')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour aux restaurants
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={refreshData} disabled={refreshing} className="p-2.5 bg-white/[0.03] text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all border border-white/5" title="Rafraîchir">
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => { setShowQR(true); setQrTab('whatsapp'); setCopied(false); }} className="flex items-center gap-2 bg-white/[0.03] text-gray-400 hover:text-white px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-all text-sm">
                        <QrCode size={14} /> QR & Dashboard
                    </button>
                </div>
            </div>

            {/* Carte Restaurant */}
            <div className="glass rounded-2xl p-6 lg:p-8 border border-white/5">
                {editMode ? (
                    /* ========== MODE ÉDITION ========== */
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Edit3 size={18} className="text-brand" /> Modification</h3>
                        </div>

                        {/* SECTION 1 : Infos générales */}
                        <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center"><Store size={14} className="text-blue-400" /></div>
                                <h4 className="font-semibold text-gray-200 text-sm">Informations générales</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Nom *</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                                <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Slogan</label><input type="text" value={editForm.slogan} onChange={e => setEditForm({...editForm, slogan: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Téléphone *</label><input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Adresse</label><input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                            </div>
                        </div>

                        {/* SECTION 2 : Livraison + Paiement en 2 colonnes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Livraison */}
                            <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center"><Truck size={14} className="text-green-400" /></div>
                                    <h4 className="font-semibold text-gray-200 text-sm">Livraison</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs text-gray-500 mb-1">Délai</label><input type="text" value={editForm.delivery_time} onChange={e => setEditForm({...editForm, delivery_time: e.target.value})} className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                                    <div><label className="block text-xs text-gray-500 mb-1">Frais défaut</label><input type="number" value={editForm.delivery_fee_default} onChange={e => setEditForm({...editForm, delivery_fee_default: Number(e.target.value)})} className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm" /></div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs text-gray-500 flex items-center gap-1"><MapPinHouse size={12} /> Zones et tarifs</label>
                                        <button type="button" onClick={addZone} className="text-brand text-xs font-medium flex items-center gap-1"><Plus size={12} /> Ajouter</button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {editForm.delivery_zones.map((zone, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="text" value={zone.name} onChange={e => updateZone(index, 'name', e.target.value)} placeholder="Zone" className="flex-1 px-2 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-xs" />
                                                <input type="number" value={zone.fee} onChange={e => updateZone(index, 'fee', e.target.value)} placeholder="0" className="w-16 px-2 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-xs" />
                                                <span className="text-gray-600 text-xs">F</span>
                                                <button onClick={() => removeZone(index)} className="text-gray-600 hover:text-red-400 p-1"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Paiement */}
                            <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center"><CreditCard size={14} className="text-purple-400" /></div>
                                    <h4 className="font-semibold text-gray-200 text-sm">Paiement Mobile</h4>
                                </div>
                                {[
                                    { key: 'wave', label: '🟠 Wave', fields: ['nom', 'numero'] },
                                    { key: 'orange', label: '🟠 Orange Money', fields: ['numero'] },
                                    { key: 'moov', label: '🟣 Moov Money', fields: ['numero'] },
                                ].map(method => (
                                    <div key={method.key} className={`rounded-xl p-3 border ${editForm[`${method.key}_active`] ? 'bg-white/[0.02] border-white/10' : 'bg-white/[0.01] border-white/5'}`}>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-xs font-medium">{method.label}</span>
                                            <button type="button" onClick={() => setEditForm({...editForm, [`${method.key}_active`]: !editForm[`${method.key}_active`]})}
                                                className={`relative w-10 h-5 rounded-full transition-all ${editForm[`${method.key}_active`] ? 'bg-brand' : 'bg-white/10'}`}>
                                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all ${editForm[`${method.key}_active`] ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </label>
                                        {editForm[`${method.key}_active`] && (
                                            <div className={`grid ${method.fields.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-2`}>
                                                {method.fields.includes('nom') && <input type="text" value={editForm[`${method.key}_nom`] || ''} onChange={e => setEditForm({...editForm, [`${method.key}_nom`]: e.target.value})} placeholder="Nom" className="px-2 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-xs" />}
                                                <input type="text" value={editForm[`${method.key}_numero`] || ''} onChange={e => setEditForm({...editForm, [`${method.key}_numero`]: e.target.value})} placeholder="Numéro" className="px-2 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-white text-xs" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 3 : Abonnement */}
                        <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 bg-yellow-500/10 rounded-lg flex items-center justify-center"><Calendar size={14} className="text-yellow-400" /></div>
                                <h4 className="font-semibold text-gray-200 text-sm">Abonnement</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setEditForm({...editForm, subscription_plan: 'monthly'})}
                                    className={`p-3 rounded-xl border text-center text-sm transition-all ${editForm.subscription_plan === 'monthly' ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-white/[0.02] border-white/10 text-gray-400'}`}>
                                    Mensuel • 20 000 F
                                </button>
                                <button type="button" onClick={() => setEditForm({...editForm, subscription_plan: 'yearly'})}
                                    className={`p-3 rounded-xl border text-center text-sm transition-all ${editForm.subscription_plan === 'yearly' ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-white/[0.02] border-white/10 text-gray-400'}`}>
                                    Annuel • 200 000 F
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => { setEditMode(false); loadAll(); }} className="px-5 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 text-sm">Annuler</button>
                            <button onClick={saveRestaurant} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-brand to-orange-500 text-white rounded-xl font-medium hover:from-brand-dark text-sm flex items-center gap-2">
                                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />} Enregistrer
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ========== MODE AFFICHAGE ========== */
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">{restaurant.name}</h2>
                                <p className="text-gray-500 text-sm">{restaurant.slogan || 'Pas de slogan'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${restaurant.bot_status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                    {restaurant.bot_status === 'online' ? '🟢 En ligne' : '⚫ Hors ligne'}
                                </span>
                                <button onClick={() => setEditMode(true)} className="p-2.5 bg-white/[0.03] text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all border border-white/5">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-400 bg-white/[0.02] px-4 py-2.5 rounded-xl border border-white/5"><Phone size={14} className="text-gray-500 flex-shrink-0" /><span className="truncate">{restaurant.phone}</span></div>
                            {restaurant.address && <div className="flex items-center gap-2 text-gray-400 bg-white/[0.02] px-4 py-2.5 rounded-xl border border-white/5"><MapPin size={14} className="text-gray-500 flex-shrink-0" /><span className="truncate">{restaurant.address}</span></div>}
                            <div className="flex items-center gap-2 text-gray-400 bg-white/[0.02] px-4 py-2.5 rounded-xl border border-white/5"><Clock size={14} className="text-gray-500 flex-shrink-0" />{restaurant.delivery_time}</div>
                        </div>

                        {/* Zones */}
                        {(() => { let zones = []; try { zones = JSON.parse(restaurant.delivery_zones || '[]'); } catch (e) {}
                            return zones.length > 0 ? (
                                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> Zones de livraison</p>
                                    <div className="flex flex-wrap gap-2">
                                        {zones.map((z, i) => (
                                            <span key={i} className="bg-white/[0.03] px-3 py-1.5 rounded-lg text-sm border border-white/5">{z.name} : <span className="text-brand font-medium">{z.fee > 0 ? `${z.fee} F` : 'Gratuit'}</span></span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">Frais par défaut : {restaurant.delivery_fee_default} F</p>
                                </div>
                            ) : <p className="text-xs text-gray-600">Aucune zone configurée • Frais par défaut : {restaurant.delivery_fee_default} F</p>;
                        })()}

                        {/* Paiement */}
                        {paymentMethods.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {paymentMethods.map((pm, i) => (
                                    <div key={i} className={`bg-${pm.color}-500/5 px-4 py-2 rounded-xl border border-${pm.color}-500/10 text-sm`}>
                                        <span className="text-gray-400">{pm.emoji} {pm.name} : </span>
                                        <span className="text-gray-300 font-mono">{pm.numero}</span>
                                        {pm.nom && <span className="text-gray-500"> ({pm.nom})</span>}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-600 text-sm">⚠️ Aucun moyen de paiement configuré</p>}

                        {/* Abonnement */}
                        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-brand" />
                                    <div>
                                        <p className="text-sm font-medium">{restaurant.subscription_plan === 'yearly' ? 'Annuel' : 'Mensuel'}</p>
                                        {restaurant.subscription_end && (
                                            <p className={`text-xs ${daysLeft <= 7 ? 'text-red-400' : 'text-gray-500'}`}>
                                                Expire le {new Date(restaurant.subscription_end).toLocaleDateString('fr-FR')} • {daysLeft} jour(s)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-brand font-bold">{restaurant.subscription_plan === 'yearly' ? '200 000 F/an' : '20 000 F/mois'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Photos */}
            <div className="glass rounded-2xl p-6 border border-white/5">
                <h4 className="font-semibold text-gray-300 mb-4 flex items-center gap-2"><Image size={18} className="text-brand" /> Photos ({images.length}/5)</h4>
                <div className="flex gap-3 flex-wrap">
                    {images.map(img => (
                        <div key={img.id} className="relative group">
                            <img src={img.url} alt="Menu" className="w-36 h-36 object-cover rounded-2xl border border-white/10" />
                            <button onClick={() => deleteImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                        </div>
                    ))}
                    {images.length < 5 && (
                        <label className="w-36 h-36 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand/50 transition-all text-gray-500 hover:text-brand group">
                            <Upload size={24} className="mb-1 group-hover:scale-110 transition-transform" /><span className="text-xs">Ajouter</span>
                            <input type="file" accept="image/*" multiple onChange={uploadImages} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            {/* Menu */}
            <div className="glass rounded-2xl p-6 border border-white/5">
                <h4 className="font-semibold text-gray-300 mb-6 flex items-center gap-2"><Store size={18} className="text-brand" /> Menu</h4>
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-2xl font-medium text-sm transition-all ${activeTab === tab.key ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:bg-white/[0.05]'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="space-y-2 mb-6">
                    <AnimatePresence>
                        {(menu[activeTab] || []).map(p => (
                            <motion.div key={p.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <span className="flex items-center gap-3"><span className="text-xl">{p.emoji || '🍽️'}</span><span className="font-medium text-sm">{p.name}</span></span>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-green-400 text-sm">{p.price.toLocaleString()} F</span>
                                    <button onClick={() => deleteProduct(p.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-xl"><Trash2 size={14} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <form onSubmit={addProduct} className="flex gap-2 border-t border-white/5 pt-4">
                    <input name="emoji" placeholder="🍽️" maxLength={4} className="w-14 px-3 py-3 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-center text-white text-lg" />
                    <input name="name" placeholder="Nom" required className="flex-1 px-4 py-3 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-white placeholder-gray-600" />
                    <input name="price" type="number" placeholder="Prix" required className="w-28 px-3 py-3 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-white placeholder-gray-600" />
                    <button type="submit" className="bg-gradient-to-r from-brand to-orange-500 text-white px-5 py-3 rounded-2xl hover:from-brand-dark transition-all shadow-lg flex items-center gap-1.5 font-medium text-sm"><Plus size={18} /> Ajouter</button>
                </form>
            </div>

            {/* Modal QR avec 2 onglets */}
            <AnimatePresence>
                {showQR && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-strong rounded-3xl p-8 w-full max-w-lg border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2"><QrCode size={20} className="text-brand" /> {restaurant.name}</h3>
                                <button onClick={() => setShowQR(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl"><X size={20} /></button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6">
                                <button onClick={() => setQrTab('whatsapp')}
                                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${qrTab === 'whatsapp' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/[0.02] text-gray-400 border border-white/5'}`}>
                                    📱 QR WhatsApp
                                </button>
                                <button onClick={() => setQrTab('dashboard')}
                                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${qrTab === 'dashboard' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-white/[0.02] text-gray-400 border border-white/5'}`}>
                                    📊 QR Dashboard
                                </button>
                            </div>

                            {qrTab === 'whatsapp' ? (
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Scannez ce QR avec le numéro WhatsApp du restaurant</p>
                                    {restaurant.qr_code ? (
                                        <img src={restaurant.qr_code} alt="QR WhatsApp" className="w-56 h-56 mx-auto mb-4 rounded-2xl border border-white/10" />
                                    ) : restaurant.bot_status === 'online' ? (
                                        <div className="w-56 h-56 bg-green-500/10 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center text-green-400 border border-green-500/20">
                                            <Check size={48} className="mb-2" /><span className="font-medium">Connecté ✅</span>
                                        </div>
                                    ) : (
                                        <div className="w-56 h-56 bg-yellow-500/10 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center text-yellow-400 border border-yellow-500/20">
                                            <QrCode size={48} className="mb-2" /><span className="font-medium">En attente...</span>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-600">Numéro : {restaurant.phone}</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-4">Scannez pour accéder au dashboard</p>
                                    <div className="w-56 h-56 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center"><QrCode size={140} className="text-dark" /></div>
                                    <div className="bg-white/[0.03] rounded-2xl p-4 text-left space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Lien dashboard</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-brand text-xs break-all flex-1">{window.location.origin}/resto/{restaurant.id}</code>
                                                <button onClick={() => copyToClipboard(`${window.location.origin}/resto/${restaurant.id}`)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Mot de passe</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-white font-bold text-lg">{restaurant.dashboard_password || 'Non défini'}</code>
                                                <button onClick={() => copyToClipboard(restaurant.dashboard_password)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <a href={`/resto/${restaurant.id}`} target="_blank" rel="noopener noreferrer"
                                        className="mt-4 w-full bg-brand text-white py-3 rounded-2xl font-semibold hover:bg-brand-dark transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={16} /> Ouvrir le dashboard
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}