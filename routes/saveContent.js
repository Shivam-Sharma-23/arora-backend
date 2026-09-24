import { Router } from 'express';
import { verifyToken } from '../lib/auth.js';
import { saveContent, saveImage } from '../lib/content.js';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES_PER_SAVE = 20;
const IMAGE_PATH_RE = /^uploads\/[a-zA-Z0-9._-]+$/;

const router = Router();

router.post('/', async (req, res) => {
  const secret = process.env.TOKEN_SECRET;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!secret || !verifyToken(token, secret)) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
  }

  const { content, images = [] } = req.body || {};
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({ error: 'Missing content.' });
  }
  if (!Array.isArray(images) || images.length > MAX_IMAGES_PER_SAVE) {
    return res.status(400).json({ error: 'Too many images in one save.' });
  }
  for (const img of images) {
    if (!img || typeof img.path !== 'string' || !IMAGE_PATH_RE.test(img.path)) {
      return res.status(400).json({ error: 'Invalid image path.' });
    }
    if (typeof img.base64 !== 'string' || !img.base64 || Buffer.byteLength(img.base64, 'base64') > MAX_IMAGE_BYTES) {
      return res.status(400).json({ error: 'Image missing or larger than 8MB.' });
    }
  }

  try {
    for (const img of images) {
      await saveImage(img.path, Buffer.from(img.base64, 'base64'), img.contentType || 'application/octet-stream');
    }
    await saveContent(content);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
});

export default router;
