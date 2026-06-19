const router = require('express').Router();
const { query, run, getOne } = require('../database');
const { auth } = require('./auth');

// Toutes les commandes (admin) avec pagination
router.get('/', auth, (req, res) => {
    const { status, restaurant_id, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (restaurant_id) { sql += ' AND restaurant_id = ?'; params.push(restaurant_id); }
    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }

    const total = query('SELECT COUNT(*) as count FROM (' + sql + ')', params)[0]?.count || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const orders = query(sql, params).map(o => ({
        ...o,
        items: JSON.parse(o.items || '[]')
    }));

    res.json({
        orders,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
    });
});

// Commandes d'un restaurant
router.get('/restaurant/:restaurantId', auth, (req, res) => {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders WHERE restaurant_id = ?';
    const params = [req.params.restaurantId];

    if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT 100';

    const orders = query(sql, params).map(o => ({
        ...o,
        items: JSON.parse(o.items || '[]')
    }));

    res.json(orders);
});

// Détail d'une commande
router.get('/detail/:id', auth, (req, res) => {
    const order = getOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    order.items = JSON.parse(order.items || '[]');
    res.json(order);
});

// Mettre à jour le statut
router.put('/:id/status', auth, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide. Utilisez : ' + validStatuses.join(', ') });
    }

    const order = getOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.params.id]);

    res.json({ success: true, status });
});

// Stats d'un restaurant
router.get('/stats/:restaurantId', auth, (req, res) => {
    const orders = query('SELECT * FROM orders WHERE restaurant_id = ?', [req.params.restaurantId])
        .map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));

    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const monthOrders = orders.filter(o => o.created_at.startsWith(thisMonth));
    const paidOrders = orders.filter(o => o.status !== 'cancelled');

    res.json({
        total: orders.length,
        new: orders.filter(o => o.status === 'new').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: paidOrders.reduce((s, o) => s + o.total, 0),
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        monthOrders: monthOrders.length,
        monthRevenue: monthOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        averageOrder: orders.length > 0 ? Math.round(paidOrders.reduce((s, o) => s + o.total, 0) / orders.length) : 0
    });
});

module.exports = router;