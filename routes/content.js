import { Router } from 'express';
import { getContent } from '../lib/content.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await getContent();
    if (!data) return res.status(404).json({ error: 'No content published yet.' });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
});

export default router;
