/**
 * RestoBot - Parseur de commandes intelligent (mode hybride)
 * 
 * - Mode IA (Gemini) : si la clé API est valide
 * - Mode Mots-clés : fallback automatique si l'IA échoue
 * - Gère le singulier/pluriel, les quantités en chiffres et en lettres
 * - 100% fonctionnel, même sans connexion externe
 */

// Essaie de charger Gemini, mais ne plante pas si absent
let genAI = null;
let iaActive = false;

try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza')) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        iaActive = true;
        console.log('✅ IA Gemini activée');
    } else {
        console.log('⚠️ Clé Gemini invalide ou absente - Mode mots-clés activé');
    }
} catch (e) {
    console.log('⚠️ Module Gemini non installé - Mode mots-clés activé');
}

// ============================================================
// HELPERS
// ============================================================

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Trouve un produit dans le menu, gère singulier/pluriel
 */
function findProduct(menuProducts, searchName) {
    const s = searchName.toLowerCase().trim();
    
    // Correspondance exacte
    let product = menuProducts.find(p => p.name.toLowerCase() === s);
    if (product) return product;
    
    // Cherche le mot le plus long qui correspond
    const searchWords = s.split(/\s+/);
    
    // Essaie chaque mot de la recherche
    for (const word of searchWords) {
        if (word.length < 3) continue;
        
        // Variations singulier/pluriel
        const variations = [word, word + 's', word.replace(/s$/, ''), word.replace(/x$/, ''), word + 'x'];
        
        for (const variation of variations) {
            product = menuProducts.find(p => {
                const pWords = p.name.toLowerCase().split(/\s+/);
                return pWords.some(w => w === variation || (variation.length >= 4 && w.startsWith(variation)));
            });
            if (product) return product;
        }
    }
    
    // Correspondance partielle (le nom du produit contient le mot recherché)
    if (s.length >= 3) {
        product = menuProducts.find(p => p.name.toLowerCase().includes(s));
        if (product) return product;
    }
    
    return null;
}

/**
 * Vérifie si le texte contient le nom d'un produit (singulier/pluriel)
 */
function textIncludesProduct(text, productName) {
    const t = ' ' + text.toLowerCase() + ' ';
    const p = productName.toLowerCase();
    
    // Correspondance exacte
    if (t.includes(' ' + p + ' ') || t.includes(' ' + p + 's ') || t.includes(' ' + p + 'x ')) return true;
    
    // Mots individuels du produit
    const pWords = p.split(/\s+/);
    
    // Cherche si tous les mots significatifs sont présents
    const significantWords = pWords.filter(w => w.length >= 3);
    if (significantWords.length === 0) return false;
    
    const allFound = significantWords.every(word => {
        const variations = [word, word + 's', word.replace(/s$/, ''), word.replace(/x$/, '')];
        return variations.some(v => t.includes(' ' + v + ' ') || t.includes(' ' + v + ',') || t.includes(' ' + v + '.'));
    });
    
    return allFound;
}

// ============================================================
// MODE IA (GEMINI)
// ============================================================

async function parseWithAI(menuProducts, userMessage, conversationHistory = []) {
    const menuText = menuProducts.map(p =>
        `ID:${p.id} | ${p.name} | ${p.price}F | Catégorie:${p.category_type || 'plat'}`
    ).join('\n');

    const historyText = conversationHistory.length > 0
        ? '\nHISTORIQUE DE LA CONVERSATION:\n' + conversationHistory.slice(-3).join('\n')
        : '';

    const prompt = `Tu es un assistant de commande pour un restaurant malien.

MENU :
${menuText}
${historyText}

MESSAGE DU CLIENT : "${userMessage}"

Retourne UNIQUEMENT ce JSON (pas de markdown, pas de texte autour) :
{
  "type": "order|question|greeting|unclear",
  "items": [{ "id": number, "name": string, "quantity": number, "price": number }],
  "total": number,
  "message": string
}

RÈGLES :
- Comprends le français malien : "donne-moi", "je veux", "amène", "c'est tout"
- "deux"=2, "trois"=3, "quatre"=4, "cinq"=5, "dix"=10
- Si le produit est dans le menu, utilise son ID exact et son prix
- Si le produit n'est PAS dans le menu, mets id:0 et suggère dans le message
- Le total = somme exacte de (prix × quantité) pour chaque item
- Message en français convivial qui liste ce que le client a commandé
- Salutations (bonjour, salut, salam) → type:"greeting"
- RÉPONDS UNIQUEMENT AVEC LE JSON, pas d'autre texte`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/```/g, '')
        .trim();

    const parsed = JSON.parse(text);

    return {
        success: true,
        type: parsed.type || 'order',
        items: parsed.items || [],
        total: parsed.total || 0,
        message: parsed.message || 'Commande comprise',
        source: 'ia'
    };
}

// ============================================================
// MODE MOTS-CLÉS (FALLBACK)
// ============================================================

function parseWithKeywords(menuProducts, userMessage) {
    const text = ' ' + userMessage.toLowerCase().trim() + ' ';
    const items = [];
    const found = new Set();

    const numberWords = {
        'un ': 1, 'une ': 1, 'deux ': 2, 'trois ': 3, 'quatre ': 4,
        'cinq ': 5, 'six ': 6, 'sept ': 7, 'huit ': 8, 'neuf ': 9, 'dix ': 10,
        'onze ': 11, 'douze ': 12, 'quinze ': 15, 'vingt ': 20
    };

    // === STRATÉGIE 1 : Cherche les quantités explicites "2 poulet", "1 frite" ===
    const quantityPattern = /(\d+)\s+([a-zéèêëàâîïôûùç\s]{2,30}?)(?=\s+\d+|$|\s+et\s+|\s+et$|,|\.)/gi;
    let match;

    while ((match = quantityPattern.exec(text)) !== null) {
        const qty = parseInt(match[1]);
        const itemName = match[2].trim();

        const product = findProduct(menuProducts, itemName);
        if (product && !found.has(product.id)) {
            found.add(product.id);
            items.push({
                id: product.id,
                name: product.name,
                quantity: qty,
                price: product.price,
                category_type: product.category_type || 'plat'
            });
        }
    }

    // === STRATÉGIE 2 : Cherche les quantités en lettres "deux poulets", "trois frites" ===
    if (items.length === 0) {
        for (const [word, num] of Object.entries(numberWords)) {
            const letterPattern = new RegExp(word + '\\s*([a-zéèêëàâîïôûùç]{3,30})', 'gi');
            while ((match = letterPattern.exec(text)) !== null) {
                const itemName = match[1].trim();
                const product = findProduct(menuProducts, itemName);
                if (product && !found.has(product.id)) {
                    found.add(product.id);
                    items.push({
                        id: product.id,
                        name: product.name,
                        quantity: num,
                        price: product.price,
                        category_type: product.category_type || 'plat'
                    });
                }
            }
        }
    }

    // === STRATÉGIE 3 : Cherche les items sans quantité explicite (quantité = 1) ===
    if (items.length === 0) {
        // Cherche d'abord le mot "et" pour séparer les items
        const parts = text.split(/\s+et\s+/);
        
        for (const part of parts) {
            // Extrait les mots significatifs
            const words = part.trim().split(/[\s,.-]+/).filter(w => w.length >= 3);
            
            for (const product of menuProducts) {
                if (found.has(product.id)) continue;
                
                if (textIncludesProduct(part, product.name)) {
                    found.add(product.id);
                    items.push({
                        id: product.id,
                        name: product.name,
                        quantity: 1,
                        price: product.price,
                        category_type: product.category_type || 'plat'
                    });
                    break; // Un seul produit par partie
                }
            }
        }
    }

    // === STRATÉGIE 4 : Correspondance par mot-clé (dernier recours) ===
    if (items.length === 0) {
        const words = text.split(/[\s,.\-!?]+/).filter(w => w.length >= 3);
        
        for (const word of words) {
            for (const product of menuProducts) {
                if (found.has(product.id)) continue;
                
                const productWords = product.name.toLowerCase().split(/\s+/);
                const match = productWords.some(pw => {
                    const variations = [pw, pw + 's', pw.replace(/s$/, ''), pw.replace(/x$/, '')];
                    return variations.some(v => v === word || (word.length >= 4 && v.startsWith(word)));
                });
                
                if (match) {
                    found.add(product.id);
                    items.push({
                        id: product.id,
                        name: product.name,
                        quantity: 1,
                        price: product.price,
                        category_type: product.category_type || 'plat'
                    });
                    break;
                }
            }
        }
    }

    return items;
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

async function parseOrder(menuProducts, userMessage, conversationHistory = []) {
    const trimmedMessage = userMessage.trim();

    // Détection de salutations
    const greetings = ['bonjour', 'salut', 'salam', 'hey', 'coucou', 'bjr', 'bsr', 'bonsoir', 'hello', 'hi', 'bonjour/bonsoir'];
    if (greetings.includes(trimmedMessage.toLowerCase())) {
        return {
            success: true,
            type: 'greeting',
            items: [],
            total: 0,
            message: '👋 Bonjour ! Dites-moi ce que vous voulez commander.\n\n_Exemple : "2 poulet braisé, 1 coca, frites"_',
            source: 'local'
        };
    }

    // Détection de "menu"
    if (trimmedMessage.toLowerCase() === 'menu') {
        return {
            success: true,
            type: 'question',
            items: [],
            total: 0,
            message: '📋 Voici notre menu !',
            source: 'local'
        };
    }

    // Détection de remerciements
    const thanks = ['merci', 'thanks', 'ok merci', 'ok', 'okay', 'daccord', 'd\'accord', 'parfait', 'super', 'top', 'nickel'];
    if (thanks.includes(trimmedMessage.toLowerCase())) {
        return {
            success: true,
            type: 'greeting',
            items: [],
            total: 0,
            message: '😊 Avec plaisir ! Tapez "Menu" pour voir nos plats.',
            source: 'local'
        };
    }

    // 1. Essaie l'IA d'abord
    if (iaActive) {
        try {
            const result = await parseWithAI(menuProducts, trimmedMessage, conversationHistory);
            return result;
        } catch (error) {
            console.log('⚠️ IA échouée, passage en mode mots-clés:', error.message.substring(0, 80));
        }
    }

    // 2. Fallback : mode mots-clés
    const items = parseWithKeywords(menuProducts, trimmedMessage);

    if (items.length === 0) {
        const suggestions = menuProducts.slice(0, 8).map(p => `${p.emoji || ''} ${p.name}`).join(', ');
        return {
            success: false,
            type: 'unclear',
            items: [],
            total: 0,
            message: `❌ Je n'ai pas trouvé ces produits dans notre menu.\n\n📋 Voici ce que nous proposons : ${suggestions}...\n\n💬 Réécrivez votre commande. Par exemple : "2 poulet, 1 coca, frites"`,
            source: 'local'
        };
    }

    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const itemsList = items.map(i =>
        `  ${i.emoji || ''} ${i.quantity}x ${i.name} - ${(i.price * i.quantity).toLocaleString()}F`
    ).join('\n');

    return {
        success: true,
        type: 'order',
        items,
        total,
        message: `J'ai noté :\n${itemsList}\n\n💰 Total : *${total.toLocaleString()}F*`,
        source: iaActive ? 'ia-fallback' : 'local'
    };
}

// ============================================================
// MESSAGE DE BIENVENUE
// ============================================================

async function generateWelcomeMessage(name, slogan) {
    if (iaActive) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `Tu es un restaurant malien "${name}". Slogan: "${slogan}". Écris un message WhatsApp de bienvenue chaleureux en 2-3 phrases avec emojis. Termine par "Écrivez 'Menu' pour voir nos plats !"`;
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (e) {
            // Fallback silencieux
        }
    }

    return `👋 *Bienvenue chez ${name} !*\n\n${slogan || 'Les meilleurs plats de Bamako ! 🍽️'}\n\n📋 Écrivez *"Menu"* pour voir nos plats avec photos\n💬 Ou dites-moi directement ce que vous voulez commander !\n\n_Exemple : "2 poulet braisé, 1 coca, frites"_`;
}

module.exports = { parseOrder, generateWelcomeMessage };