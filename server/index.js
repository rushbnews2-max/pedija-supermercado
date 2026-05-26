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
    products: scoped.products.filter((product) => product.active),
    coupons: scoped.coupons.filter((coupon) => coupon.active)
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
app.use('/api/coupons', requireAdmin);
app.use('/api/downloads', requireAdmin);
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
      orders: scoped.orders,
      coupons: scoped.coupons
    });
    return;
  }

  res.json({
    ...data,
    role: 'master',
    products: [],
    orders: [],
    coupons: []
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
  const current = withPlatformDefaults(await readDb());
  const slugExists = current.establishments.some((item) => item.catalogSlug === establishment.catalogSlug);

  if (slugExists) {
    res.status(409).json({ message: 'Ja existe um cliente com este link de catalogo. Altere o link e tente novamente.' });
    return;
  }

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
    const nextSlug = slugify(req.body.catalogSlug || req.body.name || 'catalogo');
    const slugExists = establishments.some((item) => item.id !== req.params.id && item.catalogSlug === nextSlug);
    if (slugExists) {
      const error = new Error('Ja existe um cliente com este link de catalogo. Altere o link e tente novamente.');
      error.status = 409;
      throw error;
    }

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
}, (error, _req, res, next) => {
  if (!error.status) return next(error);
  res.status(error.status).json({ message: error.message });
});

app.delete('/api/establishments/:id', async (req, res) => {
  if (req.params.id === 'store-main') {
    res.status(400).json({ message: 'O estabelecimento principal nao pode ser excluido.' });
    return;
  }

  let removed = false;
  await updateDb((current) => {
    const establishments = current.establishments || buildDefaultEstablishments(current.store);
    removed = establishments.some((item) => item.id === req.params.id);

    return {
      ...current,
      establishments: establishments.filter((item) => item.id !== req.params.id)
    };
  });

  if (!removed) {
    res.status(404).json({ message: 'Estabelecimento nao encontrado.' });
    return;
  }

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
    stock: Number(req.body.stock || 0),
    sortOrder: Number(req.body.sortOrder || Date.now()),
    featured: Boolean(req.body.featured),
    productType: req.body.productType || 'normal',
    slices: Number(req.body.slices || 0),
    maxFlavors: Number(req.body.maxFlavors || 1),
    optionGroups: normalizeProductOptionGroups(req.body.optionGroups)
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
      .map((product, index) => ({
        id: crypto.randomUUID(),
        code: product.code || '',
        name: product.name,
        price: Number(product.price || 0),
        category,
        image: '',
        promo: false,
        featured: false,
        active: true,
        stock: 0,
        sortOrder: index + 1,
        productType: 'normal',
        slices: 0,
        maxFlavors: 1,
        optionGroups: []
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
      stock: Number(req.body.stock || 0),
      sortOrder: Number(req.body.sortOrder || product.sortOrder || 0),
      featured: Boolean(req.body.featured),
      productType: req.body.productType || product.productType || 'normal',
      slices: Number(req.body.slices || 0),
      maxFlavors: Number(req.body.maxFlavors || product.maxFlavors || 1),
      optionGroups: normalizeProductOptionGroups(req.body.optionGroups ?? product.optionGroups)
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

app.get('/api/coupons', async (req, res) => {
  const db = await readDb();
  res.json(getStoreBySession(withPlatformDefaults(db), getSession(req)).coupons);
});

app.post('/api/coupons', async (req, res) => {
  const session = getSession(req);
  const coupon = normalizeCoupon({
    ...req.body,
    id: req.body.id || crypto.randomUUID()
  });

  await updateDb((current) => updateScopedCoupons(current, session, (coupons) => [coupon, ...coupons]));

  res.status(201).json(coupon);
});

app.put('/api/coupons/:id', async (req, res) => {
  const session = getSession(req);
  let saved;
  await updateDb((current) => updateScopedCoupons(current, session, (coupons) => coupons.map((coupon) => {
    if (coupon.id !== req.params.id) return coupon;
    saved = normalizeCoupon({ ...coupon, ...req.body, id: coupon.id });
    return saved;
  })));

  res.json(saved);
});

app.delete('/api/coupons/:id', async (req, res) => {
  const session = getSession(req);
  await updateDb((current) => updateScopedCoupons(current, session, (coupons) => coupons.filter((coupon) => coupon.id !== req.params.id)));

  res.status(204).end();
});

app.get('/api/downloads/print-installer', async (req, res) => {
  const db = await readDb();
  const session = getSession(req);
  const scoped = getStoreBySession(withPlatformDefaults(db), session);
  const slug = slugify(scoped.store.catalogSlug || 'catalogo');
  const baseUrl = publicBaseUrl(req);
  const fileName = `PediJa-Impressao-${slug}.bat`;
  const installer = buildPrintInstallerBat({ slug, baseUrl });

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(installer);
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
      deliveryZones: [],
      categoryOrder: [],
      pizzaFlavors: [],
      pizzaBorders: [],
      ...db.store
    },
    establishments: establishments.map((item) => normalizeEstablishment({
      ...item,
      store: item.store || (item.id === 'store-main' ? db.store : undefined),
      products: Array.isArray(item.products) ? item.products : (item.id === 'store-main' ? db.products : []),
      orders: Array.isArray(item.orders) ? item.orders : (item.id === 'store-main' ? db.orders : []),
      coupons: Array.isArray(item.coupons) ? item.coupons : (item.id === 'store-main' ? db.coupons : [])
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
    orders: [],
    coupons: []
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
    products: Array.isArray(value.products) ? value.products.map((product) => ({
      ...product,
      optionGroups: normalizeProductOptionGroups(product.optionGroups)
    })) : [],
    orders: Array.isArray(value.orders) ? value.orders : [],
    coupons: Array.isArray(value.coupons) ? value.coupons.map((coupon) => normalizeCoupon(coupon)) : []
  };
}

function normalizeCoupon(value) {
  const type = value.type === 'fixed' ? 'fixed' : 'percent';
  return {
    id: value.id,
    code: String(value.code || '').trim().toUpperCase(),
    type,
    value: Math.max(0, Number(value.value || 0)),
    minOrder: Math.max(0, Number(value.minOrder || 0)),
    active: value.active !== false
  };
}

function normalizeProductOptionGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups
    .map((group) => ({
      id: group.id || crypto.randomUUID(),
      name: String(group.name || '').trim(),
      min: Math.max(0, Number(group.min || 0)),
      max: Math.max(1, Number(group.max || 1)),
      pricing: ['sum', 'highest', 'free'].includes(group.pricing) ? group.pricing : 'sum',
      options: normalizePricedOptions(group.options)
    }))
    .filter((group) => group.name && group.options.length);
}

function normalizePricedOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => ({
      name: String(option.name || '').trim(),
      description: String(option.description || '').trim(),
      price: parseCurrencyValue(option.price)
    }))
    .filter((option) => option.name);
}

function parseCurrencyValue(value) {
  const clean = String(value || '')
    .replace(/[^\d,.-]/g, '')
    .trim();
  if (!clean) return 0;
  const normalized = clean.includes(',')
    ? clean.replace(/\./g, '').replace(',', '.')
    : clean;
  return Number(normalized || 0);
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
    logoUrl: '',
    pixKey: '',
    pixName: establishment?.name || '',
    deliveryFee: 0,
    minOrder: 0,
    deliveryAreas: '',
    deliveryZones: [],
    categoryOrder: [],
    pizzaFlavors: [],
    pizzaBorders: []
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
        orders: [],
        coupons: []
      };
    }

    return {
      store: data.store,
      products: data.products || [],
      orders: data.orders || [],
      coupons: data.coupons || []
    };
  }

  return {
    establishmentId: establishment.id,
    store: {
      ...establishmentToStore(establishment),
      ...establishment.store
    },
    products: establishment.products || [],
    orders: establishment.orders || [],
    coupons: establishment.coupons || []
  };
}

function getStoreBySession(db, session) {
  if (session.role !== 'store') {
    return {
      store: db.store,
      products: db.products || [],
      orders: db.orders || [],
      coupons: db.coupons || []
    };
  }

  const establishment = db.establishments.find((item) => item.id === session.establishmentId);
  if (!establishment) return { store: db.store, products: [], orders: [], coupons: [] };

  return {
    store: {
      ...establishmentToStore(establishment),
      ...establishment.store
    },
    products: establishment.products || [],
    orders: establishment.orders || [],
    coupons: establishment.coupons || []
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

function updateScopedCoupons(db, session, updater) {
  if (session.role === 'store') {
    return updateStoreEstablishment(db, session.establishmentId, (establishment) => ({
      ...establishment,
      coupons: updater(establishment.coupons || [])
    }));
  }

  return {
    ...db,
    coupons: updater(db.coupons || [])
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

function publicBaseUrl(req) {
  const forwardedProto = req.get('x-forwarded-proto');
  const proto = forwardedProto || req.protocol || 'https';
  const host = req.get('host') || 'pedija.up.railway.app';
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function buildPrintInstallerBat({ slug, baseUrl }) {
  return `@echo off\r
setlocal\r
set "SLUG=${slug}"\r
set "BASE_URL=${baseUrl}"\r
set "URL=%BASE_URL%/admin/%SLUG%"\r
set "PROFILE=%LOCALAPPDATA%\\PediJaImpressao\\%SLUG%"\r
set "DESKTOP=%USERPROFILE%\\Desktop"\r
set "LAUNCHER=%LOCALAPPDATA%\\PediJaImpressao\\abrir-%SLUG%.bat"\r
set "SHORTCUT=%DESKTOP%\\PediJa Impressao %SLUG%.lnk"\r
\r
mkdir "%LOCALAPPDATA%\\PediJaImpressao" >nul 2>nul\r
\r
(\r
echo @echo off\r
echo set "URL=%URL%"\r
echo set "PROFILE=%PROFILE%"\r
echo set "CHROME=%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe"\r
echo set "CHROME_X86=%%ProgramFiles(x86)%%\\Google\\Chrome\\Application\\chrome.exe"\r
echo set "EDGE=%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe"\r
echo set "EDGE_64=%%ProgramFiles%%\\Microsoft\\Edge\\Application\\msedge.exe"\r
echo if exist "%%CHROME%%" ^(\r
echo   start "" "%%CHROME%%" --kiosk-printing --user-data-dir="%%PROFILE%%" --app="%%URL%%"\r
echo   exit /b 0\r
echo ^)\r
echo if exist "%%CHROME_X86%%" ^(\r
echo   start "" "%%CHROME_X86%%" --kiosk-printing --user-data-dir="%%PROFILE%%" --app="%%URL%%"\r
echo   exit /b 0\r
echo ^)\r
echo if exist "%%EDGE%%" ^(\r
echo   start "" "%%EDGE%%" --kiosk-printing --user-data-dir="%%PROFILE%%" --app="%%URL%%"\r
echo   exit /b 0\r
echo ^)\r
echo if exist "%%EDGE_64%%" ^(\r
echo   start "" "%%EDGE_64%%" --kiosk-printing --user-data-dir="%%PROFILE%%" --app="%%URL%%"\r
echo   exit /b 0\r
echo ^)\r
echo echo Nao encontrei Google Chrome nem Microsoft Edge nos caminhos padrao.\r
echo pause\r
) > "%LAUNCHER%"\r
\r
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%SHORTCUT%');$s.TargetPath='%LAUNCHER%';$s.WorkingDirectory='%LOCALAPPDATA%\\PediJaImpressao';$s.WindowStyle=7;$s.Description='PediJa Impressao Direta';$s.Save()"\r
\r
echo.\r
echo Instalador concluido.\r
echo Atalho criado na Area de Trabalho: PediJa Impressao %SLUG%\r
echo.\r
echo Antes de usar, deixe a impressora termica como impressora padrao do Windows.\r
echo Abra o atalho, faca login uma vez e marque "Imprimir novos pedidos automaticamente".\r
echo.\r
pause\r
`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'catalogo';
}
