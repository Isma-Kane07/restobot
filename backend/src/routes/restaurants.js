const router = require('express').Router();
const { v4: uuid } = require('uuid');
const { query, getOne, run } = require('../database');
const { auth } = require('./auth');
const { startNewBot } = require('../bots/manager');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration upload images
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../public/menus'),
    filename: (req, file, cb) => cb(null, `${uuid()}.jpg`)
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Format image uniquement'));
    }
});

// Liste des restaurants
router.get('/', auth, (req, res) => {
    const restaurants = query('SELECT * FROM restaurants ORDER BY created_at DESC');
    res.json(restaurants);
});

// Créer un restaurant
router.post('/', auth, async (req, res) => {
    try {
        const { 
            name, phone, slogan, address,
            delivery_zones, delivery_fee_default, delivery_time, opening_hours,
            wave_active, wave_nom, wave_numero,
            orange_active, orange_numero,
            moov_active, moov_numero,
            subscription_plan, is_active 
        } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ error: 'Nom et téléphone requis' });
        }
        
        // 1. Générer l'ID d'abord
        const id = uuid();
        const dashboardPassword = Math.random().toString(36).slice(2, 10);
        
        // 2. Dates d'abonnement
        const subscriptionStart = new Date().toISOString().split('T')[0];
        let subscriptionEnd = null;
        if (subscription_plan === 'monthly') {
            const d = new Date();
            d.setMonth(d.getMonth() + 1);
            subscriptionEnd = d.toISOString().split('T')[0];
        } else if (subscription_plan === 'yearly') {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            subscriptionEnd = d.toISOString().split('T')[0];
        }
        
        // 3. Insérer dans la base
        run(`INSERT INTO restaurants (
            id, name, slogan, phone, address,
            delivery_zones, delivery_fee_default, delivery_time, opening_hours,
            wave_active, wave_nom, wave_numero,
            orange_active, orange_numero,
            moov_active, moov_numero,
            dashboard_password, subscription_start, subscription_end, subscription_plan,
            is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, name, slogan || '', phone, address || '',
                JSON.stringify(delivery_zones || []), delivery_fee_default || 500, delivery_time || '45 minutes', opening_hours || '8h-22h',
                wave_active ? 1 : 0, wave_nom || '', wave_numero || '',
                orange_active ? 1 : 0, orange_numero || '',
                moov_active ? 1 : 0, moov_numero || '',
                dashboardPassword, subscriptionStart, subscriptionEnd, subscription_plan || 'monthly',
                is_active ? 1 : 0
            ]);
        
        // 4. Récupérer le restaurant créé
        const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [id]);
        restaurant.delivery_zones = JSON.parse(restaurant.delivery_zones || '[]');
        
        // 5. Répondre au client
        res.status(201).json(restaurant);
        
        // 6. Démarrer le bot automatiquement (après la réponse)
        if (restaurant.is_active) {
            console.log(`🚀 Démarrage automatique du bot pour ${restaurant.name}...`);
            startNewBot(id);
        }
        
    } catch (error) {
        console.error('❌ Erreur création restaurant:', error.message);
        res.status(500).json({ error: 'Erreur lors de la création du restaurant' });
    }
});

// Détail d'un restaurant
router.get('/:id', auth, (req, res) => {
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
    
    restaurant.images = query('SELECT * FROM menu_images WHERE restaurant_id = ? ORDER BY display_order', [req.params.id]);
    restaurant.delivery_zones = JSON.parse(restaurant.delivery_zones || '[]');
    res.json(restaurant);
});

// Modifier un restaurant
router.put('/:id', auth, (req, res) => {
    const r = req.body;
    const existing = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Restaurant non trouvé' });
    
    run(`UPDATE restaurants SET 
        name = ?, slogan = ?, phone = ?, address = ?,
        delivery_zones = ?, delivery_fee_default = ?, delivery_time = ?, opening_hours = ?,
        wave_active = ?, wave_nom = ?, wave_numero = ?,
        orange_active = ?, orange_numero = ?,
        moov_active = ?, moov_numero = ?,
        subscription_plan = ?, is_active = ?
        WHERE id = ?`,
        [
            r.name || existing.name, r.slogan ?? existing.slogan, r.phone || existing.phone, r.address ?? existing.address,
            JSON.stringify(r.delivery_zones || JSON.parse(existing.delivery_zones || '[]')),
            r.delivery_fee_default ?? existing.delivery_fee_default,
            r.delivery_time || existing.delivery_time,
            r.opening_hours || existing.opening_hours,
            r.wave_active !== undefined ? (r.wave_active ? 1 : 0) : existing.wave_active,
            r.wave_nom ?? existing.wave_nom, r.wave_numero ?? existing.wave_numero,
            r.orange_active !== undefined ? (r.orange_active ? 1 : 0) : existing.orange_active,
            r.orange_numero ?? existing.orange_numero,
            r.moov_active !== undefined ? (r.moov_active ? 1 : 0) : existing.moov_active,
            r.moov_numero ?? existing.moov_numero,
            r.subscription_plan || existing.subscription_plan,
            r.is_active !== undefined ? (r.is_active ? 1 : 0) : existing.is_active,
            req.params.id
        ]);
    
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    restaurant.delivery_zones = JSON.parse(restaurant.delivery_zones || '[]');
    res.json(restaurant);
});

// Activer/Désactiver
router.patch('/:id/toggle', auth, (req, res) => {
    const r = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Restaurant non trouvé' });
    
    const newStatus = r.is_active ? 0 : 1;
    run('UPDATE restaurants SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    
    // Si on active, démarrer le bot
    if (newStatus === 1) {
        console.log(`🚀 Démarrage du bot pour ${r.name}...`);
        startNewBot(req.params.id);
    }
    
    res.json({ is_active: !!newStatus, message: newStatus ? 'Restaurant activé' : 'Restaurant désactivé' });
});

// Supprimer un restaurant
router.delete('/:id', auth, (req, res) => {
    run('DELETE FROM menu_images WHERE restaurant_id = ?', [req.params.id]);
    run('DELETE FROM products WHERE restaurant_id = ?', [req.params.id]);
    run('DELETE FROM categories WHERE restaurant_id = ?', [req.params.id]);
    run('DELETE FROM orders WHERE restaurant_id = ?', [req.params.id]);
    run('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Restaurant supprimé' });
});

// Upload images du menu
router.post('/:id/images', auth, upload.array('images', 5), (req, res) => {
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Aucune image' });
    }
    
    req.files.forEach((file, i) => {
        run('INSERT INTO menu_images (restaurant_id, url, display_order) VALUES (?, ?, ?)',
            [req.params.id, '/menus/' + file.filename, i]);
    });
    
    const images = query('SELECT * FROM menu_images WHERE restaurant_id = ? ORDER BY display_order', [req.params.id]);
    res.json(images);
});

// Supprimer une image
router.delete('/:id/images/:imageId', auth, (req, res) => {
    const img = getOne('SELECT * FROM menu_images WHERE id = ? AND restaurant_id = ?', [req.params.imageId, req.params.id]);
    if (!img) return res.status(404).json({ error: 'Image non trouvée' });
    
    const imgPath = path.join(__dirname, '../../public', img.url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    
    run('DELETE FROM menu_images WHERE id = ?', [req.params.imageId]);
    res.json({ success: true });
});

module.exports = router;