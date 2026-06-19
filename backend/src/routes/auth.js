const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOne } = require('../database');

// Middleware d'authentification
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requis' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'Token invalide' });
    }
}

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const admin = getOne('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    
    res.json({
        token,
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        }
    });
});

// Vérifier le token
router.get('/me', auth, (req, res) => {
    const admin = getOne('SELECT id, name, email, role FROM admins WHERE id = ?', [req.user.id]);
    if (!admin) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(admin);
});

module.exports = router;
module.exports.auth = auth;