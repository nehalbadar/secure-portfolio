const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const crypto = require('crypto');
const { z } = require('zod');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.disable('x-powered-by');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(morgan('dev'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    },
    referrerPolicy: { policy: 'no-referrer' }
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '100kb' }));

app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-only-secret'));

function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
  return token;
}

function verifyCsrfToken(req) {
  const cookieToken = typeof req.cookies?.csrf_token === 'string' ? req.cookies.csrf_token : '';
  const bodyToken = typeof req.body?._csrf === 'string' ? req.body._csrf : '';

  if (!cookieToken || !bodyToken) return false;
  if (cookieToken.length !== bodyToken.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(bodyToken));
  } catch {
    return false;
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Secure Reference App',
    now: new Date().toISOString()
  });
});

app.get('/search', (req, res) => {
  // Demonstrates safe reflection (template auto-escaping).
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.render('search', { title: 'Safe Search', q });
});

app.get('/comment', (req, res) => {
  const csrfToken = issueCsrfToken(res);
  res.render('comment', {
    title: 'CSRF-Protected Form',
    csrfToken,
    errors: [],
    values: { name: '', comment: '' },
    saved: null
  });
});

const CommentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name is too long'),
  comment: z
    .string()
    .trim()
    .min(1, 'Comment is required')
    .max(500, 'Comment is too long')
});

app.post('/comment', (req, res) => {
  if (!verifyCsrfToken(req)) {
    return res.status(403).send('Forbidden (invalid CSRF token).');
  }

  const parsed = CommentSchema.safeParse({
    name: req.body?.name,
    comment: req.body?.comment
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => i.message);
    return res.status(400).render('comment', {
      title: 'CSRF-Protected Form',
      csrfToken: issueCsrfToken(res),
      errors,
      values: {
        name: typeof req.body?.name === 'string' ? req.body.name : '',
        comment: typeof req.body?.comment === 'string' ? req.body.comment : ''
      },
      saved: null
    });
  }

  // In a real app you would persist this safely (parameterized queries / ORM).
  // For the lab we just echo back safely through the template.
  return res.render('comment', {
    title: 'CSRF-Protected Form',
    csrfToken: issueCsrfToken(res),
    errors: [],
    values: { name: '', comment: '' },
    saved: parsed.data
  });
});

app.get('/api/profile', (req, res) => {
  // Demonstrates input validation for API endpoints.
  const schema = z.object({
    id: z.string().regex(/^\d+$/, 'id must be numeric')
  });

  const parsed = schema.safeParse({ id: req.query?.id });
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Example safe lookup (no SQL here; just a stand-in).
  const id = Number(parsed.data.id);
  const users = [
    { id: 1, name: 'Alice', role: 'user' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Charlie', role: 'admin' }
  ];

  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'Not found' });

  return res.json({ user });
});

app.use((err, req, res, next) => {
  // Avoid leaking stack traces in responses.
  console.error(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Secure reference app listening on http://127.0.0.1:${PORT}`);
});
