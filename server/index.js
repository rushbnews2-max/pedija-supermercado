import express from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDb, updateDb } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const tokens = new Map();
const ALL_STORE_PERMISSIONS = ['dashboard', 'orders', 'local_cash', 'catalog', 'coupons', 'store', 'team', 'reports', 'audit'];
const PROFILE_PERMISSIONS = {
  admin: ALL_STORE_PERMISSIONS,
  manager: ['dashboard', 'orders', 'local_cash', 'catalog', 'coupons', 'store', 'team', 'reports', 'audit'],
  cashier: ['dashboard', 'orders', 'local_cash', 'reports'],
  operator: ['dashboard', 'orders']
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await readDb();
    res.json({ ok: true, version: 'catalog-fallback-2026-05-28', db: 'ok' });
  } catch (error) {
    res.json({ ok: true, version: 'catalog-fallback-2026-05-28', db: 'error', error: String(error?.message || error).slice(0, 160) });
  }
});

app.post('/api/login', (req, res) => {
  const requestedSlug = String(req.body?.catalogSlug || '').trim();
  const catalogSlug = requestedSlug ? slugify(requestedSlug) : '';

  if (catalogSlug) {
    ensurePlatformDefaults().then((db) => {
      const establishment = withPlatformDefaults(db).establishments.find((item) => item.catalogSlug === catalogSlug);
      const user = String(req.body?.user || '').trim();
      const expectedUser = String(establishment?.adminUser || 'admin').trim();
      const teamUser = safeArray(establishment?.teamUsers).find((item) => item.active !== false && item.user === user && item.password === req.body?.password);
      const isOwner = establishment && user === expectedUser && req.body?.password === establishment.adminPassword;
      if (!isOwner && !teamUser) {
        res.status(401).json({ message: 'Senha invalida' });
        return;
      }

      const token = crypto.randomUUID();
      const currentUser = isOwner
        ? { id: 'owner', name: 'Administrador', user: expectedUser, profile: 'admin', permissions: ALL_STORE_PERMISSIONS }
        : { ...teamUser, password: undefined, permissions: permissionsForProfile(teamUser.profile, teamUser.permissions) };
      tokens.set(token, { role: 'store', establishmentId: establishment.id, currentUser });
      res.json({ token, role: 'store', establishmentId: establishment.id, currentUser });
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

app.post('/api/waiter/login', async (req, res) => {
  const db = withPlatformDefaults(await ensurePlatformDefaults());
  const slug = slugify(req.body?.catalogSlug || '');
  const establishment = db.establishments.find((item) => item.catalogSlug === slug);
  const waiters = safeArray(establishment?.store?.localWaiters);
  const waiter = waiters.find((item) => item.active !== false && String(item.pin || '') === String(req.body?.pin || ''));

  if (!establishment?.localServiceEnabled || !establishment?.waiterAppEnabled || !waiter) {
    res.status(401).json({ message: 'PIN invalido ou acesso do garcom desativado' });
    return;
  }

  const token = crypto.randomUUID();
  tokens.set(token, { role: 'waiter', establishmentId: establishment.id, waiterId: waiter.id, waiterName: waiter.name });
  res.json({ token, role: 'waiter', waiter: { id: waiter.id, name: waiter.name } });
});

app.post('/api/logout', requireAdmin, (req, res) => {
  const token = getToken(req);
  tokens.delete(token);
  res.status(204).end();
});

app.get('/api/public', async (req, res) => {
  let db;
  try {
    db = await readDb();
    const scoped = getPublicStore(db, req.query.slug);
    res.json({
      store: scoped.store,
      products: scoped.products.filter((product) => product.active !== false),
      coupons: scoped.coupons.filter((coupon) => coupon.active !== false)
    });
  } catch (error) {
    console.error('Erro ao carregar catalogo publico', error);
    if (db) {
      try {
        const fallback = getPublicStoreFallback(db, req.query.slug);
        res.json({
          store: fallback.store,
          products: fallback.products.filter((product) => product.active !== false),
          coupons: fallback.coupons.filter((coupon) => coupon.active !== false)
        });
        return;
      } catch (fallbackError) {
        console.error('Erro no fallback do catalogo publico', fallbackError);
      }
    }
    res.status(500).json({ message: 'Erro ao carregar catalogo publico' });
  }
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
app.use('/api/store', requireAdmin, requirePermission('store'));
app.use('/api/products', requireAdmin, requirePermission('catalog'));
app.use('/api/coupons', requireAdmin, requirePermission('coupons'));
app.use('/api/downloads', requireAdmin, requirePermission('store'));
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') return next();
  return requireAdmin(req, res, () => requirePermission('orders')(req, res, next));
});
app.use('/api/local-service', requireAdmin, requirePermission('local_cash'));
app.use('/api/team-users', requireAdmin);
app.use('/api/audit-logs', requireAdmin);
app.use('/api/waiter', (req, res, next) => req.path === '/login' ? next() : requireWaiter(req, res, next));
app.use(recordAuditTrail);

app.get('/api/bootstrap', async (req, res) => {
  const db = await ensurePlatformDefaults();
  const session = getSession(req);
  const data = withPlatformDefaults(db);

  if (session.role === 'store') {
    const scoped = getStoreBySession(data, session);
    const permissions = session.currentUser?.permissions || ALL_STORE_PERMISSIONS;
    res.json({
      role: 'store',
      store: scoped.store,
      products: permissions.includes('catalog') ? scoped.products : [],
      orders: scoped.orders,
      coupons: permissions.includes('coupons') ? scoped.coupons : [],
      teamUsers: permissions.includes('team') ? scoped.teamUsers.map(({ password, ...user }) => user) : [],
      auditLogs: permissions.includes('audit') ? scoped.auditLogs : [],
      currentUser: session.currentUser || null
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

app.get('/api/team-users', requirePermission('team'), async (req, res) => {
  const scoped = getStoreBySession(withPlatformDefaults(await readDb()), getSession(req));
  res.json(scoped.teamUsers.map(({ password, ...user }) => user));
});

app.post('/api/team-users', requirePermission('team'), async (req, res) => {
  const session = getSession(req);
  const user = normalizeTeamUser({ ...req.body, id: crypto.randomUUID() });
  await updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => ({
    ...establishment,
    teamUsers: [user, ...safeArray(establishment.teamUsers)]
  })));
  const { password, ...safeUser } = user;
  res.status(201).json(safeUser);
});

app.put('/api/team-users/:id', requirePermission('team'), async (req, res) => {
  const session = getSession(req);
  let saved;
  await updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => ({
    ...establishment,
    teamUsers: safeArray(establishment.teamUsers).map((user) => {
      if (user.id !== req.params.id) return user;
      saved = normalizeTeamUser({ ...user, ...req.body, password: req.body.password || user.password, id: user.id });
      return saved;
    })
  })));
  const { password, ...safeUser } = saved;
  res.json(safeUser);
});

app.delete('/api/team-users/:id', requirePermission('team'), async (req, res) => {
  const session = getSession(req);
  await updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => ({
    ...establishment,
    teamUsers: safeArray(establishment.teamUsers).filter((user) => user.id !== req.params.id)
  })));
  res.status(204).end();
});

app.get('/api/audit-logs', requirePermission('audit'), async (req, res) => {
  const scoped = getStoreBySession(withPlatformDefaults(await readDb()), getSession(req));
  res.json(scoped.auditLogs.slice(0, 300));
});

app.get('/api/waiter/bootstrap', async (req, res) => {
  const session = getSession(req);
  const scoped = getStoreBySession(withPlatformDefaults(await readDb()), session);
  if (!scoped.store.localServiceEnabled || !scoped.store.waiterAppEnabled) {
    res.status(403).json({ message: 'Acesso do garcom desativado pelo Painel Master.' });
    return;
  }
  res.json({
    role: 'waiter',
    waiter: { id: session.waiterId, name: session.waiterName },
    store: scoped.store,
    products: scoped.products.filter((product) => product.active !== false),
    orders: scoped.orders.filter((order) => order.serviceType === 'local' && order.settled !== true)
  });
});

app.post('/api/waiter/orders', async (req, res) => {
  const session = getSession(req);
  let saved;
  await updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => {
    if (!establishment.localServiceEnabled || !establishment.waiterAppEnabled) {
      const error = new Error('Acesso do garcom desativado pelo Painel Master.');
      error.status = 403;
      throw error;
    }
    const nextId = Math.max(...safeArray(establishment.orders).map((order) => Number(order.id || 0)), 0) + 1;
    saved = {
      ...req.body,
      id: nextId,
      status: 'Pendente',
      serviceType: 'local',
      deliveryMethod: 'Consumo no local',
      waiter: session.waiterName,
      waiterId: session.waiterId,
      createdAt: new Date().toLocaleString('pt-BR'),
      createdAtIso: new Date().toISOString()
    };
    return {
      ...establishment,
      store: {
        ...establishment.store,
        localTables: safeArray(establishment.store?.localTables).map((table) => table.id === saved.tableId ? { ...table, status: 'Ocupada' } : table)
      },
      orders: [saved, ...safeArray(establishment.orders)]
    };
  }));
  res.status(201).json(saved);
});

app.post('/api/local-service/close-table', async (req, res) => {
  const session = getSession(req);
  if (session.role !== 'store') {
    res.status(403).json({ message: 'Somente o estabelecimento pode receber e fechar mesas.' });
    return;
  }

  const tableId = String(req.body?.tableId || '');
  let result;
  await updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => {
    if (!establishment.tablePaymentsEnabled) {
      const error = new Error('Fechamento de mesa desativado pelo Painel Master.');
      error.status = 403;
      throw error;
    }
    const settlementId = crypto.randomUUID();
    const settledAt = new Date().toISOString();
    const orders = safeArray(establishment.orders).map((order) => (
      order.serviceType === 'local' && order.tableId === tableId && order.settled !== true && order.status !== 'Cancelado'
        ? { ...order, status: 'Entregue', settled: true, settlementId, settledAt, settlement: req.body }
        : order
    ));
    const store = {
      ...establishment.store,
      localTables: safeArray(establishment.store?.localTables).map((table) => table.id === tableId ? { ...table, status: 'Livre' } : table)
    };
    result = { store: { ...establishmentToStore(establishment), ...store }, orders };
    return { ...establishment, store, orders };
  }));
  res.json(result);
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
          ...req.body,
          localServiceEnabled: Boolean(establishment.localServiceEnabled),
          waiterAppEnabled: Boolean(establishment.waiterAppEnabled),
          tablePaymentsEnabled: Boolean(establishment.tablePaymentsEnabled)
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
        category: product.category || category,
        image: product.image || '',
        promo: Boolean(product.promo),
        featured: Boolean(product.featured),
        active: product.active !== false,
        stock: Number(product.stock || 0),
        sortOrder: index + 1,
        productType: product.productType || 'normal',
        slices: Number(product.slices || 0),
        maxFlavors: Number(product.maxFlavors || 1),
        pizzaSize: product.pizzaSize || '',
        optionGroups: normalizeProductOptionGroups(product.optionGroups)
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
  const installerPath = join(__dirname, 'assets', 'PediJah-PDV-Setup.exe');

  if (existsSync(installerPath)) {
    res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
    res.setHeader('Content-Disposition', `attachment; filename="PediJah-PDV-${slug}-Setup.exe"`);
    res.sendFile(installerPath);
    return;
  }

  const baseUrl = publicBaseUrl(req);
  const legacyInstaller = buildPrintInstallerHta({ slug, baseUrl, storeName: scoped.store.name || 'PediJah' });
  res.setHeader('Content-Type', 'application/hta');
  res.setHeader('Content-Disposition', `attachment; filename="Instalador-PediJah-Impressao-${slug}.hta"`);
  res.send(legacyInstaller);
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
      createdAt: req.body.createdAt || new Date().toLocaleString('pt-BR'),
      createdAtIso: req.body.createdAtIso || new Date().toISOString()
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
  console.log(`PediJah online server running on port ${port}`);
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

function requireWaiter(req, res, next) {
  const session = getSession(req);
  if (session.role !== 'waiter') {
    res.status(403).json({ message: 'Acesso de garcom necessario' });
    return;
  }
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    const session = getSession(req);
    if (session.role === 'master') return next();
    const permissions = session.currentUser?.permissions || ALL_STORE_PERMISSIONS;
    if (session.role !== 'store' || !permissions.includes(permission)) {
      res.status(403).json({ message: 'Seu usuario nao possui permissao para esta acao.' });
      return;
    }
    next();
  };
}

function recordAuditTrail(req, res, next) {
  const session = getSession(req);
  if (session.role !== 'store' || !['POST', 'PUT', 'DELETE'].includes(req.method) || req.path === '/api/logout') {
    next();
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const action = `${req.method} ${req.path}`;
    updateDb((current) => updateStoreEstablishment(current, session.establishmentId, (establishment) => ({
      ...establishment,
      auditLogs: [{
        id: crypto.randomUUID(),
        action,
        user: session.currentUser?.name || session.currentUser?.user || 'Administrador',
        profile: session.currentUser?.profile || 'admin',
        createdAt: new Date().toISOString()
      }, ...safeArray(establishment.auditLogs)].slice(0, 1000)
    }))).catch(() => {});
  });
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
  const safeDb = db && typeof db === 'object' ? db : {};
  const establishments = Array.isArray(safeDb.establishments) ? safeDb.establishments : buildDefaultEstablishments(safeDb.store);

  return {
    ...safeDb,
    store: {
      segment: 'supermercado',
      deliveryZones: [],
      categoryOrder: [],
      pizzaFlavors: [],
      pizzaBorders: [],
      ...safeDb.store
    },
    establishments: establishments
      .filter((item) => item && typeof item === 'object')
      .map((item) => normalizeEstablishment({
        ...item,
        store: item.store || (item.id === 'store-main' ? safeDb.store : undefined),
        products: Array.isArray(item.products) ? item.products : (item.id === 'store-main' ? safeDb.products : []),
        orders: Array.isArray(item.orders) ? item.orders : (item.id === 'store-main' ? safeDb.orders : []),
        coupons: Array.isArray(item.coupons) ? item.coupons : (item.id === 'store-main' ? safeDb.coupons : [])
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
    ...(value.store || {}),
    localServiceEnabled: Boolean(value.localServiceEnabled),
    waiterAppEnabled: Boolean(value.waiterAppEnabled),
    tablePaymentsEnabled: Boolean(value.tablePaymentsEnabled)
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
    localServiceEnabled: Boolean(value.localServiceEnabled),
    waiterAppEnabled: Boolean(value.waiterAppEnabled),
    tablePaymentsEnabled: Boolean(value.tablePaymentsEnabled),
    store,
    products: Array.isArray(value.products) ? value.products.filter((product) => product && typeof product === 'object').map((product) => ({
      ...product,
      optionGroups: normalizeProductOptionGroups(product.optionGroups)
    })) : [],
    orders: Array.isArray(value.orders) ? value.orders.filter((order) => order && typeof order === 'object') : [],
    coupons: Array.isArray(value.coupons) ? value.coupons.filter((coupon) => coupon && typeof coupon === 'object').map((coupon) => normalizeCoupon(coupon)) : []
    ,teamUsers: safeArray(value.teamUsers).map(normalizeTeamUser),
    auditLogs: safeArray(value.auditLogs)
  };
}

function permissionsForProfile(profile, customPermissions) {
  const defaults = PROFILE_PERMISSIONS[profile] || PROFILE_PERMISSIONS.operator;
  return Array.isArray(customPermissions) && customPermissions.length
    ? customPermissions.filter((permission) => ALL_STORE_PERMISSIONS.includes(permission))
    : defaults;
}

function normalizeTeamUser(value) {
  const profile = ['admin', 'manager', 'cashier', 'operator'].includes(value.profile) ? value.profile : 'operator';
  return {
    id: value.id || crypto.randomUUID(),
    name: String(value.name || value.user || 'Usuario').trim(),
    user: String(value.user || '').trim(),
    password: String(value.password || '').trim(),
    profile,
    permissions: permissionsForProfile(profile, value.permissions),
    active: value.active !== false
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
    .filter((group) => group && typeof group === 'object')
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
    .filter((option) => option && typeof option === 'object')
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
    localServiceEnabled: Boolean(establishment?.localServiceEnabled),
    waiterAppEnabled: Boolean(establishment?.waiterAppEnabled),
    tablePaymentsEnabled: Boolean(establishment?.tablePaymentsEnabled),
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
    pizzaBorders: [],
    localTables: [],
    localWaiters: []
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

function getPublicStoreFallback(db, slug) {
  const safeDb = db && typeof db === 'object' ? db : {};
  const requestedSlug = String(slug || '').trim();
  const catalogSlug = slugify(requestedSlug || safeDb.store?.catalogSlug || 'catalogo');
  const establishments = Array.isArray(safeDb.establishments) ? safeDb.establishments.filter((item) => item && typeof item === 'object') : [];
  const establishment = establishments.find((item) => slugify(item.catalogSlug || item.name || 'catalogo') === catalogSlug);

  if (establishment) {
    const store = {
      ...establishmentToStore(establishment),
      ...(establishment.store && typeof establishment.store === 'object' ? establishment.store : {}),
      catalogSlug
    };
    return {
      establishmentId: establishment.id || null,
      store,
      products: safeArray(establishment.products).filter((product) => product && typeof product === 'object').map(normalizePublicProduct),
      orders: safeArray(establishment.orders).filter((order) => order && typeof order === 'object'),
      coupons: safeArray(establishment.coupons).filter((coupon) => coupon && typeof coupon === 'object').map(normalizeCoupon)
    };
  }

  if (requestedSlug) {
    return notFoundPublicStore(catalogSlug);
  }

  return {
    establishmentId: null,
    store: {
      ...establishmentToStore(safeDb.store || {}),
      ...(safeDb.store && typeof safeDb.store === 'object' ? safeDb.store : {})
    },
    products: safeArray(safeDb.products).filter((product) => product && typeof product === 'object').map(normalizePublicProduct),
    orders: safeArray(safeDb.orders).filter((order) => order && typeof order === 'object'),
    coupons: safeArray(safeDb.coupons).filter((coupon) => coupon && typeof coupon === 'object').map(normalizeCoupon)
  };
}

function notFoundPublicStore(catalogSlug) {
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

function normalizePublicProduct(product) {
  return {
    ...product,
    optionGroups: normalizeProductOptionGroups(product.optionGroups)
  };
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getStoreBySession(db, session) {
  if (!['store', 'waiter'].includes(session.role)) {
    return {
      store: db.store,
      products: db.products || [],
      orders: db.orders || [],
      coupons: db.coupons || [],
      teamUsers: [],
      auditLogs: []
    };
  }

  const establishment = db.establishments.find((item) => item.id === session.establishmentId);
  if (!establishment) return { store: db.store, products: [], orders: [], coupons: [], teamUsers: [], auditLogs: [] };

  return {
    store: {
      ...establishmentToStore(establishment),
      ...establishment.store
    },
    products: establishment.products || [],
    orders: establishment.orders || [],
    coupons: establishment.coupons || [],
    teamUsers: establishment.teamUsers || [],
    auditLogs: establishment.auditLogs || []
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
  if (['store', 'waiter'].includes(session.role)) {
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
  const host = req.get('host') || 'pedijah.com.br';
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function buildPrintInstallerBat({ slug, baseUrl }) {
  return `@echo off\r
setlocal\r
set "SLUG=${slug}"\r
set "BASE_URL=${baseUrl}"\r
set "URL=%BASE_URL%/admin/%SLUG%"\r
set "PROFILE=%LOCALAPPDATA%\\PediJahImpressao\\%SLUG%"\r
set "DESKTOP=%USERPROFILE%\\Desktop"\r
set "LAUNCHER=%LOCALAPPDATA%\\PediJahImpressao\\abrir-%SLUG%.bat"\r
set "SHORTCUT=%DESKTOP%\\PediJah Impressao %SLUG%.lnk"\r
\r
mkdir "%LOCALAPPDATA%\\PediJahImpressao" >nul 2>nul\r
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
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%SHORTCUT%');$s.TargetPath='%LAUNCHER%';$s.WorkingDirectory='%LOCALAPPDATA%\\PediJahImpressao';$s.WindowStyle=7;$s.Description='PediJah Impressao Direta';$s.Save()"\r
\r
echo.\r
echo Instalador concluido.\r
echo Atalho criado na Area de Trabalho: PediJah Impressao %SLUG%\r
echo.\r
echo Antes de usar, deixe a impressora termica como impressora padrao do Windows.\r
echo Abra o atalho, faca login uma vez e marque "Imprimir novos pedidos automaticamente".\r
echo.\r
pause\r
`;
}

function buildPrintInstallerHta({ slug, baseUrl, storeName }) {
  const url = `${baseUrl}/admin/${slug}`;
  const safeTitle = escapeInstallerHtml(storeName || 'PediJah');
  const jsConfig = {
    slug,
    url,
    appName: 'PediJah Impressao Automatica',
    shortcutName: `PediJah Impressao ${slug}`
  };

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="IE=edge">
  <title>PediJah Impressao Automatica</title>
  <HTA:APPLICATION
    ID="PediJahInstaller"
    APPLICATIONNAME="PediJah Impressao Automatica"
    BORDER="thin"
    CAPTION="yes"
    MAXIMIZEBUTTON="no"
    MINIMIZEBUTTON="yes"
    SCROLL="no"
    SINGLEINSTANCE="yes"
    SYSMENU="yes"
    WINDOWSTATE="normal"
  />
  <style>
    html, body { margin: 0; width: 560px; height: 420px; overflow: hidden; font-family: Arial, sans-serif; background: #f6f7f9; color: #07172d; }
    .wrap { padding: 28px; }
    .card { background: #fff; border: 1px solid #e5e9f0; border-radius: 14px; padding: 24px; box-shadow: 0 18px 45px rgba(15, 23, 42, .12); }
    .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .logo { width: 58px; height: 58px; line-height: 58px; text-align: center; border-radius: 16px; background: #f45106; color: #fff; font-size: 23px; font-weight: 900; box-shadow: 0 14px 28px rgba(244, 81, 6, .28); }
    h1 { margin: 0; font-size: 25px; line-height: 1.1; }
    .brand small { display: block; margin-top: 4px; color: #65748b; font-weight: 700; }
    p { color: #405069; font-size: 14px; line-height: 1.48; margin: 10px 0; }
    .store { border: 1px solid #eef1f5; border-radius: 10px; background: #f8fafc; padding: 12px; margin: 14px 0; font-weight: 800; }
    .actions { display: flex; gap: 10px; margin-top: 18px; }
    button { min-height: 42px; border: 0; border-radius: 9px; padding: 0 16px; font-weight: 900; cursor: pointer; }
    .primary { background: #f45106; color: #fff; box-shadow: 0 12px 24px rgba(244, 81, 6, .26); }
    .secondary { background: #eef1f5; color: #22314a; }
    #status { min-height: 20px; margin-top: 14px; color: #0f7a43; font-weight: 800; }
    .hint { color: #7b8798; font-size: 12px; margin-top: 14px; }
  </style>
  <script language="javascript">
    var CONFIG = ${JSON.stringify(jsConfig)};

    function setStatus(text, isError) {
      var el = document.getElementById('status');
      el.style.color = isError ? '#b91c1c' : '#0f7a43';
      el.innerText = text;
    }

    function line(value) {
      return value + "\\r\\n";
    }

    function buildLauncher(url, profile) {
      var bat = '';
      bat += line('@echo off');
      bat += line('set "URL=' + url + '"');
      bat += line('set "PROFILE=' + profile + '"');
      bat += line('set "CHROME=%ProgramFiles%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe"');
      bat += line('set "CHROME_X86=%ProgramFiles(x86)%\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe"');
      bat += line('set "EDGE=%ProgramFiles(x86)%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe"');
      bat += line('set "EDGE_64=%ProgramFiles%\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe"');
      bat += line('if exist "%CHROME%" (');
      bat += line('  start "" "%CHROME%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"');
      bat += line('  exit /b 0');
      bat += line(')');
      bat += line('if exist "%CHROME_X86%" (');
      bat += line('  start "" "%CHROME_X86%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"');
      bat += line('  exit /b 0');
      bat += line(')');
      bat += line('if exist "%EDGE%" (');
      bat += line('  start "" "%EDGE%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"');
      bat += line('  exit /b 0');
      bat += line(')');
      bat += line('if exist "%EDGE_64%" (');
      bat += line('  start "" "%EDGE_64%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"');
      bat += line('  exit /b 0');
      bat += line(')');
      bat += line('echo Nao encontrei Google Chrome nem Microsoft Edge nos caminhos padrao.');
      bat += line('pause');
      return bat;
    }

    function firstExisting(fso, paths) {
      for (var i = 0; i < paths.length; i++) {
        if (fso.FileExists(paths[i])) return paths[i];
      }
      return '';
    }

    function installPrinterLauncher() {
      try {
        var shell = new ActiveXObject('WScript.Shell');
        var fso = new ActiveXObject('Scripting.FileSystemObject');
        var root = shell.ExpandEnvironmentStrings('%LOCALAPPDATA%') + '\\\\PediJahImpressao';
        var profile = root + '\\\\' + CONFIG.slug;
        var launcher = root + '\\\\abrir-' + CONFIG.slug + '.bat';
        var shortcutPath = shell.SpecialFolders('Desktop') + '\\\\' + CONFIG.shortcutName + '.lnk';

        if (!fso.FolderExists(root)) fso.CreateFolder(root);
        if (!fso.FolderExists(profile)) fso.CreateFolder(profile);

        var file = fso.CreateTextFile(launcher, true);
        file.Write(buildLauncher(CONFIG.url, profile));
        file.Close();

        var shortcut = shell.CreateShortcut(shortcutPath);
        shortcut.TargetPath = launcher;
        shortcut.WorkingDirectory = root;
        shortcut.WindowStyle = 7;
        shortcut.Description = 'PediJah Impressao Automatica';

        var icon = firstExisting(fso, [
          shell.ExpandEnvironmentStrings('%ProgramFiles%') + '\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
          shell.ExpandEnvironmentStrings('%ProgramFiles(x86)%') + '\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
          shell.ExpandEnvironmentStrings('%ProgramFiles%') + '\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
          shell.ExpandEnvironmentStrings('%ProgramFiles(x86)%') + '\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe'
        ]);
        if (icon) shortcut.IconLocation = icon + ',0';
        shortcut.Save();

        setStatus('Instalacao concluida. Atalho criado na Area de Trabalho.');
      } catch (error) {
        setStatus('Nao consegui instalar: ' + error.message, true);
      }
    }

    window.onload = function() {
      window.resizeTo(590, 455);
    };
  </script>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">
        <div class="logo">PJ</div>
        <div>
          <h1>PediJah</h1>
          <small>Instalador de impressao automatica</small>
        </div>
      </div>
      <p>Este instalador cria o atalho que abre o painel com impressao direta na impressora padrao do Windows.</p>
      <div class="store">${safeTitle}<br><small>${escapeInstallerHtml(url)}</small></div>
      <p>Antes de usar, deixe a impressora termica como impressora padrao. Depois abra o atalho, faca login uma vez e marque a impressao automatica no painel.</p>
      <div class="actions">
        <button class="primary" onclick="installPrinterLauncher()">Instalar impressao automatica</button>
        <button class="secondary" onclick="window.close()">Fechar</button>
      </div>
      <div id="status"></div>
      <div class="hint">O atalho criado usa Chrome ou Edge com impressao silenciosa.</div>
    </div>
  </div>
</body>
</html>`;
}

function escapeInstallerHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'catalogo';
}
