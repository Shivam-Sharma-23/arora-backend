import { Router } from 'express';
import { signToken } from '../lib/auth.js';

const router = Router();

router.post('/', (req, res) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.TOKEN_SECRET;
  if (!expectedPassword || !secret) {
    return res.status(500).json({ error: 'Admin login is not configured (missing ADMIN_PASSWORD/TOKEN_SECRET).' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string' || password !== expectedPassword) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = signToken({ role: 'admin' }, secret);
  return res.status(200).json({ token });
});

export default router;
