import express from 'express';
import authRoutes from './auth';
import fileRoutes from './fileRoutes';

const router = express.Router();

// Use sub-routes
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

export default router;
