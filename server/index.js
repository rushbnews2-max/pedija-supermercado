import express from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDb, updateDb } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const tokens = new Map();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const requestedSlug = String(req.body?.catalogSlug || '').trim();
  const catalogSlug = requestedSlug ? slugify(requestedSlug) : '';

  if (catalogSlug) {
    ensurePlatformDefaults().then((db) => {
      const establishment = withPlatformDefaults(db).establishments.find((item) => item.catalogSlug === catalogSlug);
      const user = String(req.body?.user || '').trim();
      const expectedUser = String(establishment?.adminUser || 'admin').trim();
      if (!establishment || user !== expectedUser || req.body?.password !== establishment.adminPassword) {
        res.status(401).json({ message: 'Senha invalida' });
        return;
      }

      const token = crypto.randomUUID();
      tokens.set(token, { role: 'store', establishmentId: establishment.id });
      res.json({ token, role: 'store', establishmentId: establishment.id });
    }).catch(() => res.status(500).json({ message: 'Erro ao entrar' }));
    return;
  }

  if (req.body?.password !== adminPassword) {
    res.status(401).json({ message: 'Senha invalida' });
    return;
  }

  const token = crypto.randomUUID();
  tokens.set(token, { role: 'master' });
  res.json({ token, role: 'master' });
});

app.post('/api/logout', requireAdmin, (req, res) => {
  const token = getToken(req);
  tokens.delete(token);
  res.status(204).end();
});

app.get('/api/public', async (req, res) => {
  const db = await readDb();
  const scoped = getPublicStore(db, req.query.slug);
  res.json({
    store: scoped.store,
    products: scoped.products.filter((product) => product.active)
  });
});

app.get('/api/public/orders/:id', async (req, res) => {
  const db = await readDb();
  const data = withPlatformDefaults(db);
  const id = Number(req.params.id);
  const scoped = req.query.slug ? getPublicStore(data, req.query.slug) : null;
  const order = scoped
    ? scoped.orders.find((item) => item.id === id)
    : [
      ...(data.orders || []),
      ...data.establishments.flatMap((item) => item.orders || [])
    ].find((item) => item.id === id);

  if (!order) {
    res.status(404).json({ message: 'Pedido nao encontrado' });
    return;
  }

  res.json(order);
});

app.use('/api/bootstrap', requireAdmin);
app.use('/api/migrate-local', requireAdmin);
app.use('/api/establishments', requireMaster);
app.use('/api/store', requireAdmin);
app.use('/api/products', requireAdmin);
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') return next();
  return requireAdmin(req, res, next);
});

app.get('/api/bootstrap', async (req, res) => {
  const db = await ensurePlatformDefaults();
  const session = getSession(req);
  const data = withPlatformDefaults(db);

  if (session.role === 'store') {
    const scoped = getStoreBySession(data, session);
    res.json({
      role: 'store',
      store: scoped.store,
      products: scoped.products,
      orders: scoped.orders
    });
    return;
  }

  res.json({
    ...data,
    role: 'master',
    products: [],
    orders: []
  });
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
  const db = await ensurePlatformDefaults();
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
  const scoped = getStoreBySession(withPlatformDefaults(db), getSession(_req));
  res.json(scoped.store);
});

app.put('/api/store', async (req, res) => {
  const session = getSession(req);
  let saved;
  await updateDb((current) => {
    if (session.role === 'store') {
      return updateStoreEstablishment(current, session.establishmentId, (establishment) => {
        saved = {
          ...establishmentToStore(establishment),
          ...establishment.store,
          ...req.body
        };
        return {
          ...establishment,
          name: saved.name,
          phone: saved.phone,
          catalogSlug: saved.catalogSlug,
          segment: saved.segment,
          store: saved
        };
      });
    }

    saved = { ...current.store, ...req.body };
    return { ...current, store: saved };
  });

  res.json(saved);
});

app.get('/api/products', async (req, res) => {
  const db = await readDb();
  res.json(getStoreBySession(withPlatformDefaults(db), getSession(req)).products);
});

app.post('/api/products', async (req, res) => {
  const session = getSession(req);
  const product = {
    ...req.body,
    id: req.body.id || crypto.randomUUID(),
    price: Number(req.body.price || 0),
    stock: Number(req.body.stock || 0)
  };

  await updateDb((current) => updateScopedProducts(current, session, (products) => [product, ...products]));

  res.status(201).json(product);
});

app.post('/api/products/import', async (req, res) => {
  const session = getSession(req);
  const products = Array.isArray(req.body.products) ? req.body.products : [];
  const category = req.body.category || 'Sem categoria';
  let savedProducts = [];
  const db = await updateDb((current) => {
    const scopedProducts = getStoreBySession(withPlatformDefaults(current), session).products;
    const currentCodes = new Set(scopedProducts.map((product) => String(product.code || '').trim()).filter(Boolean));
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
    savedProducts = [...newProducts, ...scopedProducts];

    return updateScopedProducts(current, session, () => savedProducts);
  });

  res.status(201).json(savedProducts || db.products);
});

app.put('/api/products/:id', async (req, res) => {
  const session = getSession(req);
  let saved;
  await updateDb((current) => updateScopedProducts(current, session, (products) => products.map((product) => {
    if (product.id !== req.params.id) return product;
    saved = {
      ...product,
      ...req.body,
      price: Number(req.body.price || 0),
      stock: Number(req.body.stock || 0)
    };
    return saved;
  })));

  res.json(saved);
});

app.delete('/api/products/:id', async (req, res) => {
  const session = getSession(req);
  await updateDb((current) => updateScopedProducts(current, session, (products) => products.filter((product) => product.id !== req.params.id)));

  res.status(204).end();
});

app.get('/api/orders', async (req, res) => {
  const db = await readDb();
  res.json(getStoreBySession(withPlatformDefaults(db), getSession(req)).orders);
});

app.post('/api/orders', async (req, res) => {
  const storeSlug = slugify(req.body.storeSlug || '');
  const db = await updateDb((current) => {
    const scoped = storeSlug ? getPublicStore(current, storeSlug) : { orders: current.orders };
    const nextId = Math.max(...scoped.orders.map((order) => order.id), 0) + 1;
    const order = {
      ...req.body,
      id: nextId,
      status: req.body.status || 'Pendente',
      createdAt: req.body.createdAt || new Date().toLocaleString('pt-BR')
    };

    if (storeSlug) {
      return updateStoreEstablishment(current, scoped.establishmentId, (establishment) => ({
        ...establishment,
        orders: [order, ...(establishment.orders || [])]
      }));
    }

    return { ...current, orders: [order, ...current.orders] };
  });

  const saved = storeSlug ? getPublicStore(db, storeSlug).orders[0] : db.orders[0];
  res.status(201).json(saved);
});

app.put('/api/orders/:id/status', async (req, res) => {
  const session = getSession(req);
  const id = Number(req.params.id);
  let saved;
  await updateDb((current) => updateScopedOrders(current, session, (orders) => orders.map((order) => {
    if (order.id !== id) return order;
    saved = { ...order, status: req.body.status };
    return saved;
  })));

  res.json(saved);
});

app.delete('/api/orders/:id', async (req, res) => {
  const session = getSession(req);
  const id = Number(req.params.id);
  await updateDb((current) => updateScopedOrders(current, session, (orders) => orders.filter((order) => order.id !== id)));

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

function requireMaster(req, res, next) {
  const session = getSession(req);
  if (session.role !== 'master') {
    res.status(403).json({ message: 'Acesso master necessario' });
    return;
  }

  next();
}

function getToken(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function getSession(req) {
  return tokens.get(getToken(req)) || {};
}

async function ensurePlatformDefaults() {
  return updateDb((current) => withPlatformDefaults(current));
}

function withPlatformDefaults(db) {
  const establishments = db.establishments || buildDefaultEstablishments(db.store);

  return {
    ...db,
    store: {
      segment: 'supermercado',
      ...db.store
    },
    establishments: establishments.map((item) => normalizeEstablishment({
      ...item,
      store: item.store || (item.id === 'store-main' ? db.store : undefined),
      products: Array.isArray(item.products) ? item.products : (item.id === 'store-main' ? db.products : []),
      orders: Array.isArray(item.orders) ? item.orders : (item.id === 'store-main' ? db.orders : [])
    }))
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
    adminUser: 'admin',
    adminPassword: 'admin123',
    store,
    products: [],
    orders: []
  })];
}

function normalizeEstablishment(value) {
  const store = {
    ...establishmentToStore(value),
    ...(value.store || {})
  };

  return {
    id: value.id,
    name: value.name || 'Novo estabelecimento',
    segment: value.segment || 'supermercado',
    plan: value.plan || 'Basico',
    status: value.status || 'Ativo',
    phone: value.phone || '',
    catalogSlug: slugify(value.catalogSlug || value.name || 'catalogo'),
    adminUser: value.adminUser || 'admin',
    adminPassword: value.adminPassword || generateAccessPassword(),
    store,
    products: Array.isArray(value.products) ? value.products : [],
    orders: Array.isArray(value.orders) ? value.orders : []
  };
}

function generateAccessPassword() {
  return crypto.randomUUID().slice(0, 8);
}

function establishmentToStore(establishment) {
  return {
    name: establishment?.name || 'Novo estabelecimento',
    type: segmentLabel(establishment?.segment || 'supermercado'),
    phone: establishment?.phone || '',
    hours: '08:00 - 18:00',
    status: 'Aberto',
    address: '',
    catalogSlug: slugify(establishment?.catalogSlug || establishment?.name || 'catalogo'),
    segment: establishment?.segment || 'supermercado',
    bannerText: establishment?.name || 'Novo estabelecimento',
    bannerUrl: '',
    logoUrl: ''
  };
}

function getPublicStore(db, slug) {
  const data = withPlatformDefaults(db);
  const requestedSlug = String(slug || '').trim();
  const catalogSlug = slugify(requestedSlug || data.store.catalogSlug || 'catalogo');
  const establishment = data.establishments.find((item) => item.catalogSlug === catalogSlug);

  if (!establishment) {
    if (requestedSlug) {
      return {
        establishmentId: null,
        store: {
          name: 'Catalogo nao encontrado',
          type: 'Estabelecimento',
          phone: '',
          hours: '',
          status: 'Fechado',
          address: '',
          catalogSlug,
          segment: 'estabelecimento',
          bannerText: 'Catalogo nao encontrado',
          bannerUrl: '',
          logoUrl: ''
        },
        products: [],
        orders: []
      };
    }

    return {
      store: data.store,
      products: data.products || [],
      orders: data.orders || []
    };
  }

  return {
    establishmentId: establishment.id,
    store: {
      ...establishmentToStore(establishment),
      ...establishment.store
    },
    products: establishment.products || [],
    orders: establishment.orders || []
  };
}

function getStoreBySession(db, session) {
  if (session.role !== 'store') {
    return {
      store: db.store,
      products: db.products || [],
      orders: db.orders || []
    };
  }

  const establishment = db.establishments.find((item) => item.id === session.establishmentId);
  if (!establishment) return { store: db.store, products: [], orders: [] };

  return {
    store: {
      ...establishmentToStore(establishment),
      ...establishment.store
    },
    products: establishment.products || [],
    orders: establishment.orders || []
  };
}

function updateStoreEstablishment(db, establishmentId, updater) {
  return {
    ...db,
    establishments: (db.establishments || buildDefaultEstablishments(db.store)).map((item) => {
      if (item.id !== establishmentId) return item;
      return normalizeEstablishment(updater(normalizeEstablishment(item)));
    })
  };
}

function updateScopedProducts(db, session, updater) {
  if (session.role === 'store') {
    return updateStoreEstablishment(db, session.establishmentId, (establishment) => ({
      ...establishment,
      products: updater(establishment.products || [])
    }));
  }

  return {
    ...db,
    products: updater(db.products || [])
  };
}

function updateScopedOrders(db, session, updater) {
  if (session.role === 'store') {
    return updateStoreEstablishment(db, session.establishmentId, (establishment) => ({
      ...establishment,
      orders: updater(establishment.orders || [])
    }));
  }

  return {
    ...db,
    orders: updater(db.orders || [])
  };
}

function segmentLabel(segment) {
  const labels = {
    supermercado: 'Supermercado',
    pizzaria: 'Pizzaria',
    lanchonete: 'Lanchonete',
    restaurante: 'Restaurante',
    padaria: 'Padaria',
    farmacia: 'Farmacia',
    bebidas: 'Distribuidora de bebidas',
    hortifruti: 'Hortifruti'
  };

  return labels[segment] || 'Estabelecimento';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'catalogo';
}
