import express from 'express';
import { register, login, getUser, authenticateJWT, logout, requireRole } from '../controllers/authController';
import csurf from 'csurf';
const router = express.Router();


const csrfProtection = csurf({
    cookie: true
  });

router.post('/register', register);
router.post('/login', login);
router.post('/loginProtect',csrfProtection, login);
router.get('/me', authenticateJWT, getUser);
router.get('/logout', logout);

// Example of a protected route that only 'admin' can access
router.get('/admin-only', authenticateJWT, requireRole(['admin']), (req, res) => {
    res.send('This is an admin-only area.');
});

// You can also combine multiple roles
router.get('/multi-role-endpoint', authenticateJWT, requireRole(['admin', 'seller']), (req, res) => {
    res.send('This area is accessible by both admin and seller roles.');
});

export default router;