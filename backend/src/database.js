const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data/restobot.db');
let db = null;

async function getDb() {
    if (db) return db;
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        db = new SQL.Database();
        await createTables();
    }
    return db;
}

async function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slogan TEXT DEFAULT '',
    phone TEXT NOT NULL,
    address TEXT DEFAULT '',
    delivery_zones TEXT DEFAULT '[]',
    delivery_fee_default INTEGER DEFAULT 500,
    delivery_time TEXT DEFAULT '45 minutes',
    opening_hours TEXT DEFAULT '8h-22h',
    wave_active INTEGER DEFAULT 1,
    wave_nom TEXT DEFAULT '',
    wave_numero TEXT DEFAULT '',
    orange_active INTEGER DEFAULT 0,
    orange_numero TEXT DEFAULT '',
    moov_active INTEGER DEFAULT 0,
    moov_numero TEXT DEFAULT '',
    dashboard_password TEXT DEFAULT '',
    qr_code TEXT,
    subscription_start TEXT DEFAULT '',
    subscription_end TEXT DEFAULT '',
    subscription_plan TEXT DEFAULT 'monthly',
    bot_status TEXT DEFAULT 'offline',
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

    db.run(`CREATE TABLE IF NOT EXISTS menu_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id TEXT NOT NULL,
        url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('plat','extra','boisson')),
        display_order INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id TEXT NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        emoji TEXT DEFAULT '🍽️',
        available INTEGER DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items TEXT NOT NULL,
        service_mode TEXT NOT NULL,
        delivery_address TEXT DEFAULT '',
        pickup_time TEXT DEFAULT '',
        table_info TEXT DEFAULT '',
        subtotal INTEGER NOT NULL,
        delivery_fee INTEGER DEFAULT 0,
        total INTEGER NOT NULL,
        status TEXT DEFAULT 'new',
        payment_received INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT DEFAULT '',
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    db.run('INSERT OR IGNORE INTO admins (email, password, name) VALUES (?, ?, ?)',
        [process.env.ADMIN_EMAIL || 'admin@restobot.ml', hash, 'Super Admin']);
    
    saveDb();
    console.log('✅ Base de données initialisée');
}

function saveDb() {
    if (db) {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
}

function query(sql, params = []) {
    try {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        return result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    } catch (e) {
        console.error('❌ Erreur SQL:', e.message);
        return [];
    }
}

function getOne(sql, params = []) {
    const results = query(sql, params);
    return results[0] || null;
}

function run(sql, params = []) {
    try {
        db.run(sql, params);
        saveDb();
        return true;
    } catch (e) {
        console.error('❌ Erreur SQL:', e.message);
        return false;
    }
}

module.exports = { getDb, query, getOne, run };