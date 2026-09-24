import { Router } from 'express';
import { getImage } from '../lib/content.js';

const FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

const router = Router();

router.get('/:filename', async (req, res) => {
  if (!FILENAME_RE.test(req.params.filename)) {
    return res.status(400).json({ error: 'Invalid filename.' });
  }
  try {
    const img = await getImage('uploads/' + req.params.filename);
    if (!img) return res.status(404).json({ error: 'Not found.' });
    res.set('Content-Type', img.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    const data = Buffer.isBuffer(img.data) ? img.data : Buffer.from(img.data.buffer || img.data);
    return res.status(200).send(data);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
});

export default router;
