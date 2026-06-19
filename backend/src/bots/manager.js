const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { query, getOne, run } = require('../database');
const { parseOrder, generateWelcomeMessage } = require('../ai/parser');

const bots = {};
const userSessions = {};
let orderCounter = 1000;

function log(e, m, d = '') { console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ${e} ${m}`, d || ''); }

// Enlève les accents pour la comparaison
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getChromePath() {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const p of paths) if (fs.existsSync(p)) return p;
    return undefined;
}

async function startBot(restaurantId) {
    const restaurant = getOne('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!restaurant || !restaurant.is_active) return;

    if (bots[restaurantId]) {
        try { await bots[restaurantId].client.destroy(); } catch (e) {}
        bots[restaurantId] = null;
        await new Promise(r => setTimeout(r, 2000));
    }

    log('🚀', `Démarrage: ${restaurant.name}`);

    const chromePath = getChromePath();

    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '../../data/sessions', restaurantId) }),
        puppeteer: {
            executablePath: chromePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        },
        webVersionCache: { type: 'none' },
    });

    client.on('qr', (qr) => {
        log('🔴', 'QR généré');
        console.log(`\n🔴 QR CODE - ${restaurant.name} | 📱 ${restaurant.phone}\n`);
        qrcode.generate(qr, { small: true });
        QRCode.toDataURL(qr, (err, url) => {
            if (!err) run('UPDATE restaurants SET qr_code = ? WHERE id = ?', [url, restaurantId]);
        });
    });

    client.on('ready', () => {
        log('✅', `${restaurant.name} - CONNECTÉ !`);
        run('UPDATE restaurants SET bot_status = ?, qr_code = NULL WHERE id = ?', ['online', restaurantId]);
        bots[restaurantId] = { client, restaurant, ready: true };
    });

    client.on('disconnected', (reason) => {
        log('⚠️', `Déconnecté: ${reason}`);
        run('UPDATE restaurants SET bot_status = ? WHERE id = ?', ['offline', restaurantId]);
        bots[restaurantId] = null;
        setTimeout(() => startBot(restaurantId), 15000);
    });

    client.on('message', async (message) => {
        if (!bots[restaurantId]?.ready || message.from.includes('@g.us') || message.from === client.info?.wid?._serialized) return;

        const userId = message.from.split('@')[0];
        const text = message.body?.trim() || '';
        log('📩', `${userId}:`, text || '[Image]');

        // Nettoyer sessions expirées
        if (userSessions[userId] && Date.now() - userSessions[userId].lastActivity > 30 * 60 * 1000) {
            delete userSessions[userId];
        }

        // Initialiser session
        if (!userSessions[userId]) {
            userSessions[userId] = {
                restaurantId,
                state: 'WELCOME',
                order: { items: [], total: 0, subtotal: 0, mode: '', address: '', time: '', table: '' },
                history: [],
                lastActivity: Date.now()
            };
        }

        const session = userSessions[userId];
        session.lastActivity = Date.now();

        // Fonction reply avec logs
        const reply = async (msg) => {
            try {
                await message.reply(msg);
                log('📤', `→ ${userId}:`, msg.substring(0, 100) + (msg.length > 100 ? '...' : ''));
            } catch (e) {
                try {
                    await client.sendMessage(message.from, msg);
                    log('📤', `→ ${userId} (fallback):`, msg.substring(0, 100) + (msg.length > 100 ? '...' : ''));
                } catch (e2) {
                    log('❌', 'Erreur envoi:', e2.message);
                }
            }
        };

        // ========== CAPTURE DE PAIEMENT ==========
        if (message.hasMedia && session.state === 'WAITING_PAYMENT') {
            try { await message.downloadMedia(); } catch (e) {}
            orderCounter++;
            run(`INSERT INTO orders (restaurant_id, customer_phone, items, service_mode, delivery_address, pickup_time, table_info, subtotal, delivery_fee, total, status, payment_received) 
                 VALUES (?,?,?,?,?,?,?,?,?,?,'new',1)`,
                [restaurantId, userId, JSON.stringify(session.order.items), session.order.mode,
                 session.order.address, session.order.time, session.order.table,
                 session.order.subtotal, session.order.deliveryFee, session.order.total]);

            let confirmMsg = `🎉 *COMMANDE #${orderCounter} CONFIRMÉE !*\n\n`;
            confirmMsg += `✅ Paiement reçu : *${session.order.total.toLocaleString()} F*\n\n`;
            if (session.order.mode === 'delivery') {
                confirmMsg += `🛵 Livraison : ${session.order.address}\n`;
                confirmMsg += `⏱️ Délai estimé : ${restaurant.delivery_time}\n`;
            } else if (session.order.mode === 'takeaway') {
                confirmMsg += `🛍️ À récupérer dans ${session.order.time}\n📍 ${restaurant.name}\n`;
            } else {
                confirmMsg += `🍽️ Sur place - ${session.order.table}\n`;
            }
            confirmMsg += `\n📞 ${restaurant.phone}\n😊 Merci et bon appétit !`;

            await reply(confirmMsg);
            log('✅', `Commande #${orderCounter} confirmée - ${session.order.total}F`);
            delete userSessions[userId];
            return;
        }

        // Ajouter à l'historique
        if (text) session.history.push(`Client: ${text}`);

        // ========== DÉTECTION DU TYPE DE MESSAGE ==========
        const greetings = ['bonjour', 'salut', 'salam', 'hey', 'coucou', 'bjr', 'bsr', 'bonsoir', 'hello', 'hi'];
        const isGreeting = greetings.includes(text.toLowerCase());
        const isMenuRequest = text.toLowerCase() === 'menu';
        const isCancel = text.toLowerCase() === 'annuler';

        // 1. ANNULATION
        if (isCancel) {
            delete userSessions[userId];
            await reply('❌ Commande annulée.\n📋 Écrivez *"Menu"* pour recommencer.');
            log('🗑️', `Session annulée pour ${userId}`);
            return;
        }

        // 2. PREMIER MESSAGE
        if (session.state === 'WELCOME') {
            if (isMenuRequest) {
                await handleMenu();
            } else if (isGreeting) {
                await handleWelcome();
            } else {
                await handleDirectOrder();
            }
            return;
        }

        // 3. DEMANDE DE MENU (en cours de conversation)
        if (isMenuRequest) {
            await handleMenu();
            return;
        }

        // 4. SALUTATION en cours de conversation
        if (isGreeting) {
            await reply('👋 Bonjour ! Dites-moi ce que vous voulez commander.\n_Ex : "2 poulet, 1 coca, frites"_');
            return;
        }

        // 5. MACHINE À ÉTATS
        switch (session.state) {
            case 'ORDERING':
                await handleDirectOrder();
                break;
            case 'ADD_MORE':
                await handleAddMore();
                break;
            case 'CHOOSE_MODE':
                await handleMode();
                break;
            case 'ADDRESS':
                session.order.address = text;
                await showRecap();
                break;
            case 'TIME':
                session.order.time = text;
                await showRecap();
                break;
            case 'TABLE':
                session.order.table = text;
                await showRecap();
                break;
            default:
                await handleWelcome();
        }

        // ========== FONCTIONS ==========

        // Message de bienvenue SIMPLE (sans menu)
        async function handleWelcome() {
            session.state = 'ORDERING';
            const welcome = await generateWelcomeMessage(restaurant.name, restaurant.slogan);
            await reply(welcome);
            log('👋', `Bienvenue envoyé à ${userId}`);
        }

        // Envoi du menu - PRIORITÉ IMAGE, sinon TEXTE (jamais les deux)
        async function handleMenu() {
            session.state = 'ORDERING';

            const images = query('SELECT * FROM menu_images WHERE restaurant_id = ? ORDER BY display_order', [restaurantId]);

            if (images.length > 0) {
                // === MODE IMAGE ===
                await reply('📋 Voici notre menu du jour !\n\n💬 Dites-moi ce que vous voulez commander.\n_Ex : "2 poulet, 1 coca, frites"_');

                for (const img of images) {
                    try {
                        const filePath = path.join(__dirname, '../../public', img.url);
                        if (fs.existsSync(filePath)) {
                            const media = MessageMedia.fromFilePath(filePath);
                            await client.sendMessage(message.from, media, { caption: `📋 *${restaurant.name}*` });
                            await new Promise(r => setTimeout(r, 500));
                        }
                    } catch (e) {
                        log('❌', `Erreur image: ${e.message}`);
                    }
                }
                log('📸', `${images.length} image(s) envoyée(s)`);
            } else {
                // === MODE TEXTE (pas d'image) ===
                const products = query(`SELECT p.*, c.type as category_type FROM products p 
                    JOIN categories c ON p.category_id=c.id 
                    WHERE p.restaurant_id=? AND p.available=1 
                    ORDER BY c.type, p.id`, [restaurantId]);

                if (products.length > 0) {
                    let menuText = '';
                    const plats = products.filter(p => p.category_type === 'plat');
                    const extras = products.filter(p => p.category_type === 'extra');
                    const boissons = products.filter(p => p.category_type === 'boisson');

                    if (plats.length > 0) {
                        menuText += '📝 *Plats :*\n';
                        plats.forEach(p => { menuText += `  ${p.emoji || '🍽️'} ${p.name} - *${p.price.toLocaleString()}F*\n`; });
                    }
                    if (extras.length > 0) {
                        menuText += '\n🍟 *Extras :*\n';
                        extras.forEach(p => { menuText += `  ${p.emoji || '🍟'} ${p.name} - *${p.price.toLocaleString()}F*\n`; });
                    }
                    if (boissons.length > 0) {
                        menuText += '\n🥤 *Boissons :*\n';
                        boissons.forEach(p => { menuText += `  ${p.emoji || '🥤'} ${p.name} - *${p.price.toLocaleString()}F*\n`; });
                    }
                    menuText += '\n💬 Dites-moi ce que vous voulez !\n_Ex : "2 poulet, 1 coca, frites"_';

                    await reply(menuText);
                    log('📋', 'Menu texte envoyé');
                } else {
                    await reply('⚠️ Le menu est vide. Aucun plat configuré. Contactez le restaurant.');
                }
            }
        }

        // Commande directe (pour les habitués ou nouvelle commande)
        async function handleDirectOrder() {
            const products = query(`SELECT p.*, c.type as category_type FROM products p 
                JOIN categories c ON p.category_id=c.id 
                WHERE p.restaurant_id=? AND p.available=1`, [restaurantId]);

            if (products.length === 0) {
                await reply('⚠️ Le menu est vide. Contactez le restaurant.');
                return;
            }

            const result = await parseOrder(products, text, session.history);

            if (result.type === 'greeting') {
                await reply('👋 Bonjour ! Dites-moi ce que vous voulez commander.\n_Ex : "2 poulet, 1 coca, frites"_');
                return;
            }

            if (!result.success) {
                await reply(result.message);
                return;
            }

            // Si c'est la première commande (pas d'items existants), on initialise
            if (session.order.items.length === 0) {
                session.order.items = result.items;
                log('🆕', `Nouvelle commande: ${result.items.length} article(s)`);
            } else {
                // Sinon on fusionne (ajout à une commande existante)
                for (const newItem of result.items) {
                    const existingIndex = session.order.items.findIndex(i => 
                        i.id === newItem.id || i.name.toLowerCase() === newItem.name.toLowerCase()
                    );
                    if (existingIndex >= 0) {
                        session.order.items[existingIndex].quantity += newItem.quantity;
                        log('🔀', `Fusion: ${newItem.name} +${newItem.quantity}`);
                    } else {
                        session.order.items.push(newItem);
                        log('➕', `Ajout: ${newItem.quantity}x ${newItem.name}`);
                    }
                }
            }

            session.order.total = session.order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
            session.order.subtotal = session.order.total;
            session.state = 'ADD_MORE';

            await reply(`✅ ${result.message}\n\n💰 Total : *${session.order.total.toLocaleString()} F*\n\nVoulez-vous ajouter autre chose ? (Oui/Non)`);
        }

        // Ajouter des items à une commande existante
        async function handleAddMore() {
            const stopWords = ['non', 'non merci', "c'est tout", 'c bon', 'cbon', 'rien', 'c tout', 'non merci cest tout', 'cest tout'];
            if (stopWords.includes(text.toLowerCase())) {
                session.state = 'CHOOSE_MODE';
                await reply(`🚀 *Mode de service :*\n1️⃣ Livraison\n2️⃣ À emporter\n3️⃣ Sur place\n\nTapez 1, 2 ou 3`);
                return;
            }

            const continueWords = ['oui', 'ouais', 'yes', 'oui merci'];
            if (continueWords.includes(text.toLowerCase())) {
                session.state = 'ORDERING';
                await reply('Que voulez-vous ajouter ?');
                return;
            }

            // Traiter comme ajout
            const products = query(`SELECT p.*, c.type as category_type FROM products p 
                JOIN categories c ON p.category_id=c.id 
                WHERE p.restaurant_id=? AND p.available=1`, [restaurantId]);

            const result = await parseOrder(products, text, session.history);

            if (result.success && result.items.length > 0) {
                // Fusionner avec les items EXISTANTS
                for (const newItem of result.items) {
                    const existingIndex = session.order.items.findIndex(i => 
                        i.id === newItem.id || i.name.toLowerCase() === newItem.name.toLowerCase()
                    );
                    if (existingIndex >= 0) {
                        session.order.items[existingIndex].quantity += newItem.quantity;
                        log('🔀', `Fusion: ${newItem.name} +${newItem.quantity} → ${session.order.items[existingIndex].quantity}`);
                    } else {
                        session.order.items.push(newItem);
                        log('➕', `Ajout: ${newItem.quantity}x ${newItem.name}`);
                    }
                }

                // Recalculer le total
                session.order.total = session.order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
                session.order.subtotal = session.order.total;

                const itemsList = result.items.map(i =>
                    `  ${i.quantity}x ${i.name} - ${(i.price * i.quantity).toLocaleString()}F`
                ).join('\n');

                await reply(`✅ Ajouté :\n${itemsList}\n\n💰 Nouveau total : *${session.order.total.toLocaleString()} F*\n\nAutre chose ? (Oui/Non)`);
            } else {
                await reply(result.message || '❓ Dites "Oui" pour ajouter autre chose, ou "Non" pour continuer.');
            }
        }

        // Choisir le mode de service
        async function handleMode() {
            const modes = { '1': 'delivery', '2': 'takeaway', '3': 'on_site' };
            const mode = modes[text];
            if (!mode) {
                await reply('❌ Tapez 1, 2 ou 3');
                return;
            }

            session.order.mode = mode;

            if (mode === 'delivery') {
                session.state = 'ADDRESS';
                await reply('📍 *Adresse de livraison complète ?*\n_(Ex: Hippodrome, Rue 100, face pharmacie)_');
            } else if (mode === 'takeaway') {
                session.state = 'TIME';
                await reply('⏱️ *Dans combien de temps passez-vous ?*\n_(Ex: 30 min, 1h)_');
            } else {
                session.state = 'TABLE';
                await reply('🪑 *Un indice pour vous trouver ?*\n_(Ex: Table près fenêtre, chemise bleue)_');
            }
        }

        // Récapitulatif et paiement
async function showRecap() {
    // 🆕 Frais de livraison UNIQUEMENT pour le mode "delivery"
    let deliveryFee = 0;

    if (session.order.mode === 'delivery') {
        const deliveryZones = JSON.parse(restaurant.delivery_zones || '[]');
        deliveryFee = restaurant.delivery_fee_default;

        if (deliveryZones.length > 0 && session.order.address) {
            const addressLower = removeAccents(session.order.address.toLowerCase());
            log('🔍', `Recherche zone pour: "${session.order.address}"`);

            for (const zone of deliveryZones) {
                if (!zone.name) continue;
                const zoneLower = removeAccents(zone.name.toLowerCase());
                if (addressLower.includes(zoneLower) || zoneLower.includes(addressLower)) {
                    deliveryFee = zone.fee || 0;
                    log('✅', `Zone trouvée: ${zone.name} → ${deliveryFee}F`);
                    break;
                }
            }
        }
    }

    session.order.deliveryFee = deliveryFee;
    session.order.total = session.order.subtotal + deliveryFee;
    session.state = 'WAITING_PAYMENT';

    let recap = `📋 *RÉCAPITULATIF DE VOTRE COMMANDE*\n\n`;
    
    session.order.items.forEach(i => {
        recap += `  • ${i.quantity}x ${i.name} - ${(i.price * i.quantity).toLocaleString()} F\n`;
    });

    // Affiche le mode et les frais éventuels
    if (session.order.mode === 'delivery') {
        if (deliveryFee > 0) {
            recap += `\n  🛵 Livraison : ${deliveryFee.toLocaleString()} F`;
        } else {
            recap += `\n  🛵 Livraison : *OFFERTE* 🎉`;
        }
    } else if (session.order.mode === 'takeaway') {
        recap += `\n  🛍️ Mode : À emporter`;
    } else {
        recap += `\n  🍽️ Mode : Sur place`;
    }

    recap += `\n\n💰 *TOTAL À PAYER : ${session.order.total.toLocaleString()} F*\n\n`;
    recap += `💳 *PAIEMENT*\n\n`;

    if (restaurant.wave_active && restaurant.wave_numero) {
        recap += `🟠 *Wave*\n   📱 ${restaurant.wave_numero}\n   👤 ${restaurant.wave_nom}\n\n`;
    }
    if (restaurant.orange_active && restaurant.orange_numero) {
        recap += `🟠 *Orange Money*\n   📱 ${restaurant.orange_numero}\n\n`;
    }
    if (restaurant.moov_active && restaurant.moov_numero) {
        recap += `🟣 *Moov Money*\n   📱 ${restaurant.moov_numero}\n\n`;
    }

    recap += `📸 *Envoyez la capture d'écran du paiement pour confirmer votre commande.*`;

    await reply(recap);
    log('💳', `Récapitulatif - Total: ${session.order.total}F (Mode: ${session.order.mode}, Livraison: ${deliveryFee}F)`);
}
    });

    try {
        await client.initialize();
        log('⏳', `${restaurant.name} - En attente du scan QR...`);
    } catch (e) {
        log('❌', `Erreur init: ${e.message}`);
    }
}

async function startAll() {
    setInterval(() => {
        const now = Date.now();
        for (const [id, s] of Object.entries(userSessions)) {
            if (now - s.lastActivity > 30 * 60 * 1000) delete userSessions[id];
        }
    }, 5 * 60 * 1000);

    const dir = path.join(__dirname, '../../data/sessions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const restaurants = query('SELECT * FROM restaurants WHERE is_active = 1');
    log('🤖', `${restaurants.length} restaurant(s)`);
    for (const r of restaurants) {
        await startBot(r.id);
        await new Promise(r => setTimeout(r, 2000));
    }
    log('✅', 'Tous les bots sont lancés');
}

async function startNewBot(id) { return startBot(id); }
async function stopBot(id) {
    if (bots[id]) {
        try { await bots[id].client.destroy(); } catch (e) {}
        bots[id] = null;
        run('UPDATE restaurants SET bot_status=? WHERE id=?', ['offline', id]);
    }
}

module.exports = { startAll, startNewBot, stopBot, bots };