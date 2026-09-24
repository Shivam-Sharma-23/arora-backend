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
