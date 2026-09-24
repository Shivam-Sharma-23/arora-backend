import express from 'express';
import cors from 'cors';
import adminLoginRoute from './routes/adminLogin.js';
import saveContentRoute from './routes/saveContent.js';

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8888'];

function allowedOrigins() {
  const configured = process.env.ALLOWED_ORIGIN;
  if (!configured) return DEV_ORIGINS;
  return configured.split(',').map((o) => o.trim()).filter(Boolean);
}

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins().includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
  }),
);

app.use(express.json({ limit: '200mb' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  return next(err);
});

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use('/admin-login', adminLoginRoute);
app.use('/save-content', saveContentRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Final catch-all, e.g. CORS rejections from the origin callback above.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: String(err.message || err) });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log('Backend listening on port ' + port);
});
