import { Router } from 'express';
import { addReview } from '../lib/content.js';

const router = Router();

router.post('/', async (req, res) => {
  const { propertyId, propertyTitle, reviewerName, rating, reviewText } = req.body || {};

  if (propertyId === undefined || propertyId === null || propertyId === '') {
    return res.status(400).json({ error: 'Missing propertyId.' });
  }
  if (typeof propertyTitle !== 'string' || !propertyTitle.trim()) {
    return res.status(400).json({ error: 'Missing propertyTitle.' });
  }
  if (typeof reviewerName !== 'string' || !reviewerName.trim() || reviewerName.length > 100) {
    return res.status(400).json({ error: 'Name is required (max 100 characters).' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer from 1 to 5.' });
  }
  if (typeof reviewText !== 'string' || reviewText.trim().length < 10 || reviewText.length > 1000) {
    return res.status(400).json({ error: 'Review text must be 10-1000 characters.' });
  }

  const review = {
    id: 'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    propertyId,
    propertyTitle: propertyTitle.trim(),
    reviewerName: reviewerName.trim(),
    rating,
    reviewText: reviewText.trim(),
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  };

  try {
    const found = await addReview(review);
    if (!found) return res.status(404).json({ error: 'No content published yet.' });
    return res.status(200).json({ ok: true, review });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
});

export default router;
