import express from 'express';
import authRoutes from './auth';

const router = express.Router();

// Use sub-routes
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

export default router;
