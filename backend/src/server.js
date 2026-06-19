require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/menus', express.static(path.join(__dirname, '../public/menus')));

// Crée le dossier menus s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, '../public/menus'))) {
    fs.mkdirSync(path.join(__dirname, '../public/menus'), { recursive: true });
}

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Démarrage
async function start() {
    await getDb();
    console.log('✅ Base de données connectée');
    
    app.listen(PORT, () => {
        console.log(`🚀 API RestoBot : http://localhost:${PORT}`);
        console.log(`📊 Dashboard API : http://localhost:${PORT}/api/health`);
    });

    // Démarre les bots WhatsApp
    try {
        const { startAll } = require('./bots/manager');
        await startAll();
    } catch (e) {
        console.log('⚠️ Bots WhatsApp non démarrés (normal si pas encore de restaurants)');
    }
}

start();