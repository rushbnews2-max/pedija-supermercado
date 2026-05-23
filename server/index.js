import express from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDb, updateDb } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const tokens = new Set();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  if (req.body?.password !== adminPassword) {
    res.status(401).json({ message: 'Senha invalida' });
    return;
  }

  const token = crypto.randomUUID();
  tokens.add(token);
  res.json({ token });
});

app.post('/api/logout', requireAdmin, (req, res) => {
  const token = getToken(req);
  tokens.delete(token);
  res.status(204).end();
});

app.get('/api/public', async (_req, res) => {
  const db = await readDb();
  res.json({
    store: db.store,
    products: db.products.filter((product) => product.active)
  });
});

app.get('/api/public/orders/:id', async (req, res) => {
  const db = await readDb();
  const order = db.orders.find((item) => item.id === Number(req.params.id));

  if (!order) {
    res.status(404).json({ message: 'Pedido nao encontrado' });
    return;
  }

  res.json(order);
});

app.use('/api/bootstrap', requireAdmin);
app.use('/api/migrate-local', requireAdmin);
app.use('/api/establishments', requireAdmin);
app.use('/api/store', requireAdmin);
app.use('/api/products', requireAdmin);
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') return next();
  return requireAdmin(req, res, next);
});

app.get('/api/bootstrap', async (_req, res) => {
  const db = await readDb();
  res.json(withPlatformDefaults(db));
});

app.post('/api/migrate-local', async (req, res) => {
  const db = await updateDb((current) => ({
    ...current,
    store: req.body.store || current.store,
    establishments: current.establishments || buildDefaultEstablishments(current.store),
    products: Array.isArray(req.body.products) ? req.body.products : current.products,
    orders: Array.isArray(req.body.orders) ? req.body.orders : current.orders
  }));

  res.json(withPlatformDefaults(db));
});

app.get('/api/establishments', async (_req, res) => {
  const db = await readDb();
  res.json(withPlatformDefaults(db).establishments);
});

app.post('/api/establishments', async (req, res) => {
  const establishment = normalizeEstablishment({
    ...req.body,
    id: crypto.randomUUID()
  });

  await updateDb((current) => ({
    ...current,
    establishments: [establishment, ...(current.establishments || buildDefaultEstablishments(current.store))]
  }));

  res.status(201).json(establishment);
});

app.put('/api/establishments/:id', async (req, res) => {
  let saved;
  await updateDb((current) => {
    const establishments = current.establishments || buildDefaultEstablishments(current.store);
    return {
      ...current,
      establishments: establishments.map((item) => {
        if (item.id !== req.params.id) return item;
        saved = normalizeEstablishment({ ...item, ...req.body, id: item.id });
        return saved;
      })
    };
  });

  if (!saved) {
    res.status(404).json({ message: 'Estabelecimento nao encontrado' });
    return;
  }

  res.json(saved);
});

app.delete('/api/establishments/:id', async (req, res) => {
  await updateDb((current) => ({
    ...current,
    establishments: (current.establishments || buildDefaultEstablishments(current.store)).filter((item) => item.id !== req.params.id)
  }));

  res.status(204).end();
});

app.get('/api/store', async (_req, res) => {
  const db = await readDb();
  res.json(db.store);
});

app.put('/api/store', async (req, res) => {
  const db = await updateDb((current) => ({
    ...current,
    store: {
      ...current.store,
      ...req.body
    }
  }));

  res.json(db.store);
});

app.get('/api/products', async (_req, res) => {
  const db = await readDb();
  res.json(db.products);
});

app.post('/api/products', async (req, res) => {
  const product = {
    ...req.body,
    id: req.body.id || crypto.randomUUID(),
    price: Number(req.body.price || 0),
    stock: Number(req.body.stock || 0)
  };

  await updateDb((current) => ({
    ...current,
    products: [product, ...current.products]
  }));

  res.status(201).json(product);
});

app.post('/api/products/import', async (req, res) => {
  const products = Array.isArray(req.body.products) ? req.body.products : [];
  const category = req.body.category || 'Sem categoria';
  const db = await updateDb((current) => {
    const currentCodes = new Set(current.products.map((product) => String(product.code || '').trim()).filter(Boolean));
    const newProducts = products
      .filter((product) => !currentCodes.has(String(product.code || '').trim()))
      .map((product) => ({
        id: crypto.randomUUID(),
        code: product.code || '',
        name: product.name,
        price: Number(product.price || 0),
        category,
        image: '',
        promo: false,
        active: true,
        stock: 0
      }));

    return {
      ...current,
      products: [...newProducts, ...current.products]
    };
  });

  res.status(201).json(db.products);
});

app.put('/api/products/:id', async (req, res) => {
  const db = await updateDb((current) => ({
    ...current,
    products: current.products.map((product) => product.id === req.params.id ? {
      ...product,
      ...req.body,
      price: Number(req.body.price || 0),
      stock: Number(req.body.stock || 0)
    } : product)
  }));

  res.json(db.products.find((product) => product.id === req.params.id));
});

app.delete('/api/products/:id', async (req, res) => {
  await updateDb((current) => ({
    ...current,
    products: current.products.filter((product) => product.id !== req.params.id)
  }));

  res.status(204).end();
});

app.get('/api/orders', async (_req, res) => {
  const db = await readDb();
  res.json(db.orders);
});

app.post('/api/orders', async (req, res) => {
  const db = await updateDb((current) => {
    const nextId = Math.max(...current.orders.map((order) => order.id), 0) + 1;
    const order = {
      ...req.body,
      id: nextId,
      status: req.body.status || 'Pendente',
      createdAt: req.body.createdAt || new Date().toLocaleString('pt-BR')
    };

    return {
      ...current,
      orders: [order, ...current.orders]
    };
  });

  res.status(201).json(db.orders[0]);
});

app.put('/api/orders/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const db = await updateDb((current) => ({
    ...current,
    orders: current.orders.map((order) => order.id === id ? { ...order, status: req.body.status } : order)
  }));

  res.json(db.orders.find((order) => order.id === id));
});

app.delete('/api/orders/:id', async (req, res) => {
  const id = Number(req.params.id);
  await updateDb((current) => ({
    ...current,
    orders: current.orders.filter((order) => order.id !== id)
  }));

  res.status(204).end();
});

app.use(express.static(join(__dirname, '..', 'dist')));

app.get(/.*/, (_req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`PediJa online server running on port ${port}`);
});

function requireAdmin(req, res, next) {
  const token = getToken(req);
  if (!token || !tokens.has(token)) {
    res.status(401).json({ message: 'Acesso administrativo necessario' });
    return;
  }

  next();
}

function getToken(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function withPlatformDefaults(db) {
  return {
    ...db,
    store: {
      segment: 'supermercado',
      ...db.store
    },
    establishments: db.establishments || buildDefaultEstablishments(db.store)
  };
}

function buildDefaultEstablishments(store) {
  return [normalizeEstablishment({
    id: 'store-main',
    name: store?.name || 'Novo estabelecimento',
    segment: store?.segment || 'supermercado',
    plan: 'Basico',
    status: 'Ativo',
    phone: store?.phone || '',
    catalogSlug: store?.catalogSlug || 'catalogo',
    adminUser: 'admin'
  })];
}

function normalizeEstablishment(value) {
  return {
    id: value.id,
    name: value.name || 'Novo estabelecimento',
    segment: value.segment || 'supermercado',
    plan: value.plan || 'Basico',
    status: value.status || 'Ativo',
    phone: value.phone || '',
    catalogSlug: slugify(value.catalogSlug || value.name || 'catalogo'),
    adminUser: value.adminUser || ''
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'catalogo';
}
