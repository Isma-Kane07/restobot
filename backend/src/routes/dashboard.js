const router = require('express').Router();
const { query, getOne } = require('../database');
const { auth } = require('./auth');

// Dashboard global admin
router.get('/global', auth, (req, res) => {
    const restaurants = query('SELECT * FROM restaurants');
    const activeRestaurants = restaurants.filter(r => r.is_active === 1);

    const orders = query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500')
        .map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));

    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const monthOrders = orders.filter(o => o.created_at.startsWith(thisMonth));

    const ordersByRestaurant = {};
    orders.forEach(o => {
        ordersByRestaurant[o.restaurant_id] = (ordersByRestaurant[o.restaurant_id] || 0) + 1;
    });

    res.json({
        totalRestaurants: restaurants.length,
        activeRestaurants: activeRestaurants.length,
        onlineBots: activeRestaurants.filter(r => r.bot_status === 'online').length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        monthOrders: monthOrders.length,
        totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        todayRevenue: todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        monthRevenue: monthOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        newOrders: orders.filter(o => o.status === 'new').length,
        recentOrders: orders.slice(0, 20),
        ordersByRestaurant,
        restaurants: restaurants.map(r => ({
            ...r,
            orderCount: ordersByRestaurant[r.id] || 0
        }))
    });
});

// Dashboard public pour un restaurant
router.get('/public/:restaurantId', (req, res) => {
    const restaurant = query(
        'SELECT id, name, slogan, bot_status, delivery_zone, delivery_fee, delivery_time FROM restaurants WHERE id = ? AND is_active = 1',
        [req.params.restaurantId]
    )[0];

    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });

    const orders = query(
        'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 50',
        [req.params.restaurantId]
    ).map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));

    const today = new Date().toDateString();

    res.json({
        restaurant,
        totalOrders: orders.length,
        todayOrders: orders.filter(o => new Date(o.created_at).toDateString() === today).length,
        newOrders: orders.filter(o => o.status === 'new').length,
        recentOrders: orders.slice(0, 10)
    });
});

// Dashboard pour le restaurateur (avec mot de passe simple)
router.get('/restaurant/:restaurantId', (req, res) => {
    const { password } = req.query;
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [req.params.restaurantId]);
    
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
    if (!restaurant.is_active) return res.status(403).json({ error: 'Restaurant désactivé' });
    if (password !== restaurant.dashboard_password) return res.status(401).json({ error: 'Mot de passe incorrect' });
    
    const orders = query('SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 100', [req.params.restaurantId])
        .map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));
    
    const today = new Date().toDateString();
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    res.json({
        restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            phone: restaurant.phone,
            delivery_zones: JSON.parse(restaurant.delivery_zones || '[]'),
            subscription_plan: restaurant.subscription_plan,
            subscription_end: restaurant.subscription_end,
            bot_status: restaurant.bot_status
        },
        stats: {
            total: orders.length,
            new: orders.filter(o => o.status === 'new').length,
            today: orders.filter(o => new Date(o.created_at).toDateString() === today).length,
            revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
            todayRevenue: orders.filter(o => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        },
        orders: orders.slice(0, 50)
    });
});

module.exports = router;