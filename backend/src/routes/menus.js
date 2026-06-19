const router = require('express').Router();
const { query, run, getOne } = require('../database');
const { auth } = require('./auth');

// Menu complet d'un restaurant
router.get('/:restaurantId', auth, (req, res) => {
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.restaurantId]);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });

    const plats = query(`SELECT p.*, c.name as category_name FROM products p 
        JOIN categories c ON p.category_id = c.id 
        WHERE p.restaurant_id = ? AND c.type = 'plat' AND p.available = 1 
        ORDER BY p.id`, [req.params.restaurantId]);

    const extras = query(`SELECT p.*, c.name as category_name FROM products p 
        JOIN categories c ON p.category_id = c.id 
        WHERE p.restaurant_id = ? AND c.type = 'extra' AND p.available = 1 
        ORDER BY p.id`, [req.params.restaurantId]);

    const boissons = query(`SELECT p.*, c.name as category_name FROM products p 
        JOIN categories c ON p.category_id = c.id 
        WHERE p.restaurant_id = ? AND c.type = 'boisson' AND p.available = 1 
        ORDER BY p.id`, [req.params.restaurantId]);

    res.json({ plats, extras, boissons });
});

// Ajouter un produit
router.post('/:restaurantId/products', auth, (req, res) => {
    const { name, price, emoji, type } = req.body;

    if (!name || !price || !type) {
        return res.status(400).json({ error: 'Nom, prix et type requis' });
    }

    if (!['plat', 'extra', 'boisson'].includes(type)) {
        return res.status(400).json({ error: 'Type invalide (plat, extra, boisson)' });
    }

    // Trouve ou crée la catégorie
    let cat = getOne('SELECT id FROM categories WHERE restaurant_id = ? AND type = ?',
        [req.params.restaurantId, type]);

    if (!cat) {
        const names = { plat: 'Plats', extra: 'Extras', boisson: 'Boissons' };
        run('INSERT INTO categories (restaurant_id, name, type) VALUES (?, ?, ?)',
            [req.params.restaurantId, names[type] || type, type]);
        cat = getOne('SELECT id FROM categories WHERE restaurant_id = ? AND type = ?',
            [req.params.restaurantId, type]);
    }

    run('INSERT INTO products (restaurant_id, category_id, name, price, emoji) VALUES (?, ?, ?, ?, ?)',
        [req.params.restaurantId, cat.id, name, price, emoji || '🍽️']);

    res.status(201).json({ success: true, message: 'Produit ajouté' });
});

// Modifier un produit
router.put('/products/:id', auth, (req, res) => {
    const product = getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    const { name, price, emoji } = req.body;
    run('UPDATE products SET name = ?, price = ?, emoji = ? WHERE id = ?',
        [name || product.name, price !== undefined ? price : product.price, emoji || product.emoji, req.params.id]);

    res.json({ success: true, message: 'Produit modifié' });
});

// Supprimer un produit (désactiver)
router.delete('/products/:id', auth, (req, res) => {
    run('UPDATE products SET available = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produit supprimé' });
});

module.exports = router;