import { getDb } from './db.js';

const SITE_DOC_ID = 'site';

export async function getContent() {
  const db = await getDb();
  const doc = await db.collection('content').findOne({ _id: SITE_DOC_ID });
  return doc ? doc.data : null;
}

export async function saveContent(data) {
  const db = await getDb();
  await db.collection('content').updateOne(
    { _id: SITE_DOC_ID },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true },
  );
}

// Appends a single review directly (no auth required to call this — see
// routes/submitReview.js), rather than going through the full-document
// save-content flow, since a site visitor has no admin token to authorize
// that endpoint with.
export async function addReview(review) {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection('content').updateOne(
    { _id: SITE_DOC_ID },
    {
      $push: { 'data.reviews': { $each: [review], $position: 0 } },
      $set: { 'data._meta.updatedAt': now.toISOString(), updatedAt: now },
    },
  );
  return result.matchedCount > 0;
}

export async function saveImage(path, buffer, contentType) {
  const db = await getDb();
  await db.collection('images').updateOne(
    { _id: path },
    { $set: { data: buffer, contentType, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function getImage(path) {
  const db = await getDb();
  return db.collection('images').findOne({ _id: path });
}
