import React from 'react';
import { createRoot } from 'react-dom/client';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  BarChart3,
  Box,
  Check,
  ChevronRight,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Home,
  MessageCircle,
  PackagePlus,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Users,
  X
} from 'lucide-react';
import './styles.css';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const API_BASE = import.meta.env.VITE_API_URL || '';

async function api(path, options = {}) {
  const token = localStorage.getItem('pedija-admin-token');
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const initialProducts = [
  {
    id: 'p1',
    code: '1001',
    name: 'Suco Del Valle 1L',
    category: 'Bebidas',
    price: 5.99,
    promo: true,
    active: true,
    stock: 38,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=220&q=80'
  },
  {
    id: 'p2',
    code: '1002',
    name: 'Cerveja Skol lata',
    category: 'Bebidas',
    price: 4.99,
    promo: false,
    active: true,
    stock: 94,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=220&q=80'
  },
  {
    id: 'p3',
    code: '1003',
    name: 'Arroz tipo 1 5kg',
    category: 'Mercearia',
    price: 26.9,
    promo: true,
    active: true,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=220&q=80'
  },
  {
    id: 'p4',
    code: '1004',
    name: 'Leite integral 1L',
    category: 'Laticinios',
    price: 4.89,
    promo: false,
    active: true,
    stock: 58,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=220&q=80'
  },
  {
    id: 'p5',
    code: '1005',
    name: 'Acucar cristal 2kg',
    category: 'Mercearia',
    price: 8.49,
    promo: false,
    active: true,
    stock: 41,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=220&q=80'
  }
];

const initialOrders = [
  {
    id: 12,
    customer: 'Carlos Santos',
    phone: '66999137727',
    address: 'Rua das Flores, 120',
    status: 'Pendente',
    createdAt: 'Hoje, 09:14',
    items: [{ productId: 'p1', name: 'Suco Del Valle 1L', qty: 2, price: 5.99 }, { productId: 'p3', name: 'Arroz tipo 1 5kg', qty: 1, price: 26.9 }],
    payment: 'PIX'
  },
  {
    id: 11,
    customer: 'Wlia',
    phone: '66996191408',
    address: 'Retirada no balcao',
    status: 'Pendente',
    createdAt: 'Hoje, 08:46',
    items: [{ productId: 'p2', name: 'Cerveja Skol lata', qty: 10, price: 4.99 }],
    payment: 'Dinheiro'
  },
  {
    id: 10,
    customer: 'Cliente Balcao',
    phone: '5',
    address: 'Retirada no balcao',
    status: 'Entregue',
    createdAt: 'Ontem, 18:21',
    items: [{ productId: 'p2', name: 'Cerveja Skol lata', qty: 1, price: 4.99 }],
    payment: 'Cartao'
  }
];

const initialStore = {
  name: 'Super Feliz Super Mercado',
  type: 'Supermercado',
  phone: '66996191408',
  hours: '06:30 - 19:30',
  status: 'Aberto',
  address: 'Av. Principal, 1000 - Centro',
  catalogSlug: 'super-feliz',
  bannerText: 'SuperFeliz',
  bannerUrl: '',
  logoUrl: ''
};

function LogoMark({ store }) {
  if (store?.logoUrl) {
    return (
      <div className="logo-mark image-logo" aria-label="Logo do estabelecimento">
        <img src={store.logoUrl} alt="" />
      </div>
    );
  }

  return (
    <div className="logo-mark" aria-hidden="true">
      <span>SF</span>
    </div>
  );
}

async function migrateLocalData() {
  if (localStorage.getItem('pedija-migrated-to-api') === 'yes') return null;

  const savedStore = localStorage.getItem('pedija-store');
  const savedProducts = localStorage.getItem('pedija-products');
  const savedOrders = localStorage.getItem('pedija-orders');

  if (!savedStore && !savedProducts && !savedOrders) {
    localStorage.setItem('pedija-migrated-to-api', 'yes');
    return null;
  }

  const data = await api('/api/migrate-local', {
    method: 'POST',
    body: JSON.stringify({
      store: savedStore ? JSON.parse(savedStore) : undefined,
      products: savedProducts ? JSON.parse(savedProducts) : undefined,
      orders: savedOrders ? JSON.parse(savedOrders) : undefined
    })
  });

  localStorage.setItem('pedija-migrated-to-api', 'yes');
  return data;
}

function Sidebar({ page, setPage, onLogout }) {
  const links = [
    ['painel', 'Painel do Sistema', Shield],
    ['estabelecimentos', 'Estabelecimentos', Store],
    ['produtos', 'Produtos', Box],
    ['pedidos', 'Pedidos', ShoppingBag],
    ['relatorios', 'Relatorios', BarChart3],
    ['cupons', 'Cupons', Tag],
    ['usuarios', 'Usuarios', Users]
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <strong><span>Pedi</span>Ja</strong>
        <small>Sistema de Pedidos</small>
      </div>
      <nav>
        {links.map(([id, label, Icon]) => (
          <button className={page === id ? 'active' : ''} key={id} onClick={() => setPage(id)}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
        <button className="logout-button" onClick={onLogout}>
          <X size={20} />
          <span>Sair</span>
        </button>
      </nav>
    </aside>
  );
}

function LoginPage({ onLogin, loading }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onLogin(password);
    } catch {
      setError('Senha incorreta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <strong><span>Pedi</span>Ja</strong>
          <small>Painel administrativo</small>
        </div>
        <h1>Entrar no sistema</h1>
        <p>Acesse o painel do estabelecimento com a senha administrativa.</p>
        <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /></label>
        {error && <span className="login-error">{error}</span>}
        <button className="orange-button" type="submit" disabled={submitting || loading}>
          <Shield size={18} /> {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </header>
  );
}

function App() {
  const [page, setPage] = React.useState(() => {
    if (window.location.pathname.startsWith('/catalogo')) return 'catalogo';
    if (window.location.pathname.startsWith('/pedido')) return 'pedido';
    return 'estabelecimentos';
  });
  const [authToken, setAuthToken] = React.useState(() => localStorage.getItem('pedija-admin-token') || '');
  const [storeData, setStoreData] = React.useState(initialStore);
  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState(initialOrders);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [newOrderAlert, setNewOrderAlert] = React.useState(null);
  const [autoPrintEnabled, setAutoPrintEnabled] = React.useState(() => localStorage.getItem('pedija-auto-print') === 'yes');
  const [autoPrintOrder, setAutoPrintOrder] = React.useState(null);
  const lastOrderId = React.useRef(0);
  const pageRef = React.useRef(page);
  const isCatalog = page === 'catalogo';
  const isTracking = page === 'pedido';
  const isPublicPage = isCatalog || isTracking;

  React.useEffect(() => {
    pageRef.current = page;
  }, [page]);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const source = isPublicPage
      ? api('/api/public').then(async (data) => {
        if (!isTracking) return { ...data, orders: [] };

        const orderId = Number(window.location.pathname.split('/').filter(Boolean).pop());
        if (!orderId) return { ...data, orders: [] };

        try {
          const order = await api(`/api/public/orders/${orderId}`);
          return { ...data, orders: [order] };
        } catch {
          return { ...data, orders: [] };
        }
      })
      : authToken
        ? migrateLocalData().then((migrated) => migrated || api('/api/bootstrap'))
        : Promise.resolve({ store: initialStore, products: [], orders: [] });

    source
      .then((data) => {
        if (!alive) return;
        setStoreData(data.store);
        setProducts(data.products);
        setOrders(data.orders);
        lastOrderId.current = Math.max(...data.orders.map((item) => item.id), 0);
      })
      .catch(() => {
        if (alive && !isCatalog) {
          localStorage.removeItem('pedija-admin-token');
          setAuthToken('');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [authToken, isCatalog, isPublicPage, isTracking]);

  React.useEffect(() => {
    if (loading || isPublicPage || !authToken) return undefined;

    const checkForNewOrders = (nextOrders) => {
      const newestId = Math.max(...nextOrders.map((item) => item.id), 0);
      if (newestId > lastOrderId.current) {
        const newestOrder = nextOrders.find((order) => order.id === newestId);
        lastOrderId.current = newestId;
        if (pageRef.current !== 'catalogo') {
          setNewOrderAlert(newestOrder);
          playOrderSound();
          if (autoPrintEnabled) {
            setAutoPrintOrder(newestOrder);
          }
        }
      }
    };

    const interval = window.setInterval(() => {
      api('/api/orders').then((nextOrders) => {
        setOrders(nextOrders);
        checkForNewOrders(nextOrders);
      }).catch(() => {});
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading, isPublicPage, authToken, autoPrintEnabled]);

  const toggleAutoPrint = (enabled) => {
    setAutoPrintEnabled(enabled);
    localStorage.setItem('pedija-auto-print', enabled ? 'yes' : 'no');
  };

  const login = async (password) => {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    localStorage.setItem('pedija-admin-token', data.token);
    setAuthToken(data.token);
  };

  const logout = async () => {
    try {
      await api('/api/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('pedija-admin-token');
      setAuthToken('');
      setPage('estabelecimentos');
    }
  };

  const saveStore = async (store) => {
    const saved = await api('/api/store', {
      method: 'PUT',
      body: JSON.stringify(store)
    });
    setStoreData(saved);
  };

  const createProduct = async (product) => {
    const saved = await api('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    setProducts((current) => [saved, ...current]);
  };

  const updateProduct = async (product) => {
    const saved = await api(`/api/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
    setProducts((current) => current.map((item) => item.id === product.id ? saved : item));
  };

  const deleteProduct = async (id) => {
    await api(`/api/products/${id}`, { method: 'DELETE' });
    setProducts((current) => current.filter((item) => item.id !== id));
  };

  const importProducts = async (payload) => {
    const saved = await api('/api/products/import', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setProducts(saved);
  };

  const addOrder = async (order) => {
    const saved = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
    setOrders((current) => [saved, ...current]);
    return saved.id;
  };

  const updateOrderStatusApi = async (id, status) => {
    const saved = await api(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    setOrders((current) => current.map((order) => order.id === id ? saved : order));
  };

  const deleteOrder = async (id) => {
    await api(`/api/orders/${id}`, { method: 'DELETE' });
    setOrders((current) => current.filter((order) => order.id !== id));
    setSelectedOrder((current) => current?.id === id ? null : current);
  };

  if (isCatalog) {
    return <Catalog store={storeData} products={products} onOrder={addOrder} />;
  }

  if (isTracking) {
    return <OrderTracking store={storeData} order={orders[0]} loading={loading} />;
  }

  if (loading) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand login-brand">
            <strong><span>Pedi</span>Ja</strong>
            <small>Painel administrativo</small>
          </div>
          <h1>Carregando...</h1>
          <p>Preparando os dados do sistema.</p>
        </section>
      </main>
    );
  }

  if (!authToken) {
    return <LoginPage onLogin={login} loading={loading} />;
  }

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} onLogout={logout} />
      <main className="content">
        {page === 'painel' && <Dashboard products={products} orders={orders} setPage={setPage} />}
        {page === 'estabelecimentos' && <Stores store={storeData} setStore={saveStore} setPage={setPage} />}
        {page === 'produtos' && <Products store={storeData} products={products} createProduct={createProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} importProducts={importProducts} />}
        {page === 'pedidos' && <Orders orders={orders} updateOrderStatus={updateOrderStatusApi} deleteOrder={deleteOrder} setSelectedOrder={setSelectedOrder} autoPrintEnabled={autoPrintEnabled} setAutoPrintEnabled={toggleAutoPrint} />}
        {page === 'relatorios' && <Reports orders={orders} products={products} />}
        {page === 'cupons' && <Coupons />}
        {page === 'usuarios' && <UsersPage />}
      </main>
      {selectedOrder && (
        <OrderModal store={storeData} order={selectedOrder} updateOrderStatus={updateOrderStatusApi} deleteOrder={deleteOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {newOrderAlert && (
        <NewOrderAlert
          order={newOrderAlert}
          onClose={() => setNewOrderAlert(null)}
          onOpen={() => {
            setPage('pedidos');
            setNewOrderAlert(null);
          }}
        />
      )}
      {autoPrintOrder && (
        <AutoPrintTicket store={storeData} order={autoPrintOrder} onDone={() => setAutoPrintOrder(null)} />
      )}
    </div>
  );
}

function NewOrderAlert({ order, onClose, onOpen }) {
  return (
    <aside className="new-order-alert" role="status" aria-live="polite">
      <div className="alert-pulse"><ShoppingBag size={22} /></div>
      <div>
        <strong>Novo pedido recebido</strong>
        <span>Pedido #{order.id} - {order.customer}</span>
        <b>{BRL.format(orderTotal(order))}</b>
      </div>
      <button className="ghost-button" onClick={onOpen}>Ver pedido</button>
      <button className="alert-close" aria-label="Fechar alerta" onClick={onClose}><X size={18} /></button>
    </aside>
  );
}

function AutoPrintTicket({ store, order, onDone }) {
  React.useEffect(() => {
    let finished = false;
    let printTimeout;
    let cleanupTimeout;

    const finish = () => {
      if (finished) return;
      finished = true;
      delete document.body.dataset.printing;
      onDone();
    };

    document.body.dataset.printing = 'order';

    printTimeout = window.setTimeout(() => {
      window.print();
      cleanupTimeout = window.setTimeout(finish, 5000);
    }, 700);

    window.addEventListener('afterprint', finish, { once: true });

    return () => {
      window.clearTimeout(printTimeout);
      window.clearTimeout(cleanupTimeout);
      window.removeEventListener('afterprint', finish);
      if (!finished) delete document.body.dataset.printing;
    };
  }, [onDone]);

  return (
    <div className="auto-print-ticket" aria-hidden="true">
      <ThermalTicket store={store} order={order} />
    </div>
  );
}

function Dashboard({ products, orders, setPage }) {
  const pending = orders.filter((order) => order.status === 'Pendente').length;
  const revenue = orders.filter((order) => order.status !== 'Cancelado').reduce((sum, order) => sum + orderTotal(order), 0);
  return (
    <>
      <PageHeader title="Painel do Sistema" subtitle="Acompanhe o movimento do mercado" />
      <section className="metric-grid">
        <Metric label="Pedidos pendentes" value={pending} icon={ShoppingBag} />
        <Metric label="Produtos ativos" value={products.filter((item) => item.active).length} icon={Box} />
        <Metric label="Faturamento" value={BRL.format(revenue)} icon={ReceiptText} />
      </section>
      <section className="quick-panel">
        <button onClick={() => setPage('produtos')}><PackagePlus size={18} /> Cadastrar produto</button>
        <button onClick={() => setPage('catalogo')}><Eye size={18} /> Abrir catalogo</button>
        <button onClick={() => setPage('pedidos')}><Printer size={18} /> Imprimir pedido</button>
      </section>
    </>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <article className="metric">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Stores({ store, setStore, setPage }) {
  const [editing, setEditing] = React.useState(false);
  const catalogUrl = `${window.location.origin}/catalogo/${store.catalogSlug || 'mercado'}`;
  const copyCatalog = async () => {
    await navigator.clipboard.writeText(catalogUrl);
    alert('Link do catalogo copiado.');
  };
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Confira nosso catalogo: ${catalogUrl}`)}`;

  return (
    <>
      <PageHeader title="Estabelecimentos" subtitle="Gerencie seus pontos de venda">
        <div className="header-actions">
          <button className="ghost-button" onClick={copyCatalog}><Copy size={17} /> Copiar link</button>
          <a className="orange-button" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Enviar catalogo</a>
          <button className="ghost-button" onClick={() => setEditing(true)}><Edit3 size={17} /> Editar</button>
        </div>
      </PageHeader>
      <section className="store-card">
        <div className={`store-hero ${store.bannerUrl ? 'image-banner' : ''}`} style={getBannerStyle(store)}>
          {!store.bannerUrl && <strong>{store.bannerText || store.name}</strong>}
        </div>
        <div className="store-body">
          <LogoMark store={store} />
          <div className="store-info">
            <h2>{store.name}</h2>
            <p><ShoppingBag size={15} /> {store.type}</p>
            <p><Phone size={15} /> {store.phone}</p>
            <p><ReceiptText size={15} /> {store.hours}</p>
            <p><Home size={15} /> {store.address}</p>
            <button onClick={() => setEditing(true)}>Clique para gerenciar <ChevronRight size={16} /></button>
          </div>
          <span className="status-pill">{store.status}</span>
        </div>
      </section>
      {editing && (
        <StoreModal
          store={store}
          onClose={() => setEditing(false)}
          onSave={async (nextStore) => {
            await setStore(nextStore);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}

function StoreModal({ store, onSave, onClose }) {
  const [draft, setDraft] = React.useState(store);
  const [status, setStatus] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const importLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Preparando logo...');
      const image = await resizeImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.84 });
      setField('logoUrl', image);
      setStatus('Logo pronto para salvar.');
    } catch {
      setStatus('Nao consegui importar esse logo. Tente outra imagem.');
    }
  };
  const importBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Preparando banner...');
      const image = await resizeImageFile(file, { maxWidth: 1800, maxHeight: 700, quality: 0.82 });
      setField('bannerUrl', image);
      setStatus('Banner pronto para salvar.');
    } catch {
      setStatus('Nao consegui importar esse banner. Tente outra imagem.');
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      await onSave({
        ...draft,
        catalogSlug: slugify(draft.catalogSlug || draft.name)
      });
    } catch {
      setStatus('Nao foi possivel salvar. Se colou uma imagem por URL, teste uma imagem menor ou importe do PC.');
      setSaving(false);
    }
  };

  return (
    <div className="overlay">
      <form className="modal" onSubmit={save}>
        <div className="modal-head">
          <h2>Editar estabelecimento</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Nome do mercado<input value={draft.name} onChange={(event) => setField('name', event.target.value)} required /></label>
        <div className="form-grid">
          <label>Tipo<input value={draft.type} onChange={(event) => setField('type', event.target.value)} required /></label>
          <label>Status<select value={draft.status} onChange={(event) => setField('status', event.target.value)}><option>Aberto</option><option>Fechado</option></select></label>
        </div>
        <label>Telefone / WhatsApp<input value={draft.phone} onChange={(event) => setField('phone', event.target.value)} required /></label>
        <label>Endereco<input value={draft.address} onChange={(event) => setField('address', event.target.value)} required /></label>
        <div className="form-grid">
          <label>Horario<input value={draft.hours} onChange={(event) => setField('hours', event.target.value)} required /></label>
          <label>Link do catalogo<input value={draft.catalogSlug} onChange={(event) => setField('catalogSlug', event.target.value)} /></label>
        </div>
        <label>Texto do banner<input value={draft.bannerText || ''} onChange={(event) => setField('bannerText', event.target.value)} /></label>
        <label>Banner URL<input value={draft.bannerUrl || ''} onChange={(event) => setField('bannerUrl', event.target.value)} placeholder="Cole o link da imagem do banner" /></label>
        <label>Importar banner do PC<input type="file" accept="image/*" onChange={importBanner} /></label>
        <div className={`banner-preview ${draft.bannerUrl ? 'image-banner' : ''}`} style={getBannerStyle(draft)}>
          <span>{draft.bannerText || draft.name}</span>
        </div>
        <label>Logo URL<input value={draft.logoUrl || ''} onChange={(event) => setField('logoUrl', event.target.value)} placeholder="Cole o link da imagem do logo" /></label>
        <label>Importar logo do PC<input type="file" accept="image/*" onChange={importLogo} /></label>
        <div className="logo-preview">
          <LogoMark store={draft} />
          <span>Previa do logo</span>
        </div>
        {status && <p className="form-status">{status}</p>}
        <button className="orange-button" type="submit" disabled={saving}><Check size={18} /> {saving ? 'Salvando...' : 'Salvar estabelecimento'}</button>
      </form>
    </div>
  );
}

function Products({ store, products, createProduct, updateProduct, deleteProduct, importProducts }) {
  const [tab, setTab] = React.useState('Produtos');
  const [editing, setEditing] = React.useState(null);
  const [importing, setImporting] = React.useState(false);
  const categories = [...new Set(products.map((product) => product.category || 'Sem categoria'))];

  const saveProduct = (product) => {
    if (product.id) updateProduct(product);
    else createProduct({ ...product, active: true });
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Produtos & Categorias" subtitle="Gerencie seu cardapio">
        <select aria-label="Estabelecimento">
          <option>{store.name}</option>
        </select>
      </PageHeader>
      <div className="tabs">
        {['Produtos', 'Categorias'].map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === 'Produtos' ? (
        <>
          <div className="product-toolbar">
            <button className="orange-button new-product" onClick={() => setEditing({ code: '', name: '', price: 0, category: 'Sem categoria', image: '', promo: false, stock: 0, active: true })}>
              <Plus size={18} /> Novo Produto
            </button>
            <button className="ghost-button new-product" onClick={() => setImporting(true)}>
              <PackagePlus size={18} /> Importar PDF ERP
            </button>
          </div>
          <div className="product-groups">
            {categories.map((category) => (
              <section key={category}>
                <h3>{category}</h3>
                {products.filter((product) => product.category === category).map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => setEditing(product)}
                    onToggle={() => updateProduct({ ...product, active: !product.active })}
                    onDelete={() => {
                      if (confirm(`Excluir o produto "${product.name}"?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                  />
                ))}
              </section>
            ))}
          </div>
        </>
      ) : (
        <section className="category-list">
          {categories.map((category) => (
            <article key={category}>
              <Box size={18} />
              <strong>{category}</strong>
              <span>{products.filter((product) => product.category === category).length} produtos</span>
            </article>
          ))}
        </section>
      )}
      {editing && <ProductModal product={editing} onSave={saveProduct} onClose={() => setEditing(null)} />}
      {importing && <PdfImportModal importProducts={importProducts} onClose={() => setImporting(false)} />}
    </>
  );
}

function ProductRow({ product, onEdit, onToggle, onDelete }) {
  return (
    <article className="product-row">
      <ProductThumb product={product} />
      <div>
        <h4>{product.name}</h4>
        {product.code && <small>Cod. {product.code}</small>}
        <strong>{BRL.format(product.price)}</strong>
      </div>
      <span className="green-pill">{product.active ? 'Ativo' : 'Inativo'}</span>
      {product.promo && <span className="promo-pill">🔥 Promocao</span>}
      <span className="stock">Estoque {product.stock}</span>
      <div className="row-actions">
        <button aria-label="Status" onClick={onToggle}><Settings size={18} /></button>
        <button aria-label="Editar" onClick={onEdit}><Edit3 size={18} /></button>
        <button aria-label="Excluir" className="danger" onClick={onDelete}><Trash2 size={18} /></button>
      </div>
    </article>
  );
}

function ProductThumb({ product }) {
  if (product.image) {
    return <img className="product-thumb" src={product.image} alt={product.name} />;
  }

  return (
    <div className="product-thumb product-thumb-empty" aria-label="Produto sem foto">
      <Box size={18} />
      <span>Sem foto</span>
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const [draft, setDraft] = React.useState(product);
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="overlay">
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, price: Number(draft.price), stock: Number(draft.stock) }); }}>
        <div className="modal-head">
          <h2>{draft.id ? 'Editar produto' : 'Novo produto'}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Nome<input value={draft.name} onChange={(event) => setField('name', event.target.value)} required /></label>
        <div className="form-grid">
          <label>Preco<input type="number" step="0.01" value={draft.price} onChange={(event) => setField('price', event.target.value)} required /></label>
          <label>Estoque<input type="number" value={draft.stock} onChange={(event) => setField('stock', event.target.value)} required /></label>
        </div>
        <label>Codigo<input value={draft.code || ''} onChange={(event) => setField('code', event.target.value)} /></label>
        <label>Categoria<input value={draft.category} onChange={(event) => setField('category', event.target.value)} required /></label>
        <label>Imagem URL opcional<input value={draft.image || ''} onChange={(event) => setField('image', event.target.value)} placeholder="Pode deixar em branco" /></label>
        <label className="check-line"><input type="checkbox" checked={draft.promo} onChange={(event) => setField('promo', event.target.checked)} /> Produto em promocao</label>
        <button className="orange-button" type="submit"><Check size={18} /> Salvar</button>
      </form>
    </div>
  );
}

function PdfImportModal({ importProducts, onClose }) {
  const [status, setStatus] = React.useState('Escolha o PDF exportado do ERP.');
  const [items, setItems] = React.useState([]);
  const [category, setCategory] = React.useState('Sem categoria');

  const readPdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('Lendo PDF...');
    setItems([]);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const lines = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageLines = groupPdfTextByLine(content.items);
        lines.push(...pageLines);
      }

      const parsed = parseProductsFromPdfLines(lines);
      setItems(parsed);
      setStatus(parsed.length ? `${parsed.length} produtos encontrados. Confira antes de importar.` : 'Nao encontrei produtos automaticamente. Envie um PDF com codigo, nome e preco em linhas de produto.');
    } catch {
      setStatus('Nao consegui ler esse PDF. Verifique se ele possui texto selecionavel, nao apenas imagem escaneada.');
    }
  };

  const importItems = async () => {
    if (!items.length) return;
    await importProducts({ products: items, category });
    onClose();
  };

  return (
    <div className="overlay">
      <section className="modal import-modal">
        <div className="modal-head">
          <h2>Importar produtos do PDF</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Arquivo PDF do ERP<input type="file" accept="application/pdf,.pdf" onChange={readPdf} /></label>
        <label>Categoria dos produtos importados<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>
        <p className="import-status">{status}</p>
        {items.length > 0 && (
          <div className="import-preview">
            <div className="import-preview-head">
              <span>Codigo</span>
              <span>Produto</span>
              <span>Preco</span>
            </div>
            {items.slice(0, 80).map((item, index) => (
              <div className="import-preview-row" key={`${item.code}-${item.name}-${index}`}>
                <span>{item.code}</span>
                <strong>{item.name}</strong>
                <span>{BRL.format(item.price)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="orange-button" type="button" disabled={!items.length} onClick={importItems}><Check size={18} /> Importar produtos</button>
        </div>
      </section>
    </div>
  );
}

function Orders({ orders, updateOrderStatus, deleteOrder, setSelectedOrder, autoPrintEnabled, setAutoPrintEnabled }) {
  const [filter, setFilter] = React.useState('Ativos');
  const filtered = orders.filter((order) => {
    if (filter === 'Ativos') return ['Pendente', 'Em separacao', 'Saiu para entrega'].includes(order.status);
    if (filter === 'Entregues') return order.status === 'Entregue';
    if (filter === 'Cancelados') return order.status === 'Cancelado';
    return true;
  });

  const counts = {
    Ativos: orders.filter((order) => ['Pendente', 'Em separacao', 'Saiu para entrega'].includes(order.status)).length,
    Entregues: orders.filter((order) => order.status === 'Entregue').length,
    Cancelados: orders.filter((order) => order.status === 'Cancelado').length,
    Todos: orders.length
  };

  return (
    <>
      <PageHeader title="Pedidos" subtitle="Gerencie os pedidos recebidos">
        <label className="auto-print-toggle">
          <input type="checkbox" checked={autoPrintEnabled} onChange={(event) => setAutoPrintEnabled(event.target.checked)} />
          <span>Imprimir novos pedidos automaticamente</span>
        </label>
      </PageHeader>
      <div className="tabs">
        {Object.keys(counts).map((name) => (
          <button key={name} className={filter === name ? 'active' : ''} onClick={() => setFilter(name)}>{name} ({counts[name]})</button>
        ))}
      </div>
      <section className="orders-grid">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} onOpen={() => setSelectedOrder(order)} />
        ))}
      </section>
    </>
  );
}

function OrderCard({ order, updateOrderStatus, deleteOrder, onOpen }) {
  const removeOrder = () => {
    if (confirm(`Excluir pedido #${order.id}?`)) {
      deleteOrder(order.id);
    }
  };
  const whatsappUrl = buildCustomerStatusWhatsapp(order);

  return (
    <article className="order-card" onClick={onOpen}>
      <div className="order-top">
        <h3>#{order.id}</h3>
        <span className={order.status === 'Pendente' ? 'pending-pill' : 'green-pill'}>{order.status}</span>
        <small>{order.createdAt}</small>
      </div>
      <p><Users size={15} /> {order.customer}</p>
      <p><Phone size={15} /> {order.phone}</p>
      <hr />
      <footer>
        <span>{order.items.length} itens</span>
        <strong>{BRL.format(orderTotal(order))}</strong>
      </footer>
      <div className="order-actions" onClick={(event) => event.stopPropagation()}>
        <button onClick={() => updateOrderStatus(order.id, 'Em separacao')}>Separar</button>
        <button onClick={() => updateOrderStatus(order.id, 'Saiu para entrega')}>Saiu</button>
        <button onClick={() => updateOrderStatus(order.id, 'Entregue')}>Entregar</button>
        <button onClick={() => updateOrderStatus(order.id, 'Cancelado')}>Cancelar</button>
        <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
        <button className="danger-text" onClick={removeOrder}><Trash2 size={14} /> Excluir</button>
      </div>
    </article>
  );
}

function OrderModal({ store, order, updateOrderStatus, deleteOrder, onClose }) {
  const printOrder = () => {
    document.body.dataset.printing = 'order';
    setTimeout(() => {
      window.print();
      delete document.body.dataset.printing;
    }, 50);
  };
  const removeOrder = () => {
    if (confirm(`Excluir pedido #${order.id}?`)) {
      deleteOrder(order.id);
      onClose();
    }
  };
  const whatsappUrl = buildCustomerStatusWhatsapp(order);

  return (
    <div className="overlay">
      <section className="modal order-modal">
        <div className="modal-head screen-only">
          <h2>Pedido #{order.id}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <ThermalTicket store={store} order={order} />
        <div className="modal-actions screen-only">
          <button className="ghost-button" onClick={() => updateOrderStatus(order.id, 'Em separacao')}><Box size={17} /> Em separacao</button>
          <button className="ghost-button" onClick={() => updateOrderStatus(order.id, 'Saiu para entrega')}><ShoppingBag size={17} /> Saiu para entrega</button>
          <button className="ghost-button" onClick={() => updateOrderStatus(order.id, 'Entregue')}><Check size={17} /> Marcar entregue</button>
          <a className="ghost-button" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Enviar status</a>
          <button className="ghost-button danger-button" onClick={removeOrder}><Trash2 size={17} /> Excluir</button>
          <button className="orange-button" onClick={printOrder}><Printer size={17} /> Imprimir termica</button>
        </div>
      </section>
    </div>
  );
}

function ThermalTicket({ store, order }) {
  return (
    <div className="thermal-ticket">
      <h3>{store.name}</h3>
      <p>{store.phone}</p>
      <p>{store.address}</p>
      <hr />
      <p>Pedido #{order.id} - {order.createdAt}</p>
      <p>Cliente: {order.customer}</p>
      <p>Telefone: {order.phone}</p>
      <p>Tipo: {order.deliveryMethod || 'Entrega'}</p>
      <p>Endereco: {order.address}</p>
      {order.notes && <p>Obs: {order.notes}</p>}
      <hr />
      {order.items.map((item) => (
        <div className="ticket-line" key={`${item.productId}-${item.name}`}>
          <span>{item.qty}x {item.name}</span>
          <strong>{BRL.format(item.qty * item.price)}</strong>
        </div>
      ))}
      <hr />
      <div className="ticket-line total">
        <span>Total</span>
        <strong>{BRL.format(orderTotal(order))}</strong>
      </div>
      <p>Pagamento: {order.payment}</p>
      <p>Status: {order.status}</p>
    </div>
  );
}

function Catalog({ store, products, onOrder }) {
  const [query, setQuery] = React.useState('');
  const [cart, setCart] = React.useState({});
  const [customer, setCustomer] = React.useState({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', notes: '' });
  const [sentOrder, setSentOrder] = React.useState(null);
  const [checkoutStep, setCheckoutStep] = React.useState('products');
  const activeProducts = products.filter((product) => product.active && product.name.toLowerCase().includes(query.toLowerCase()));
  const items = Object.entries(cart).map(([id, qty]) => {
    const product = products.find((item) => item.id === id);
    return product ? { productId: id, name: product.name, price: product.price, qty } : null;
  }).filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const add = (id) => setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  const remove = (id) => setCart((current) => {
    const next = { ...current, [id]: (current[id] || 0) - 1 };
    if (next[id] <= 0) delete next[id];
    return next;
  });

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return alert('Adicione produtos ao pedido.');
    if (customer.deliveryMethod === 'Entrega' && !customer.address.trim()) return alert('Informe o endereco para entrega.');

    const address = customer.deliveryMethod === 'Retirada'
      ? 'Retirada no balcao'
      : customer.address;
    const orderId = await onOrder({
      customer: customer.name,
      phone: customer.phone,
      address,
      payment: customer.payment,
      deliveryMethod: customer.deliveryMethod,
      notes: customer.notes,
      status: 'Pendente',
      createdAt: 'Agora',
      items
    });
    setSentOrder({ id: orderId, customer: customer.name, phone: customer.phone, address, payment: customer.payment, deliveryMethod: customer.deliveryMethod, notes: customer.notes, total, items });
    setCart({});
    setCustomer({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', notes: '' });
    setCheckoutStep('products');
  };

  return (
    <main className="catalog-page">
      <header className={`catalog-hero ${store.bannerUrl ? 'image-banner' : ''}`} style={getBannerStyle(store)}>
        <div>
          <h1>{store.name}</h1>
          <p>{store.type} aberto das {store.hours}</p>
        </div>
        <LogoMark store={store} />
      </header>
      <section className="catalog-body">
        {sentOrder && (
          <div className="success-message">
            <Check size={20} />
            <div>
              <strong>Pedido enviado</strong>
              <span>Pedido #{sentOrder.id} recebido. Total {BRL.format(sentOrder.total)}. Aguarde a confirmacao do mercado.</span>
              <div className="success-actions">
                <a href={`/pedido/${sentOrder.id}`}>Acompanhar status</a>
                <a href={buildStoreOrderWhatsapp(store, sentOrder)} target="_blank" rel="noreferrer">Enviar pelo WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 'products' ? (
          <>
            <section className="catalog-cart-summary">
              <div>
                <span>Carrinho</span>
                <strong>{items.length ? `${items.reduce((sum, item) => sum + item.qty, 0)} itens` : 'Vazio'}</strong>
              </div>
              <div className="cart-summary-items">
                {items.length ? items.slice(0, 3).map((item) => (
                  <span key={item.productId}>{item.qty}x {item.name}</span>
                )) : <span>Selecione os produtos abaixo.</span>}
                {items.length > 3 && <span>+{items.length - 3} itens</span>}
              </div>
              <strong>{BRL.format(total)}</strong>
              <button className="orange-button" type="button" disabled={!items.length} onClick={() => setCheckoutStep('checkout')}>
                <ShoppingBag size={18} /> Finalizar
              </button>
            </section>

            <div className="catalog-products">
              <div className="search-box">
                <Search size={18} />
                <input placeholder="Buscar produto" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <div className="catalog-grid">
                {activeProducts.map((product) => (
                  <article className="catalog-item" key={product.id}>
                    <ProductThumb product={product} />
                    <div>
                      <span>{product.category}</span>
                      <h2>{product.name}</h2>
                      <strong>{BRL.format(product.price)}</strong>
                    </div>
                    <div className="stepper">
                      <button onClick={() => remove(product.id)}>-</button>
                      <b>{cart[product.id] || 0}</b>
                      <button onClick={() => add(product.id)}>+</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : (
          <form className="cart-panel checkout-panel" onSubmit={submitOrder}>
            <div className="checkout-head">
              <button className="ghost-button" type="button" onClick={() => setCheckoutStep('products')}>Voltar aos produtos</button>
              <h2>Finalizar pedido</h2>
            </div>
            {items.length ? items.map((item) => (
              <div className="cart-line" key={item.productId}>
                <span>{item.qty}x {item.name}</span>
                <strong>{BRL.format(item.qty * item.price)}</strong>
              </div>
            )) : <p className="empty">Escolha produtos no catalogo.</p>}
            <div className="cart-total"><span>Total</span><strong>{BRL.format(total)}</strong></div>
            <label>Nome<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required /></label>
            <label>Telefone<input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} required /></label>
            <label>Entrega<select value={customer.deliveryMethod} onChange={(event) => setCustomer({ ...customer, deliveryMethod: event.target.value })}><option>Entrega</option><option>Retirada</option></select></label>
            {customer.deliveryMethod === 'Entrega' && (
              <label>Endereco<input value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} required /></label>
            )}
            <label>Observacoes<textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Ex: troco, ponto de referencia, item substituto" /></label>
            <label>Pagamento<select value={customer.payment} onChange={(event) => setCustomer({ ...customer, payment: event.target.value })}><option>PIX</option><option>Dinheiro</option><option>Cartao</option></select></label>
            <button className="orange-button" type="submit"><ShoppingBag size={18} /> Enviar pedido</button>
          </form>
        )}
      </section>
    </main>
  );
}

function OrderTracking({ store, order, loading }) {
  const steps = ['Pendente', 'Em separacao', 'Saiu para entrega', 'Entregue'];
  const currentIndex = order ? steps.indexOf(order.status) : -1;
  const isCanceled = order?.status === 'Cancelado';

  return (
    <main className="tracking-page">
      <section className="tracking-card">
        <LogoMark store={store} />
        <span>{store.name}</span>
        {loading ? (
          <>
            <h1>Carregando pedido...</h1>
            <p>Estamos buscando as informacoes atualizadas.</p>
          </>
        ) : order ? (
          <>
            <h1>Pedido #{order.id}</h1>
            <p>{order.customer}, acompanhe o andamento do seu pedido.</p>
            <div className={`tracking-status ${isCanceled ? 'canceled' : ''}`}>
              {isCanceled ? 'Pedido cancelado' : order.status}
            </div>
            {!isCanceled && (
              <div className="status-steps">
                {steps.map((step, index) => (
                  <div className={index <= currentIndex ? 'done' : ''} key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="tracking-summary">
              <div><span>Total</span><strong>{BRL.format(orderTotal(order))}</strong></div>
              <div><span>Entrega</span><strong>{order.deliveryMethod || 'Entrega'}</strong></div>
              <div><span>Pagamento</span><strong>{order.payment}</strong></div>
            </div>
            <a className="orange-button" href={`/catalogo/${store.catalogSlug || 'mercado'}`}>Voltar ao catalogo</a>
          </>
        ) : (
          <>
            <h1>Pedido nao encontrado</h1>
            <p>Confira o link recebido ou fale com o mercado pelo WhatsApp.</p>
            <a className="orange-button" href={`/catalogo/${store.catalogSlug || 'mercado'}`}>Abrir catalogo</a>
          </>
        )}
      </section>
    </main>
  );
}

function Reports({ orders, products }) {
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  return (
    <>
      <PageHeader title="Relatorios" subtitle="Resumo de vendas e operacao" />
      <section className="metric-grid">
        <Metric label="Vendas totais" value={BRL.format(revenue)} icon={ReceiptText} />
        <Metric label="Pedidos" value={orders.length} icon={ShoppingBag} />
        <Metric label="Itens cadastrados" value={products.length} icon={Box} />
      </section>
    </>
  );
}

function Coupons() {
  return (
    <>
      <PageHeader title="Cupons" subtitle="Cadastre descontos para o catalogo" />
      <section className="placeholder-panel">
        <Tag size={24} />
        <h2>10OFF</h2>
        <p>Exemplo de cupom ativo para pedidos acima de R$ 80,00.</p>
      </section>
    </>
  );
}

function UsersPage() {
  return (
    <>
      <PageHeader title="Usuarios" subtitle="Controle acessos da equipe" />
      <section className="category-list">
        <article><Users size={18} /><strong>Administrador</strong><span>Acesso total</span></article>
        <article><Store size={18} /><strong>Operador PDV</strong><span>Pedidos e impressao</span></article>
      </section>
    </>
  );
}

function playOrderSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audio = new AudioContext();
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.75);
    gain.connect(audio.destination);

    [880, 1175].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(audio.currentTime + index * 0.18);
      oscillator.stop(audio.currentTime + index * 0.18 + 0.18);
    });

    window.setTimeout(() => audio.close(), 900);
  } catch {
    // Alguns navegadores bloqueiam audio automatico sem uma interacao previa.
  }
}

function groupPdfTextByLine(textItems) {
  const rows = new Map();

  textItems.forEach((item) => {
    const y = Math.round(item.transform[5]);
    const row = rows.get(y) || [];
    row.push({ x: item.transform[4], text: item.str });
    rows.set(y, row);
  });

  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) => row
      .sort((a, b) => a.x - b.x)
      .map((part) => part.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
}

function parseProductsFromPdfLines(lines) {
  const products = [];
  const seen = new Set();

  lines.forEach((line) => {
    const normalized = line.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();

    if (!normalized || lower.includes('total') || lower.includes('subtotal') || lower.includes('pagina')) return;

    const priceMatch = normalized.match(/(?:R\$\s*)?(\d{1,4}(?:\.\d{3})*,\d{2}|\d{1,5}\.\d{2})\s*$/);
    if (!priceMatch) return;

    const beforePrice = normalized.slice(0, priceMatch.index).trim();
    const codeMatch = beforePrice.match(/^(\d{2,14}|[A-Z0-9]{2,14})\s+(.+)$/i);
    if (!codeMatch) return;

    const code = codeMatch[1].trim();
    const name = codeMatch[2]
      .replace(/\b(un|und|unid|kg|cx|pct|pc)\b\.?$/i, '')
      .trim();
    const price = parsePdfPrice(priceMatch[1]);

    if (!name || Number.isNaN(price) || price <= 0) return;

    const key = `${code}-${name}-${price}`;
    if (seen.has(key)) return;
    seen.add(key);
    products.push({ code, name, price });
  });

  return products;
}

function parsePdfPrice(value) {
  if (value.includes(',')) {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  }

  return Number(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mercado';
}

function getBannerStyle(store) {
  return store?.bannerUrl ? { '--banner-image': `url("${store.bannerUrl}")` } : undefined;
}

function resizeImageFile(file, { maxWidth, maxHeight, quality }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function buildCustomerStatusWhatsapp(order) {
  const trackingUrl = `${window.location.origin}/pedido/${order.id}`;
  const message = [
    `Ola ${order.customer}, seu pedido #${order.id} esta com status: ${order.status}.`,
    `Total: ${BRL.format(orderTotal(order))}`,
    `Acompanhe aqui: ${trackingUrl}`
  ].join('\n');

  return `https://wa.me/${onlyDigits(order.phone)}?text=${encodeURIComponent(message)}`;
}

function buildStoreOrderWhatsapp(store, order) {
  const trackingUrl = `${window.location.origin}/pedido/${order.id}`;
  const items = order.items.map((item) => `${item.qty}x ${item.name} - ${BRL.format(item.qty * item.price)}`).join('\n');
  const message = [
    `Novo pedido #${order.id}`,
    `Cliente: ${order.customer}`,
    `Telefone: ${order.phone}`,
    `Tipo: ${order.deliveryMethod}`,
    `Endereco: ${order.address}`,
    `Pagamento: ${order.payment}`,
    order.notes ? `Obs: ${order.notes}` : '',
    '',
    items,
    '',
    `Total: ${BRL.format(order.total)}`,
    `Status: ${trackingUrl}`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${onlyDigits(store.phone)}?text=${encodeURIComponent(message)}`;
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

createRoot(document.getElementById('root')).render(<App />);
