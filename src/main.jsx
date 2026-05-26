import React from 'react';
import { createRoot } from 'react-dom/client';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  BarChart3,
  Box,
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Home,
  MapPin,
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
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  Users,
  X
} from 'lucide-react';
import './styles.css';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const API_BASE = import.meta.env.VITE_API_URL || '';
const SEGMENTS = [
  ['supermercado', 'Supermercado'],
  ['pizzaria', 'Pizzaria'],
  ['lanchonete', 'Lanchonete'],
  ['restaurante', 'Restaurante'],
  ['padaria', 'Padaria'],
  ['farmacia', 'Farmacia'],
  ['bebidas', 'Distribuidora de bebidas'],
  ['hortifruti', 'Hortifruti']
];

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
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
      // Mantem a mensagem generica quando a resposta nao vem em JSON.
    }
    throw new Error(message);
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
    featured: true,
    sortOrder: 10,
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
    featured: false,
    sortOrder: 20,
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
    featured: true,
    sortOrder: 10,
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
    featured: false,
    sortOrder: 10,
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
    featured: false,
    sortOrder: 20,
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
  segment: 'supermercado',
  bannerText: 'SuperFeliz',
  bannerUrl: '',
  logoUrl: '',
  pixKey: '',
  pixName: 'Super Feliz Super Mercado',
  deliveryFee: 0,
  minOrder: 0,
  deliveryAreas: '',
  deliveryZones: [],
  categoryOrder: ['Bebidas', 'Mercearia', 'Laticinios'],
  pizzaFlavors: [],
  pizzaBorders: []
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

function Sidebar({ page, setPage, onLogout, role }) {
  const masterLinks = [
    ['master', 'Painel Master', Shield]
  ];
  const storeLinks = [
    ['painel', 'Painel do Sistema', Shield],
    ['estabelecimentos', 'Estabelecimentos', Store],
    ['produtos', 'Produtos', Box],
    ['pedidos', 'Pedidos', ShoppingBag],
    ['entregas', 'Entregas', Truck],
    ['relatorios', 'Relatorios', BarChart3],
    ['cupons', 'Cupons', Tag],
    ['usuarios', 'Usuarios', Users]
  ];
  const links = role === 'master' ? masterLinks : storeLinks;

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

function LoginPage({ onLogin, loading, adminSlug }) {
  const [user, setUser] = React.useState('admin');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [loginStore, setLoginStore] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    if (!adminSlug) return undefined;

    api(`/api/public?slug=${encodeURIComponent(adminSlug)}`)
      .then((data) => {
        if (alive) setLoginStore(data.store);
      })
      .catch(() => {
        if (alive) setLoginStore(null);
      });

    return () => {
      alive = false;
    };
  }, [adminSlug]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onLogin({ user, password });
    } catch {
      setError('Usuario ou senha incorretos. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page" style={getLoginBackgroundStyle(loginStore || { segment: adminSlug ? 'estabelecimento' : 'master' })}>
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <strong><span>Pedi</span>Ja</strong>
          <small>Painel administrativo</small>
        </div>
        <h1>Entrar no sistema</h1>
        <p>{adminSlug ? 'Acesse o painel deste estabelecimento.' : 'Acesse o painel master da plataforma.'}</p>
        {adminSlug && <label>Usuario<input value={user} onChange={(event) => setUser(event.target.value)} autoFocus required /></label>}
        <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus={!adminSlug} required /></label>
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
  const routeSlug = getRouteSlug();
  const adminSlug = getAdminSlug();
  const [page, setPage] = React.useState(() => {
    if (window.location.pathname.startsWith('/catalogo')) return 'catalogo';
    if (window.location.pathname.startsWith('/imprimir/pedido')) return 'print';
    if (window.location.pathname.startsWith('/pedido')) return 'pedido';
    if (window.location.pathname.startsWith('/admin')) return 'painel';
    return 'master';
  });
  const [authToken, setAuthToken] = React.useState(() => localStorage.getItem('pedija-admin-token') || '');
  const [role, setRole] = React.useState('');
  const [storeData, setStoreData] = React.useState(initialStore);
  const [establishments, setEstablishments] = React.useState([]);
  const [products, setProducts] = React.useState(initialProducts);
  const [orders, setOrders] = React.useState(initialOrders);
  const [coupons, setCoupons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [newOrderAlert, setNewOrderAlert] = React.useState(null);
  const [autoPrintEnabled, setAutoPrintEnabled] = React.useState(() => localStorage.getItem('pedija-auto-print') === 'yes');
  const [autoPrintOrder, setAutoPrintOrder] = React.useState(null);
  const lastOrderId = React.useRef(0);
  const pageRef = React.useRef(page);
  const isCatalog = page === 'catalogo';
  const isTracking = page === 'pedido';
  const isPrintPage = page === 'print';
  const isPublicPage = isCatalog || isTracking || isPrintPage;

  React.useEffect(() => {
    pageRef.current = page;
  }, [page]);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const source = isPublicPage
      ? api(`/api/public${routeSlug ? `?slug=${encodeURIComponent(routeSlug)}` : ''}`).then(async (data) => {
        if (!isTracking && !isPrintPage) return { ...data, orders: [] };

        const orderId = Number(window.location.pathname.split('/').filter(Boolean).pop());
        if (!orderId) return { ...data, orders: [] };

        try {
          const order = await api(`/api/public/orders/${orderId}${routeSlug ? `?slug=${encodeURIComponent(routeSlug)}` : ''}`);
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
        if (!isPublicPage && ((adminSlug && data.role !== 'store') || (!adminSlug && data.role === 'store'))) {
          localStorage.removeItem('pedija-admin-token');
          setAuthToken('');
          setRole('');
          setProducts([]);
          setOrders([]);
          setLoading(false);
          return;
        }

        setRole(data.role || (adminSlug ? 'store' : 'master'));
        setStoreData(data.store);
        setEstablishments(data.establishments || buildDefaultEstablishments(data.store));
        setProducts(data.products);
        setOrders(data.orders);
        setCoupons(data.coupons || []);
        if (!isPublicPage) {
          if (data.role === 'master' && pageRef.current !== 'master') setPage('master');
          if (data.role === 'store' && pageRef.current === 'master') setPage('painel');
        }
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
  }, [authToken, adminSlug, isCatalog, isPrintPage, isPublicPage, isTracking, routeSlug]);

  React.useEffect(() => {
    if (loading || isPublicPage || !authToken || role !== 'store') return undefined;

    const checkForNewOrders = (nextOrders) => {
      const newestId = Math.max(...nextOrders.map((item) => item.id), 0);
      if (newestId > lastOrderId.current) {
        const newestOrder = nextOrders.find((order) => order.id === newestId);
        lastOrderId.current = newestId;
        if (pageRef.current !== 'catalogo') {
          setNewOrderAlert(newestOrder);
          playOrderSound();
          if (autoPrintEnabled && reserveAutoPrint(newestOrder.id)) {
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
  }, [loading, isPublicPage, authToken, autoPrintEnabled, role]);

  const toggleAutoPrint = (enabled) => {
    setAutoPrintEnabled(enabled);
    localStorage.setItem('pedija-auto-print', enabled ? 'yes' : 'no');
  };

  const login = async ({ user, password }) => {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ user, password, catalogSlug: adminSlug })
    });
    localStorage.setItem('pedija-admin-token', data.token);
    setRole(data.role);
    setAuthToken(data.token);
    setPage(data.role === 'master' ? 'master' : 'painel');
  };

  const logout = async () => {
    try {
      await api('/api/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('pedija-admin-token');
      setAuthToken('');
      setRole('');
      setPage(adminSlug ? 'painel' : 'master');
    }
  };

  const saveStore = async (store) => {
    const saved = await api('/api/store', {
      method: 'PUT',
      body: JSON.stringify(store)
    });
    setStoreData(saved);
  };

  const createEstablishment = async (establishment) => {
    const saved = await api('/api/establishments', {
      method: 'POST',
      body: JSON.stringify(establishment)
    });
    setEstablishments((current) => [saved, ...current]);
  };

  const updateEstablishment = async (establishment) => {
    const saved = await api(`/api/establishments/${establishment.id}`, {
      method: 'PUT',
      body: JSON.stringify(establishment)
    });
    setEstablishments((current) => current.map((item) => item.id === saved.id ? saved : item));
  };

  const deleteEstablishment = async (id) => {
    await api(`/api/establishments/${id}`, { method: 'DELETE' });
    setEstablishments((current) => current.filter((item) => item.id !== id));
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

  const createCoupon = async (coupon) => {
    const saved = await api('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
    setCoupons((current) => [saved, ...current]);
  };

  const updateCoupon = async (coupon) => {
    const saved = await api(`/api/coupons/${coupon.id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon)
    });
    setCoupons((current) => current.map((item) => item.id === saved.id ? saved : item));
  };

  const deleteCoupon = async (id) => {
    await api(`/api/coupons/${id}`, { method: 'DELETE' });
    setCoupons((current) => current.filter((item) => item.id !== id));
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
    return <Catalog store={storeData} products={products} coupons={coupons} onOrder={addOrder} storeSlug={routeSlug || storeData.catalogSlug} />;
  }

  if (isTracking) {
    return <OrderTracking store={storeData} order={orders[0]} loading={loading} />;
  }

  if (isPrintPage) {
    return <PrintOrderPage store={storeData} order={orders[0]} loading={loading} />;
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
    return <LoginPage onLogin={login} loading={loading} adminSlug={adminSlug} />;
  }

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} onLogout={logout} role={role || (adminSlug ? 'store' : 'master')} />
      <main className="content">
        {role === 'master' ? (
          <MasterPanel establishments={establishments} createEstablishment={createEstablishment} updateEstablishment={updateEstablishment} deleteEstablishment={deleteEstablishment} />
        ) : (
          <>
            {page === 'painel' && <Dashboard store={storeData} products={products} orders={orders} setPage={setPage} />}
            {page === 'estabelecimentos' && <Stores store={storeData} setStore={saveStore} setPage={setPage} />}
            {page === 'produtos' && <Products store={storeData} setStore={saveStore} products={products} createProduct={createProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} importProducts={importProducts} />}
            {page === 'pedidos' && <Orders orders={orders} updateOrderStatus={updateOrderStatusApi} deleteOrder={deleteOrder} setSelectedOrder={setSelectedOrder} autoPrintEnabled={autoPrintEnabled} setAutoPrintEnabled={toggleAutoPrint} />}
            {page === 'entregas' && <Deliveries orders={orders} updateOrderStatus={updateOrderStatusApi} setSelectedOrder={setSelectedOrder} />}
            {page === 'relatorios' && <Reports orders={orders} products={products} />}
            {page === 'cupons' && <Coupons coupons={coupons} createCoupon={createCoupon} updateCoupon={updateCoupon} deleteCoupon={deleteCoupon} />}
            {page === 'usuarios' && <UsersPage />}
          </>
        )}
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
    const frame = document.createElement('iframe');
    frame.title = `Impressao do pedido ${order.id}`;
    frame.className = 'print-frame';
    frame.src = `/imprimir/pedido/${order.id}?auto=1&slug=${encodeURIComponent(store.catalogSlug || '')}`;
    document.body.appendChild(frame);

    const cleanupTimeout = window.setTimeout(() => {
      frame.remove();
      onDone();
    }, 9000);

    return () => {
      window.clearTimeout(cleanupTimeout);
      frame.remove();
    };
  }, [onDone, order.id]);

  return null;
}

function Dashboard({ store, products, orders, setPage }) {
  const pending = orders.filter((order) => order.status === 'Pendente').length;
  const revenue = orders.filter((order) => order.status !== 'Cancelado').reduce((sum, order) => sum + orderTotal(order), 0);
  const catalogUrl = `/catalogo/${store.catalogSlug || 'catalogo'}`;
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
        <a href={catalogUrl}><Eye size={18} /> Abrir catalogo</a>
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

function MasterPanel({ establishments, createEstablishment, updateEstablishment, deleteEstablishment }) {
  const [editing, setEditing] = React.useState(null);
  const [actionStatus, setActionStatus] = React.useState('');
  const [deletingId, setDeletingId] = React.useState('');
  const activeCount = establishments.filter((item) => item.status === 'Ativo').length;
  const segmentCount = new Set(establishments.map((item) => item.segment)).size;
  const buildUrl = (path) => `${window.location.origin}${path}`;

  const copyText = async (text, message) => {
    await navigator.clipboard.writeText(text);
    alert(message);
  };

  const saveEstablishment = async (establishment) => {
    setActionStatus('');
    if (establishment.id) {
      await updateEstablishment(establishment);
    } else {
      await createEstablishment(establishment);
    }

    setEditing(null);
  };

  const removeEstablishment = async (establishment) => {
    setActionStatus('');
    if (!confirm(`Excluir o estabelecimento "${establishment.name}"?`)) return;
    setDeletingId(establishment.id);
    try {
      await deleteEstablishment(establishment.id);
    } catch (error) {
      setActionStatus(error.message || 'Nao consegui excluir este estabelecimento.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <PageHeader title="Painel Master" subtitle="Administre os clientes e segmentos da plataforma">
        <button className="orange-button" onClick={() => setEditing(createEstablishmentDraft())}>
          <Plus size={18} /> Novo estabelecimento
        </button>
      </PageHeader>
      <section className="metric-grid">
        <Metric label="Clientes cadastrados" value={establishments.length} icon={Store} />
        <Metric label="Clientes ativos" value={activeCount} icon={Check} />
        <Metric label="Segmentos usados" value={segmentCount} icon={Shield} />
      </section>
      {actionStatus && <p className="form-status error-status master-status">{actionStatus}</p>}
      <section className="client-list">
        {establishments.map((establishment) => (
          <article className="client-card" key={establishment.id}>
            <div className="client-main">
              <div>
                <h3>{establishment.name}</h3>
                <span className="client-segment">{segmentLabel(establishment.segment)}</span>
              </div>
              <div className="client-meta">
                <span><Store size={15} /> Plano {establishment.plan}</span>
                <span><Phone size={15} /> {establishment.phone || 'Sem WhatsApp'}</span>
                <span><ExternalLink size={15} /> /admin/{establishment.catalogSlug}</span>
                <span><Users size={15} /> {establishment.adminUser || 'Sem usuario'}</span>
                <span><Shield size={15} /> Senha: {establishment.adminPassword || 'Nao definida'}</span>
              </div>
            </div>
            <div className="client-actions">
              <span className={establishment.status === 'Ativo' ? 'green-pill' : 'pending-pill'}>{establishment.status}</span>
              <button className="ghost-button" onClick={() => copyText(`Link: ${buildUrl(`/admin/${establishment.catalogSlug}`)}\nUsuario: ${establishment.adminUser || 'admin'}\nSenha: ${establishment.adminPassword || ''}`, 'Dados de acesso copiados.')}><Copy size={17} /> Dados</button>
              <button className="ghost-button" onClick={() => copyText(buildUrl(`/admin/${establishment.catalogSlug}`), 'Link de acesso copiado.')}><Copy size={17} /> Acesso</button>
              <button className="ghost-button" onClick={() => copyText(buildUrl(`/catalogo/${establishment.catalogSlug}`), 'Link do catalogo copiado.')}><ExternalLink size={17} /> Catalogo</button>
              <button className="ghost-button" onClick={() => setEditing(establishment)}><Edit3 size={17} /> Editar</button>
              <button className="ghost-button danger-text" disabled={deletingId === establishment.id} onClick={() => removeEstablishment(establishment)}><Trash2 size={17} /> {deletingId === establishment.id ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </article>
        ))}
        {!establishments.length && (
          <article className="placeholder-panel">
            <strong>Nenhum estabelecimento cadastrado</strong>
            <p>Cadastre o primeiro cliente para comecar a organizar a plataforma por segmento.</p>
          </article>
        )}
      </section>
      {editing && (
        <EstablishmentModal
          establishment={editing}
          onSave={saveEstablishment}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function EstablishmentModal({ establishment, onSave, onClose }) {
  const [draft, setDraft] = React.useState(establishment);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      await onSave({
        ...draft,
        catalogSlug: slugify(draft.catalogSlug || draft.name)
      });
    } catch (error) {
      setStatus(error.message || 'Nao consegui salvar este cliente. Confira os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay">
      <form className="modal establishment-modal" onSubmit={save}>
        <div className="modal-head">
          <h2>{draft.id ? 'Editar cliente' : 'Novo cliente'}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Nome do estabelecimento<input value={draft.name} onChange={(event) => setField('name', event.target.value)} required /></label>
        <div className="form-grid">
          <label>Segmento
            <select value={draft.segment} onChange={(event) => setField('segment', event.target.value)}>
              {SEGMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Plano
            <select value={draft.plan} onChange={(event) => setField('plan', event.target.value)}>
              <option>Basico</option>
              <option>Pro</option>
              <option>Premium</option>
            </select>
          </label>
        </div>
        <div className="form-grid">
          <label>Status
            <select value={draft.status} onChange={(event) => setField('status', event.target.value)}>
              <option>Ativo</option>
              <option>Pausado</option>
              <option>Bloqueado</option>
            </select>
          </label>
          <label>WhatsApp<input value={draft.phone} onChange={(event) => setField('phone', event.target.value)} /></label>
        </div>
        <div className="form-grid">
          <label>Link do catalogo<input value={draft.catalogSlug} onChange={(event) => setField('catalogSlug', event.target.value)} /></label>
          <label>Usuario/admin<input value={draft.adminUser} onChange={(event) => setField('adminUser', event.target.value)} /></label>
        </div>
        <label>Senha de acesso do cliente<input value={draft.adminPassword || ''} onChange={(event) => setField('adminPassword', event.target.value)} required /></label>
        {draft.catalogSlug && (
          <div className="access-preview">
            <span>Link de acesso</span>
            <strong>{window.location.origin}/admin/{slugify(draft.catalogSlug)}</strong>
          </div>
        )}
        {status && <p className="form-status error-status">{status}</p>}
        <button className="orange-button" type="submit" disabled={saving}><Check size={18} /> {saving ? 'Salvando...' : 'Salvar cliente'}</button>
      </form>
    </div>
  );
}

function Stores({ store, setStore, setPage }) {
  const [editing, setEditing] = React.useState(false);
  const catalogUrl = `${window.location.origin}/catalogo/${store.catalogSlug || 'mercado'}`;
  const copyCatalog = async () => {
    await navigator.clipboard.writeText(catalogUrl);
    alert('Link do catalogo copiado.');
  };
  const downloadPrintInstaller = async () => {
    try {
      const token = localStorage.getItem('pedija-admin-token');
      const response = await fetch(`${API_BASE}/api/downloads/print-installer`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('download');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const disposition = response.headers.get('content-disposition') || '';
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `PediJa-Impressao-${store.catalogSlug || 'loja'}.bat`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Nao consegui baixar o instalador agora. Tente novamente.');
    }
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
      <section className="print-installer-panel">
        <div>
          <Printer size={22} />
          <div>
            <h3>Impressao direta no PDV</h3>
            <p>Baixe o instalador deste estabelecimento para criar o atalho de impressao automatica no computador do caixa.</p>
          </div>
        </div>
        <button className="ghost-button" type="button" onClick={downloadPrintInstaller}><Download size={18} /> Baixar instalador</button>
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
      const image = await resizeImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.92, format: 'image/png' });
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
          <label className="highlight-field">Horario de funcionamento<input value={draft.hours} onChange={(event) => setField('hours', event.target.value)} placeholder="Ex: 08:00 - 18:00" required /><small>Use o formato 08:00 - 18:00.</small></label>
          <label>Link do catalogo<input value={draft.catalogSlug} onChange={(event) => setField('catalogSlug', event.target.value)} /></label>
        </div>
        <div className="form-grid">
          <label>Chave PIX<input value={draft.pixKey || ''} onChange={(event) => setField('pixKey', event.target.value)} placeholder="CPF, CNPJ, telefone, e-mail ou chave aleatoria" /></label>
          <label>Nome do recebedor PIX<input value={draft.pixName || ''} onChange={(event) => setField('pixName', event.target.value)} placeholder={draft.name} /></label>
        </div>
        <div className="form-grid">
          <label>Taxa de entrega<input type="number" step="0.01" value={draft.deliveryFee || 0} onChange={(event) => setField('deliveryFee', event.target.value)} /></label>
          <label>Pedido minimo<input type="number" step="0.01" value={draft.minOrder || 0} onChange={(event) => setField('minOrder', event.target.value)} /></label>
        </div>
        <label>Bairros/areas atendidas<textarea value={draft.deliveryAreas || ''} onChange={(event) => setField('deliveryAreas', event.target.value)} placeholder="Ex: Centro, Jardim das Flores, Vila Nova. Deixe em branco para atender todos." /></label>
        <label>Bairros com taxa<textarea value={deliveryZonesToText(draft.deliveryZones)} onChange={(event) => setField('deliveryZones', parseDeliveryZones(event.target.value))} placeholder="Um por linha. Ex: Centro=5, Jardim das Flores=8" /></label>
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

function Products({ store, setStore, products, createProduct, updateProduct, deleteProduct, importProducts }) {
  const [tab, setTab] = React.useState('Produtos');
  const [editing, setEditing] = React.useState(null);
  const [importing, setImporting] = React.useState(false);
  const categories = sortedCategories(products, store.categoryOrder);
  const productsByCategory = categories.map((category) => [
    category,
    sortProductsForCatalog(products.filter((product) => (product.category || 'Sem categoria') === category))
  ]);
  const productTabs = ['Produtos', 'Categorias'];
  const savePizzaOptions = async (field, value) => {
    await setStore({ ...store, [field]: parsePricedOptions(value) });
  };

  const saveProduct = (product) => {
    const categoryProducts = products.filter((item) => (item.category || 'Sem categoria') === (product.category || 'Sem categoria'));
    if (product.id) updateProduct(product);
    else createProduct({ ...product, active: true, featured: Boolean(product.featured), sortOrder: nextSortOrder(categoryProducts) });
    setEditing(null);
  };

  const moveProduct = async (product, direction) => {
    const categoryProducts = sortProductsForCatalog(products.filter((item) => (item.category || 'Sem categoria') === (product.category || 'Sem categoria')));
    const index = categoryProducts.findIndex((item) => item.id === product.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= categoryProducts.length) return;

    const first = categoryProducts[index];
    const second = categoryProducts[swapIndex];
    await updateProduct({ ...first, sortOrder: normalizedSortOrder(second, swapIndex) });
    await updateProduct({ ...second, sortOrder: normalizedSortOrder(first, index) });
  };

  const moveCategory = async (category, direction) => {
    const index = categories.indexOf(category);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return;

    const nextOrder = [...categories];
    [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];
    await setStore({ ...store, categoryOrder: nextOrder });
  };

  return (
    <>
      <PageHeader title="Produtos & Categorias" subtitle="Gerencie seu cardapio">
        <select aria-label="Estabelecimento">
          <option>{store.name}</option>
        </select>
      </PageHeader>
      <div className="tabs">
        {productTabs.map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === 'Produtos' ? (
        <>
          <div className="product-toolbar">
            <button className="orange-button new-product" onClick={() => setEditing({ code: '', name: '', price: 0, category: 'Sem categoria', image: '', promo: false, featured: false, stock: 0, active: true, productType: 'normal', optionGroups: [] })}>
              <Plus size={18} /> Novo Produto
            </button>
            <button className="ghost-button new-product" onClick={() => setImporting(true)}>
              <PackagePlus size={18} /> Importar PDF ERP
            </button>
          </div>
          <div className="product-groups">
            {productsByCategory.map(([category, categoryProducts]) => (
              <section key={category}>
                <div className="product-group-head">
                  <h3>{category}</h3>
                  <div className="category-actions">
                    <button type="button" disabled={categories.indexOf(category) === 0} onClick={() => moveCategory(category, 'up')} aria-label={`Subir categoria ${category}`}><ChevronUp size={16} /> Subir</button>
                    <button type="button" disabled={categories.indexOf(category) === categories.length - 1} onClick={() => moveCategory(category, 'down')} aria-label={`Descer categoria ${category}`}><ChevronDown size={16} /> Descer</button>
                  </div>
                </div>
                {categoryProducts.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isFirst={index === 0}
                    isLast={index === categoryProducts.length - 1}
                    onEdit={() => setEditing(product)}
                    onToggle={() => updateProduct({ ...product, active: !product.active })}
                    onMoveUp={() => moveProduct(product, 'up')}
                    onMoveDown={() => moveProduct(product, 'down')}
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
      ) : tab === 'Categorias' ? (
        <>
          <section className="category-list">
            {categories.map((category, index) => (
              <article key={category}>
                <Box size={18} />
                <strong>{category}</strong>
                <span>{products.filter((product) => product.category === category).length} produtos</span>
                <div className="category-actions">
                  <button type="button" disabled={index === 0} onClick={() => moveCategory(category, 'up')} aria-label={`Subir categoria ${category}`}><ChevronUp size={16} /> Subir</button>
                  <button type="button" disabled={index === categories.length - 1} onClick={() => moveCategory(category, 'down')} aria-label={`Descer categoria ${category}`}><ChevronDown size={16} /> Descer</button>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
      {editing && <ProductModal store={store} product={editing} onSave={saveProduct} onClose={() => setEditing(null)} />}
      {importing && <PdfImportModal importProducts={importProducts} onClose={() => setImporting(false)} />}
    </>
  );
}

function ProductRow({ product, isFirst, isLast, onEdit, onToggle, onMoveUp, onMoveDown, onDelete }) {
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
      {product.featured && <span className="featured-pill"><Star size={13} /> Destaque</span>}
      {isConfigurableProduct(product) && <span className="featured-pill"><Settings size={13} /> Com escolhas</span>}
      <span className="stock">Estoque {product.stock}</span>
      <div className="row-actions">
        <button aria-label="Subir produto" disabled={isFirst} onClick={onMoveUp}><ChevronUp size={17} /></button>
        <button aria-label="Descer produto" disabled={isLast} onClick={onMoveDown}><ChevronDown size={17} /></button>
        <button aria-label="Status" onClick={onToggle}><Settings size={18} /></button>
        <button aria-label="Editar" onClick={onEdit}><Edit3 size={18} /></button>
        <button aria-label="Excluir" className="danger" onClick={onDelete}><Trash2 size={18} /></button>
      </div>
    </article>
  );
}

function PizzaOptionsPanel({ store, onSaveFlavors, onSaveBorders }) {
  const [flavorsText, setFlavorsText] = React.useState(pricedOptionsToText(store.pizzaFlavors));
  const [bordersText, setBordersText] = React.useState(pricedOptionsToText(store.pizzaBorders));
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    setFlavorsText(pricedOptionsToText(store.pizzaFlavors));
    setBordersText(pricedOptionsToText(store.pizzaBorders));
  }, [store.pizzaFlavors, store.pizzaBorders]);

  const save = async (event) => {
    event.preventDefault();
    setStatus('Salvando opcoes...');
    await onSaveFlavors(flavorsText);
    await onSaveBorders(bordersText);
    setStatus('Opcoes de pizza salvas.');
  };

  return (
    <form className="pizza-options-panel" onSubmit={save}>
      <h3>Opcoes de pizza</h3>
      <p>Cadastre sabores e bordas uma vez. Depois, no produto, marque o tipo como Pizza.</p>
      <div className="form-grid">
        <label>Sabores<textarea value={flavorsText} onChange={(event) => setFlavorsText(event.target.value)} placeholder="Mussarela=0&#10;Calabresa=2&#10;Frango com catupiry=5" /></label>
        <label>Bordas<textarea value={bordersText} onChange={(event) => setBordersText(event.target.value)} placeholder="Sem borda=0&#10;Catupiry=6&#10;Cheddar=7" /></label>
      </div>
      {status && <p className="form-status">{status}</p>}
      <button className="orange-button" type="submit"><Check size={18} /> Salvar opcoes de pizza</button>
    </form>
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

function ProductModal({ store, product, onSave, onClose }) {
  const [draft, setDraft] = React.useState(() => normalizeProductForEditing(product, store));
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const configurable = isConfigurableProduct(draft);
  const updateGroup = (index, field, value) => setDraft((current) => {
    const optionGroups = normalizeOptionGroups(current.optionGroups).map((group, groupIndex) => (
      groupIndex === index ? { ...group, [field]: value } : group
    ));
    return { ...current, optionGroups };
  });
  const updateGroupOptions = (index, value) => updateGroup(index, 'optionsText', value);
  const addGroup = () => setDraft((current) => ({
    ...current,
    optionGroups: [
      ...normalizeOptionGroups(current.optionGroups),
      { id: crypto.randomUUID(), name: 'Adicionais', min: 0, max: 1, pricing: 'sum', optionsText: '' }
    ]
  }));
  const removeGroup = (index) => setDraft((current) => ({
    ...current,
    optionGroups: normalizeOptionGroups(current.optionGroups).filter((_, groupIndex) => groupIndex !== index)
  }));
  const applyPreset = (preset) => setDraft((current) => ({
    ...current,
    productType: 'custom',
    optionGroups: presetOptionGroups(preset)
  }));
  const submit = (event) => {
    event.preventDefault();
    const optionGroups = configurable ? prepareOptionGroupsForSave(draft.optionGroups) : [];
    onSave({
      ...draft,
      price: Number(draft.price),
      stock: Number(draft.stock),
      slices: Number(draft.slices || 0),
      maxFlavors: Number(draft.maxFlavors || 1),
      productType: configurable ? 'custom' : 'normal',
      optionGroups
    });
  };

  return (
    <div className="overlay">
      <form className="modal" onSubmit={submit}>
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
        <label>Tipo de venda<select value={configurable ? 'custom' : 'normal'} onChange={(event) => setField('productType', event.target.value)}>
            <option value="normal">Produto simples</option>
            <option value="custom">Produto com escolhas</option>
          </select></label>
        <label>Imagem URL opcional<input value={draft.image || ''} onChange={(event) => setField('image', event.target.value)} placeholder="Pode deixar em branco" /></label>
        {configurable && (
          <section className="segment-options product-options-editor">
            <div className="options-editor-head">
              <div>
                <strong>Montagem deste produto</strong>
                <small>Use para pizza, lanche, marmita, porcao ou qualquer produto com acrescimos.</small>
              </div>
              <button className="ghost-button" type="button" onClick={addGroup}><Plus size={16} /> Grupo</button>
            </div>
            <div className="form-grid">
              <label>Quantidade de fatias<input type="number" min="0" value={draft.slices || ''} onChange={(event) => setField('slices', event.target.value)} placeholder="Ex: 8" /></label>
              <label>Tamanho/descricao<input value={draft.pizzaSize || ''} onChange={(event) => setField('pizzaSize', event.target.value)} placeholder="Ex: Grande, 500g, X-tudo" /></label>
            </div>
            <div className="preset-actions">
              <button type="button" onClick={() => applyPreset('pizza')}>Modelo pizza</button>
              <button type="button" onClick={() => applyPreset('snack')}>Modelo lanche</button>
              <button type="button" onClick={() => applyPreset('meal')}>Modelo marmita</button>
            </div>
            {normalizeOptionGroups(draft.optionGroups).map((group, index) => (
              <article className="option-group-editor" key={group.id || index}>
                <div className="option-group-title">
                  <label>Nome do grupo<input value={group.name} onChange={(event) => updateGroup(index, 'name', event.target.value)} placeholder="Sabores, Borda, Adicionais" /></label>
                  <button type="button" className="danger-text-button" onClick={() => removeGroup(index)}><Trash2 size={15} /> Remover</button>
                </div>
                <div className="form-grid compact-grid">
                  <label>Minimo<input type="number" min="0" value={group.min} onChange={(event) => updateGroup(index, 'min', event.target.value)} /></label>
                  <label>Maximo<input type="number" min="1" value={group.max} onChange={(event) => updateGroup(index, 'max', event.target.value)} /></label>
                  <label>Preco<select value={group.pricing || 'sum'} onChange={(event) => updateGroup(index, 'pricing', event.target.value)}>
                    <option value="sum">Somar opcoes</option>
                    <option value="highest">Cobrar maior valor</option>
                    <option value="free">Nao cobrar</option>
                  </select></label>
                </div>
                <label>Opcoes<textarea value={group.optionsText ?? pricedOptionsToText(group.options)} onChange={(event) => updateGroupOptions(index, event.target.value)} placeholder="Calabresa=0&#10;Frango com catupiry=5&#10;Cheddar=7" /></label>
              </article>
            ))}
            {!normalizeOptionGroups(draft.optionGroups).length && <p className="empty">Clique em Grupo ou escolha um modelo para cadastrar sabores, bordas e adicionais.</p>}
          </section>
        )}
        <label className="check-line"><input type="checkbox" checked={draft.promo} onChange={(event) => setField('promo', event.target.checked)} /> Produto em promocao</label>
        <label className="check-line"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Mostrar em destaque no catalogo</label>
        <label className="check-line"><input type="checkbox" checked={draft.active !== false} onChange={(event) => setField('active', event.target.checked)} /> Produto disponivel para venda</label>
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
  const courierLocationUrl = order.location?.mapsUrl ? buildCourierLocationWhatsapp(order) : '';

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
        {order.location?.mapsUrl && <a href={order.location.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={14} /> GPS</a>}
        {courierLocationUrl && <a href={courierLocationUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Local</a>}
        <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
        <button className="danger-text" onClick={removeOrder}><Trash2 size={14} /> Excluir</button>
      </div>
    </article>
  );
}

function Deliveries({ orders, updateOrderStatus, setSelectedOrder }) {
  const deliveryOrders = orders.filter((order) => order.deliveryMethod !== 'Retirada' && ['Pendente', 'Em separacao', 'Saiu para entrega'].includes(order.status));

  return (
    <>
      <PageHeader title="Entregas" subtitle="Roteiro rapido para o entregador" />
      <section className="delivery-board">
        {deliveryOrders.map((order) => (
          <article className="delivery-card" key={order.id}>
            <div>
              <strong>Pedido #{order.id}</strong>
              <span>{order.status}</span>
            </div>
            <h3>{order.customer}</h3>
            <p>{order.address}</p>
            <small>{order.phone}</small>
            <div className="delivery-actions">
              <button type="button" onClick={() => setSelectedOrder(order)}>Ver pedido</button>
              {order.location?.mapsUrl && <a href={order.location.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={15} /> GPS</a>}
              <button type="button" onClick={() => updateOrderStatus(order.id, 'Saiu para entrega')}>Saiu</button>
              <button type="button" onClick={() => updateOrderStatus(order.id, 'Entregue')}>Entregue</button>
            </div>
          </article>
        ))}
        {!deliveryOrders.length && <p className="empty">Nenhuma entrega pendente agora.</p>}
      </section>
    </>
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
  const courierLocationUrl = order.location?.mapsUrl ? buildCourierLocationWhatsapp(order) : '';

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
          {order.location?.mapsUrl && <a className="ghost-button" href={order.location.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={17} /> Abrir GPS</a>}
          {courierLocationUrl && <a className="ghost-button" href={courierLocationUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Enviar localizacao</a>}
          <a className="ghost-button" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Enviar status</a>
          <button className="ghost-button danger-button" onClick={removeOrder}><Trash2 size={17} /> Excluir</button>
          <button className="orange-button" onClick={printOrder}><Printer size={17} /> Imprimir termica</button>
        </div>
      </section>
    </div>
  );
}

function ThermalTicket({ store, order }) {
  const discount = Number(order.discount || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
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
      {order.location?.mapsUrl && <p>Mapa: {order.location.mapsUrl}</p>}
      {order.deliveryNeighborhood && <p>Bairro: {order.deliveryNeighborhood}</p>}
      {order.substitution && <p>Falta produto: {order.substitution}</p>}
      {order.notes && <p>Obs: {order.notes}</p>}
      <hr />
      {order.items.map((item) => (
        <div className="ticket-item" key={`${item.productId}-${item.name}`}>
          <div className="ticket-line">
            <span>{item.qty}x {item.name}</span>
            <strong>{BRL.format(item.qty * itemUnitPrice(item))}</strong>
          </div>
          {formatItemOptions(item) && <small>{formatItemOptions(item)}</small>}
          {item.notes && <small>Obs item: {item.notes}</small>}
        </div>
      ))}
      <hr />
      {discount > 0 && (
        <div className="ticket-line">
          <span>Desconto {order.coupon ? `(${order.coupon})` : ''}</span>
          <strong>-{BRL.format(discount)}</strong>
        </div>
      )}
      {deliveryFee > 0 && (
        <div className="ticket-line">
          <span>Entrega</span>
          <strong>{BRL.format(deliveryFee)}</strong>
        </div>
      )}
      <div className="ticket-line total">
        <span>Total</span>
        <strong>{BRL.format(orderTotal(order))}</strong>
      </div>
      <p>Pagamento: {order.payment}</p>
      {order.paymentStatus && <p>Pagamento: {order.paymentStatus}</p>}
      <p>Status: {order.status}</p>
    </div>
  );
}

function PrintOrderPage({ store, order, loading }) {
  React.useEffect(() => {
    if (loading || !order) return undefined;

    const timeout = window.setTimeout(() => {
      window.print();
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [loading, order]);

  if (loading) {
    return (
      <main className="print-page">
        <p>Preparando impressao...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="print-page">
        <p>Pedido nao encontrado.</p>
      </main>
    );
  }

  return (
    <main className="print-page">
      <ThermalTicket store={store} order={order} />
    </main>
  );
}

function Catalog({ store, products, coupons, onOrder, storeSlug }) {
  const [query, setQuery] = React.useState('');
  const [cart, setCart] = React.useState({});
  const [productNotes, setProductNotes] = React.useState({});
  const [customer, setCustomer] = React.useState({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', deliveryNeighborhood: '', substitution: 'Me chamar no WhatsApp', notes: '' });
  const [sentOrder, setSentOrder] = React.useState(null);
  const [checkoutStep, setCheckoutStep] = React.useState('products');
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [couponMessage, setCouponMessage] = React.useState('');
  const [locationStatus, setLocationStatus] = React.useState('');
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [deliveryLocation, setDeliveryLocation] = React.useState(null);
  const [orderStatus, setOrderStatus] = React.useState('');
  const [sendingOrder, setSendingOrder] = React.useState(false);
  const [customizingProduct, setCustomizingProduct] = React.useState(null);
  const activeProducts = products.filter((product) => product.active && product.name.toLowerCase().includes(query.toLowerCase()));
  const items = Object.entries(cart).map(([key, entry]) => {
    const productId = cartEntryProductId(key, entry);
    const product = products.find((item) => item.id === productId);
    const qty = cartEntryQty(entry);
    return product ? {
      cartKey: key,
      productId,
      name: product.name,
      price: product.price,
      qty,
      notes: productNotes[key] || '',
      optionGroups: Array.isArray(entry?.optionGroups) ? entry.optionGroups : [],
      optionsPrice: Number(entry?.optionsPrice || 0),
      flavors: Array.isArray(entry?.flavors) ? entry.flavors : [],
      border: entry?.border || '',
      borderPrice: Number(entry?.borderPrice || 0),
      flavorPrice: Number(entry?.flavorPrice || 0),
      slices: isConfigurableProduct(product) ? product.slices || 0 : 0,
      pizzaSize: product.pizzaSize || ''
    } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.qty * itemUnitPrice(item), 0);
  const discount = appliedCoupon ? couponDiscount(appliedCoupon, subtotal) : 0;
  const deliveryZones = Array.isArray(store.deliveryZones) ? store.deliveryZones : [];
  const selectedZone = deliveryZones.find((zone) => zone.name === customer.deliveryNeighborhood);
  const deliveryFee = customer.deliveryMethod === 'Entrega' ? Number(selectedZone?.fee ?? store.deliveryFee ?? 0) : 0;
  const minOrder = Number(store.minOrder || 0);
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const belowMinOrder = minOrder > 0 && subtotal < minOrder;
  const closedInfo = storeOpenInfo(store);
  const catalogCategories = groupProductsByCategory(activeProducts, store.categoryOrder);
  const featuredProducts = sortProductsForCatalog(activeProducts.filter((product) => product.featured || product.promo)).slice(0, 12);

  const addProduct = (product) => {
    if (isConfigurableProduct(product)) {
      setCustomizingProduct(product);
      return;
    }

    addConfiguredProduct(product, {});
  };
  const addConfiguredProduct = (product, options) => {
    const key = cartKey(product.id, options);
    setCart((current) => {
      const currentEntry = current[key];
      const qty = cartEntryQty(currentEntry) + 1;
      return {
        ...current,
        [key]: {
          productId: product.id,
          qty,
          optionGroups: options.optionGroups || [],
          optionsPrice: Number(options.optionsPrice || 0),
          flavors: options.flavors || [],
          border: options.border || '',
          flavorPrice: Number(options.flavorPrice || 0),
          borderPrice: Number(options.borderPrice || 0)
        }
      };
    });
  };
  const removeProduct = (product) => setCart((current) => {
    const key = Object.keys(current).reverse().find((itemKey) => cartEntryProductId(itemKey, current[itemKey]) === product.id);
    if (!key) return current;
    const entry = current[key];
    const qty = cartEntryQty(entry) - 1;
    const next = { ...current };
    if (qty <= 0) delete next[key];
    else next[key] = typeof entry === 'number' ? qty : { ...entry, qty };
    return next;
  });
  const updateItemNote = (id, value) => setProductNotes((current) => ({ ...current, [id]: value }));
  const updateCustomerPhone = (value) => setCustomer((current) => ({ ...current, phone: formatBrazilPhone(value) }));

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = coupons.find((item) => item.active && item.code === code);

    if (!coupon) {
      setAppliedCoupon(null);
      setCouponMessage('Cupom invalido ou inativo.');
      return;
    }

    if (subtotal < coupon.minOrder) {
      setAppliedCoupon(null);
      setCouponMessage(`Pedido minimo de ${BRL.format(coupon.minOrder)} para usar este cupom.`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponMessage(`Cupom ${coupon.code} aplicado.`);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Seu navegador nao permite compartilhar localizacao.');
      return;
    }

    setLocationLoading(true);
    setLocationStatus('Buscando sua localizacao...');

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      try {
        const address = await reverseGeocode(latitude, longitude);
        setCustomer((current) => ({
          ...current,
          address: address || current.address
        }));
        setDeliveryLocation({ latitude, longitude, mapsUrl, address });
        setLocationStatus(address
          ? 'Confira se o endereco preenchido esta correto antes de enviar o pedido.'
          : 'Nao consegui identificar a rua automaticamente. Confira o mapa e preencha o endereco.');
      } catch {
        setDeliveryLocation({ latitude, longitude, mapsUrl, address: '' });
        setLocationStatus('Peguei sua localizacao, mas nao consegui converter em endereco. Preencha o endereco e confira o mapa.');
      } finally {
        setLocationLoading(false);
      }
    }, () => {
      setLocationLoading(false);
      setLocationStatus('Nao foi possivel acessar sua localizacao. Voce pode preencher o endereco manualmente.');
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    });
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setOrderStatus('');
    if (!items.length) return setOrderStatus('Adicione produtos ao pedido.');
    if (!closedInfo.open) return setOrderStatus(closedInfo.message);
    if (belowMinOrder) return setOrderStatus(`Pedido minimo de ${BRL.format(minOrder)} para este estabelecimento.`);
    if (customer.deliveryMethod === 'Entrega' && !customer.address.trim()) return setOrderStatus('Informe o endereco para entrega.');
    if (customer.deliveryMethod === 'Entrega' && deliveryZones.length && !customer.deliveryNeighborhood) return setOrderStatus('Selecione o bairro de entrega.');

    setSendingOrder(true);
    try {
      const address = customer.deliveryMethod === 'Retirada'
        ? 'Retirada no balcao'
        : [customer.address, customer.deliveryNeighborhood].filter(Boolean).join(' - ');
      const formattedPhone = formatBrazilPhone(customer.phone);
      const orderId = await onOrder({
        customer: customer.name,
        phone: formattedPhone,
        address,
        payment: customer.payment,
        deliveryMethod: customer.deliveryMethod,
        deliveryNeighborhood: customer.deliveryNeighborhood,
        notes: customer.notes,
        substitution: customer.substitution,
        location: deliveryLocation,
        storeSlug,
        coupon: appliedCoupon ? appliedCoupon.code : '',
        discount,
        deliveryFee,
        paymentStatus: customer.payment === 'PIX' ? 'Aguardando comprovante' : 'A combinar',
        status: 'Pendente',
        createdAt: 'Agora',
        items
      });
      setSentOrder({ id: orderId, customer: customer.name, phone: formattedPhone, address, payment: customer.payment, deliveryMethod: customer.deliveryMethod, deliveryNeighborhood: customer.deliveryNeighborhood, notes: customer.notes, substitution: customer.substitution, location: deliveryLocation, total, items, coupon: appliedCoupon ? appliedCoupon.code : '', discount, deliveryFee, paymentStatus: customer.payment === 'PIX' ? 'Aguardando comprovante' : 'A combinar' });
      setCart({});
      setProductNotes({});
      setCustomer({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', deliveryNeighborhood: '', substitution: 'Me chamar no WhatsApp', notes: '' });
      setDeliveryLocation(null);
      setLocationStatus('');
      setCheckoutStep('products');
    } catch (error) {
      setOrderStatus(error.message || 'Nao consegui enviar o pedido. Tente novamente.');
    } finally {
      setSendingOrder(false);
    }
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
                <a href={`/pedido/${sentOrder.id}?slug=${encodeURIComponent(storeSlug || store.catalogSlug || '')}`}>Acompanhar status</a>
                <a href={buildStoreOrderWhatsapp(store, sentOrder)} target="_blank" rel="noreferrer">Enviar pelo WhatsApp</a>
                {sentOrder.payment === 'PIX' && <a href={buildPaymentProofWhatsapp(store, sentOrder)} target="_blank" rel="noreferrer">Enviar comprovante</a>}
              </div>
            </div>
          </div>
        )}
        {!closedInfo.open && (
          <div className="closed-message">
            <Clock size={20} />
            <strong>{closedInfo.message}</strong>
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
                  <span key={item.cartKey || item.productId}>{item.qty}x {item.name}</span>
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
              <div className="catalog-sections">
                {featuredProducts.length > 0 && (
                  <section className="catalog-category featured-category">
                    <div className="catalog-category-head">
                      <h2>Destaques</h2>
                      <span>{featuredProducts.length} itens</span>
                    </div>
                    <div className="catalog-grid">
                      {featuredProducts.map((product) => (
                        <article className="catalog-item" key={`featured-${product.id}`}>
                          <ProductThumb product={product} />
                          <div>
                            <span>{product.category}</span>
                            <h3>{product.name}</h3>
                            <strong>{BRL.format(product.price)}</strong>
                          </div>
                          <div className="stepper">
                            <button onClick={() => removeProduct(product)}>-</button>
                            <b>{productCartQty(cart, product.id)}</b>
                            <button onClick={() => addProduct(product)}>+</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {catalogCategories.map(([category, categoryProducts]) => (
                  <section className="catalog-category" key={category}>
                    <div className="catalog-category-head">
                      <h2>{category}</h2>
                      <span>{categoryProducts.length} itens</span>
                    </div>
                    <div className="catalog-grid">
                      {categoryProducts.map((product) => (
                        <article className="catalog-item" key={product.id}>
                          <ProductThumb product={product} />
                          <div>
                            <span>{product.category}</span>
                            <h3>{product.name}</h3>
                            <strong>{BRL.format(product.price)}</strong>
                          </div>
                          <div className="stepper">
                            <button onClick={() => removeProduct(product)}>-</button>
                            <b>{productCartQty(cart, product.id)}</b>
                            <button onClick={() => addProduct(product)}>+</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                {!catalogCategories.length && <p className="empty">Nenhum produto encontrado.</p>}
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
              <div className="cart-line item-note-line" key={item.cartKey || item.productId}>
                <div>
                  <span>{item.qty}x {item.name}</span>
                  {formatItemOptions(item) && <small>{formatItemOptions(item)}</small>}
                  <input value={productNotes[item.cartKey || item.productId] || ''} onChange={(event) => updateItemNote(item.cartKey || item.productId, event.target.value)} placeholder="Observacao deste item" />
                </div>
                <strong>{BRL.format(item.qty * itemUnitPrice(item))}</strong>
              </div>
            )) : <p className="empty">Escolha produtos no catalogo.</p>}
            <div className="checkout-summary">
              <div><span>Subtotal</span><strong>{BRL.format(subtotal)}</strong></div>
              {discount > 0 && <div><span>Desconto</span><strong>-{BRL.format(discount)}</strong></div>}
              {customer.deliveryMethod === 'Entrega' && <div><span>Entrega</span><strong>{deliveryFee > 0 ? BRL.format(deliveryFee) : 'Gratis'}</strong></div>}
              <div className="cart-total"><span>Total</span><strong>{BRL.format(total)}</strong></div>
            </div>
            {belowMinOrder && <p className="checkout-warning">Pedido minimo de {BRL.format(minOrder)}. Faltam {BRL.format(Math.max(0, minOrder - subtotal))} para finalizar.</p>}
            <div className="coupon-box">
              <label>Cupom<input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Ex: 10OFF" /></label>
              <button className="ghost-button" type="button" onClick={applyCoupon}>Aplicar</button>
              {couponMessage && <span>{couponMessage}</span>}
              {discount > 0 && <strong>Desconto {BRL.format(discount)}</strong>}
            </div>
            <label>Nome<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} required /></label>
            <label>Telefone<input value={customer.phone} onChange={(event) => updateCustomerPhone(event.target.value)} inputMode="tel" placeholder="(66)99999-9999" required /></label>
            <label>Entrega<select value={customer.deliveryMethod} onChange={(event) => setCustomer({ ...customer, deliveryMethod: event.target.value })}><option>Entrega</option><option>Retirada</option></select></label>
            {customer.deliveryMethod === 'Entrega' && (
              <div className="location-box">
                {deliveryZones.length > 0 && (
                  <label>Bairro<select value={customer.deliveryNeighborhood} onChange={(event) => setCustomer({ ...customer, deliveryNeighborhood: event.target.value })} required>
                    <option value="">Selecione o bairro</option>
                    {deliveryZones.map((zone) => (
                      <option value={zone.name} key={zone.name}>{zone.name} - {Number(zone.fee || 0) > 0 ? BRL.format(zone.fee) : 'Gratis'}</option>
                    ))}
                  </select></label>
                )}
                {store.deliveryAreas && (
                  <div className="delivery-areas">
                    <span>Areas atendidas</span>
                    <strong>{store.deliveryAreas}</strong>
                  </div>
                )}
                <label>Endereco<input value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} required /></label>
                <button className="ghost-button" type="button" onClick={useCurrentLocation} disabled={locationLoading}>
                  <MapPin size={17} /> {locationLoading ? 'Buscando...' : 'Usar minha localizacao'}
                </button>
                {locationStatus && <p>{locationStatus}</p>}
                {deliveryLocation?.mapsUrl && <a href={deliveryLocation.mapsUrl} target="_blank" rel="noreferrer">Abrir localizacao no mapa</a>}
              </div>
            )}
            <label>Se faltar algum produto<select value={customer.substitution} onChange={(event) => setCustomer({ ...customer, substitution: event.target.value })}>
              <option>Me chamar no WhatsApp</option>
              <option>Pode substituir por similar</option>
              <option>Remover do pedido</option>
            </select></label>
            <label>Observacoes<textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Ex: troco, ponto de referencia, item substituto" /></label>
            <label>Pagamento<select value={customer.payment} onChange={(event) => setCustomer({ ...customer, payment: event.target.value })}><option>PIX</option><option>Dinheiro</option><option>Cartao</option></select></label>
            {customer.payment === 'PIX' && (
              <div className="pix-manual-box">
                <span>Pagamento via PIX manual</span>
                {store.pixKey ? (
                  <>
                    <strong>{store.pixKey}</strong>
                    <small>{store.pixName || store.name}</small>
                    <button className="ghost-button" type="button" onClick={() => copyPixKey(store.pixKey)}>Copiar chave PIX</button>
                    <p>Depois de pagar, envie o comprovante pelo WhatsApp do mercado.</p>
                  </>
                ) : (
                  <p>Este estabelecimento ainda nao cadastrou uma chave PIX.</p>
                )}
              </div>
            )}
            {orderStatus && <p className="checkout-warning">{orderStatus}</p>}
            <button className="orange-button" type="submit" disabled={sendingOrder}><ShoppingBag size={18} /> {sendingOrder ? 'Enviando...' : 'Enviar pedido'}</button>
          </form>
        )}
      </section>
      {customizingProduct && (
        <ProductCustomizeModal
          store={store}
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAdd={(options) => {
            addConfiguredProduct(customizingProduct, options);
            setCustomizingProduct(null);
          }}
        />
      )}
    </main>
  );
}

function ProductCustomizeModal({ store, product, onAdd, onClose }) {
  const groups = optionGroupsForProduct(product, store);
  const [selected, setSelected] = React.useState(() => initialSelectedOptions(groups));
  const selectedOptionGroups = buildSelectedOptionGroups(groups, selected);
  const optionsPrice = calculateOptionsPrice(groups, selected);
  const finalPrice = Number(product.price || 0) + optionsPrice;
  const validation = validateSelectedOptions(groups, selected);

  const toggleOption = (group, option) => {
    setSelected((current) => {
      const currentNames = current[group.id] || [];
      const selectedAlready = currentNames.includes(option.name);
      if (selectedAlready) {
        return { ...current, [group.id]: currentNames.filter((name) => name !== option.name) };
      }

      if (Number(group.max || 1) <= 1) {
        return { ...current, [group.id]: [option.name] };
      }

      if (currentNames.length >= Number(group.max || 1)) {
        return { ...current, [group.id]: [...currentNames.slice(1), option.name] };
      }

      return { ...current, [group.id]: [...currentNames, option.name] };
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (validation) return;
    onAdd({
      optionGroups: selectedOptionGroups,
      optionsPrice,
      flavors: selectedOptionGroups.find((group) => isFlavorGroup(group.name))?.options.map((item) => item.name) || [],
      border: selectedOptionGroups.find((group) => normalizeText(group.name).includes('borda'))?.options[0]?.name || '',
      flavorPrice: selectedOptionGroups.find((group) => isFlavorGroup(group.name))?.price || 0,
      borderPrice: selectedOptionGroups.find((group) => normalizeText(group.name).includes('borda'))?.price || 0
    });
  };

  return (
    <div className="overlay">
      <form className="modal pizza-modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{product.name}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        {(product.pizzaSize || product.slices) && (
          <p className="pizza-summary">{[product.pizzaSize, product.slices ? `${product.slices} fatias` : ''].filter(Boolean).join(' - ')}</p>
        )}
        {groups.map((group) => (
          <div className="pizza-choice-list" key={group.id}>
            <strong>{group.name} <small>{optionGroupRuleText(group)}</small></strong>
            {group.options.map((item) => (
              <label className="check-line" key={item.name}>
                <input
                  type={Number(group.max || 1) <= 1 ? 'radio' : 'checkbox'}
                  name={`group-${group.id}`}
                  checked={(selected[group.id] || []).includes(item.name)}
                  onChange={() => toggleOption(group, item)}
                />
                <span>{item.name} {item.price > 0 ? `+ ${BRL.format(item.price)}` : ''}</span>
              </label>
            ))}
          </div>
        ))}
        {validation && <p className="checkout-warning">{validation}</p>}
        <div className="pizza-total"><span>Total</span><strong>{BRL.format(finalPrice)}</strong></div>
        <button className="orange-button" type="submit" disabled={Boolean(validation)}><ShoppingBag size={18} /> Adicionar ao carrinho</button>
      </form>
    </div>
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

function Coupons({ coupons, createCoupon, updateCoupon, deleteCoupon }) {
  const [editing, setEditing] = React.useState(null);

  const removeCoupon = (coupon) => {
    if (confirm(`Excluir o cupom "${coupon.code}"?`)) {
      deleteCoupon(coupon.id);
    }
  };

  return (
    <>
      <PageHeader title="Cupons" subtitle="Cadastre descontos para o catalogo">
        <button className="orange-button" onClick={() => setEditing({ code: '', type: 'percent', value: 10, minOrder: 0, active: true })}><Plus size={18} /> Novo cupom</button>
      </PageHeader>
      <section className="coupon-list">
        {coupons.map((coupon) => (
          <article className="coupon-card" key={coupon.id}>
            <div>
              <h3>{coupon.code}</h3>
              <p>{coupon.type === 'percent' ? `${coupon.value}% de desconto` : `${BRL.format(coupon.value)} de desconto`} acima de {BRL.format(coupon.minOrder)}</p>
            </div>
            <span className={coupon.active ? 'green-pill' : 'pending-pill'}>{coupon.active ? 'Ativo' : 'Inativo'}</span>
            <div className="row-actions">
              <button aria-label="Editar" onClick={() => setEditing(coupon)}><Edit3 size={18} /></button>
              <button aria-label="Excluir" className="danger" onClick={() => removeCoupon(coupon)}><Trash2 size={18} /></button>
            </div>
          </article>
        ))}
        {!coupons.length && (
          <article className="placeholder-panel">
            <Tag size={24} />
            <h2>Nenhum cupom cadastrado</h2>
            <p>Crie cupons para incentivar pedidos no catalogo.</p>
          </article>
        )}
      </section>
      {editing && (
        <CouponModal
          coupon={editing}
          onClose={() => setEditing(null)}
          onSave={async (coupon) => {
            if (coupon.id) await updateCoupon(coupon);
            else await createCoupon(coupon);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function CouponModal({ coupon, onSave, onClose }) {
  const [draft, setDraft] = React.useState(coupon);
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="overlay">
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, code: draft.code.trim().toUpperCase(), value: Number(draft.value), minOrder: Number(draft.minOrder) }); }}>
        <div className="modal-head">
          <h2>{draft.id ? 'Editar cupom' : 'Novo cupom'}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Codigo<input value={draft.code} onChange={(event) => setField('code', event.target.value.toUpperCase())} placeholder="10OFF" required /></label>
        <div className="form-grid">
          <label>Tipo<select value={draft.type} onChange={(event) => setField('type', event.target.value)}><option value="percent">Porcentagem</option><option value="fixed">Valor fixo</option></select></label>
          <label>Valor<input type="number" step="0.01" value={draft.value} onChange={(event) => setField('value', event.target.value)} required /></label>
        </div>
        <label>Pedido minimo<input type="number" step="0.01" value={draft.minOrder} onChange={(event) => setField('minOrder', event.target.value)} /></label>
        <label className="check-line"><input type="checkbox" checked={draft.active} onChange={(event) => setField('active', event.target.checked)} /> Cupom ativo</label>
        <button className="orange-button" type="submit"><Check size={18} /> Salvar cupom</button>
      </form>
    </div>
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

function reserveAutoPrint(orderId) {
  const key = `pedija-auto-printed-${orderId}`;
  const now = Date.now();
  const previous = Number(localStorage.getItem(key) || 0);

  if (previous && now - previous < 1000 * 60 * 30) {
    return false;
  }

  localStorage.setItem(key, String(now));
  cleanupAutoPrintLocks(now);
  return true;
}

function cleanupAutoPrintLocks(now) {
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith('pedija-auto-printed-')) return;

    const printedAt = Number(localStorage.getItem(key) || 0);
    if (!printedAt || now - printedAt > 1000 * 60 * 60 * 24) {
      localStorage.removeItem(key);
    }
  });
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

function createEstablishmentDraft() {
  return {
    name: '',
    segment: 'supermercado',
    plan: 'Basico',
    status: 'Ativo',
    phone: '',
    catalogSlug: '',
    adminUser: 'admin',
    adminPassword: generateAccessPassword()
  };
}

function buildDefaultEstablishments(store) {
  return [{
    id: 'store-main',
    name: store?.name || 'Novo estabelecimento',
    segment: store?.segment || 'supermercado',
    plan: 'Basico',
    status: 'Ativo',
    phone: store?.phone || '',
    catalogSlug: store?.catalogSlug || 'catalogo',
    adminUser: 'admin',
    adminPassword: 'admin123'
  }];
}

function segmentLabel(segment) {
  return SEGMENTS.find(([value]) => value === segment)?.[1] || segment || 'Sem segmento';
}

function generateAccessPassword() {
  return Math.random().toString(36).slice(2, 10);
}

function getRouteSlug() {
  const querySlug = new URLSearchParams(window.location.search).get('slug');
  if (querySlug) return querySlug;

  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'catalogo') return parts[1] || '';
  return '';
}

function getAdminSlug() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'admin') return parts[1] || '';
  return '';
}

function getBannerStyle(store) {
  return store?.bannerUrl ? { '--banner-image': `url("${store.bannerUrl}")` } : undefined;
}

function getLoginBackgroundStyle(store) {
  return { '--login-image': `url("${segmentLoginImage(store?.segment)}")` };
}

function segmentLoginImage(segment) {
  const images = {
    supermercado: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    bebidas: 'https://images.unsplash.com/photo-1605270012917-bf157c5a9541?auto=format&fit=crop&w=1600&q=80',
    padaria: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    restaurante: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    pizzaria: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
    lanchonete: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80',
    farmacia: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80',
    hortifruti: 'https://images.unsplash.com/photo-1619566636858-adf3ef4640b2?auto=format&fit=crop&w=1600&q=80',
    master: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80'
  };

  return images[segment] || images.supermercado;
}

function resizeImageFile(file, { maxWidth, maxHeight, quality, format = 'image/jpeg', background = '' }) {
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
        if (background) {
          context.fillStyle = background;
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL(format, quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function buildCustomerStatusWhatsapp(order) {
  const trackingUrl = `${window.location.origin}/pedido/${order.id}${order.storeSlug ? `?slug=${encodeURIComponent(order.storeSlug)}` : ''}`;
  const message = [
    `Ola ${order.customer}, seu pedido #${order.id} esta com status: ${order.status}.`,
    `Total: ${BRL.format(orderTotal(order))}`,
    `Acompanhe aqui: ${trackingUrl}`
  ].join('\n');

  return `https://wa.me/${whatsappDigits(order.phone)}?text=${encodeURIComponent(message)}`;
}

function buildStoreOrderWhatsapp(store, order) {
  const trackingUrl = `${window.location.origin}/pedido/${order.id}${store.catalogSlug ? `?slug=${encodeURIComponent(store.catalogSlug)}` : ''}`;
  const items = order.items.map((item) => `${item.qty}x ${item.name} - ${BRL.format(item.qty * itemUnitPrice(item))}${formatItemOptions(item) ? `\n  ${formatItemOptions(item)}` : ''}${item.notes ? `\n  Obs: ${item.notes}` : ''}`).join('\n');
  const message = [
    `Novo pedido #${order.id}`,
    `Cliente: ${order.customer}`,
    `Telefone: ${order.phone}`,
    `Tipo: ${order.deliveryMethod}`,
    order.deliveryNeighborhood ? `Bairro: ${order.deliveryNeighborhood}` : '',
    `Endereco: ${order.address}`,
    order.location?.mapsUrl ? `Mapa: ${order.location.mapsUrl}` : '',
    Number(order.deliveryFee || 0) > 0 ? `Taxa de entrega: ${BRL.format(order.deliveryFee)}` : '',
    `Pagamento: ${order.payment}`,
    order.substitution ? `Se faltar produto: ${order.substitution}` : '',
    order.notes ? `Obs: ${order.notes}` : '',
    '',
    items,
    '',
    `Total: ${BRL.format(order.total)}`,
    `Status: ${trackingUrl}`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${whatsappDigits(store.phone)}?text=${encodeURIComponent(message)}`;
}

function buildPaymentProofWhatsapp(store, order) {
  const message = [
    `Ola, fiz o pedido #${order.id} no catalogo ${store.name}.`,
    `Total: ${BRL.format(order.total || orderTotal(order))}`,
    'Segue o comprovante do PIX em anexo.'
  ].join('\n');

  return `https://wa.me/${whatsappDigits(store.phone)}?text=${encodeURIComponent(message)}`;
}

function buildCourierLocationWhatsapp(order) {
  const message = [
    `Entrega do pedido #${order.id}`,
    `Cliente: ${order.customer}`,
    `Telefone: ${order.phone}`,
    `Endereco: ${order.address}`,
    order.location?.mapsUrl ? `Abrir no GPS: ${order.location.mapsUrl}` : ''
  ].filter(Boolean).join('\n');

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

async function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) return '';

  const data = await response.json();
  const address = data.address || {};
  const street = [address.road || address.pedestrian || address.residential || address.neighbourhood, address.house_number].filter(Boolean).join(', ');
  const district = address.suburb || address.neighbourhood || address.city_district || '';
  const city = address.city || address.town || address.village || address.municipality || '';
  const state = address.state || '';
  const parts = [street, district, city, state].filter(Boolean);

  return parts.length ? parts.join(' - ') : (data.display_name || '');
}

async function copyPixKey(pixKey) {
  try {
    await navigator.clipboard.writeText(pixKey);
    alert('Chave PIX copiada.');
  } catch {
    alert(`Chave PIX: ${pixKey}`);
  }
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatBrazilPhone(value) {
  const digits = onlyDigits(value).replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function whatsappDigits(value) {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function orderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.qty * itemUnitPrice(item), 0);
  return Math.max(0, subtotal - Number(order.discount || 0) + Number(order.deliveryFee || 0));
}

function itemUnitPrice(item) {
  return Number(item.price || 0) + Number(item.optionsPrice ?? (Number(item.flavorPrice || 0) + Number(item.borderPrice || 0)));
}

function couponDiscount(coupon, subtotal) {
  if (!coupon || subtotal < Number(coupon.minOrder || 0)) return 0;
  if (coupon.type === 'fixed') return Math.min(subtotal, Number(coupon.value || 0));
  return Math.min(subtotal, subtotal * (Number(coupon.value || 0) / 100));
}

function groupProductsByCategory(products, categoryOrder = []) {
  const groups = new Map();

  products.forEach((product) => {
    const category = product.category || 'Sem categoria';
    const list = groups.get(category) || [];
    list.push(product);
    groups.set(category, list);
  });

  return sortedCategories(products, categoryOrder).map((category) => [category, sortProductsForCatalog(groups.get(category) || [])]);
}

function sortedCategories(products, categoryOrder = []) {
  const found = [...new Set(products.map((product) => product.category || 'Sem categoria'))];
  const ordered = Array.isArray(categoryOrder) ? categoryOrder.filter((category) => found.includes(category)) : [];
  const remaining = found.filter((category) => !ordered.includes(category)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return [...ordered, ...remaining];
}

function sortProductsForCatalog(products) {
  return [...products].sort((a, b) => {
    const orderDiff = normalizedSortOrder(a, 0) - normalizedSortOrder(b, 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR');
  });
}

function normalizedSortOrder(product, index) {
  return Number.isFinite(Number(product?.sortOrder)) ? Number(product.sortOrder) : (index + 1) * 10;
}

function nextSortOrder(products) {
  if (!products.length) return 10;
  return Math.max(...products.map((product, index) => normalizedSortOrder(product, index))) + 10;
}

function parseDeliveryZones(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, fee = '0'] = line.split('=');
      return { name: String(name || '').trim(), fee: Number(String(fee).replace(',', '.') || 0) };
    })
    .filter((zone) => zone.name);
}

function deliveryZonesToText(zones) {
  return Array.isArray(zones) ? zones.map((zone) => `${zone.name}=${Number(zone.fee || 0)}`).join('\n') : '';
}

function parseOptionLines(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function parsePricedOptions(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string'
      ? parsePricedOptionLine(item)
      : { name: String(item?.name || '').trim(), price: Number(item?.price || 0) }).filter((item) => item.name);
  }

  return String(value || '')
    .split(/\r?\n/)
    .map(parsePricedOptionLine)
    .filter((item) => item.name);
}

function parsePricedOptionLine(line) {
  const [name, price = '0'] = String(line || '').split('=');
  return { name: String(name || '').trim(), price: Number(String(price).replace(',', '.') || 0) };
}

function pricedOptionsToText(value) {
  return parsePricedOptions(value).map((item) => `${item.name}=${Number(item.price || 0)}`).join('\n');
}

function isConfigurableProduct(product) {
  return ['custom', 'pizza'].includes(product?.productType);
}

function normalizeProductForEditing(product, store) {
  const normalized = { ...product };
  if (normalized.productType === 'pizza') normalized.productType = 'custom';
  if (!Array.isArray(normalized.optionGroups) || !normalized.optionGroups.length) {
    normalized.optionGroups = optionGroupsForProduct(product, store);
  } else {
    normalized.optionGroups = normalizeOptionGroups(normalized.optionGroups);
  }
  return normalized;
}

function normalizeOptionGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map((group, index) => ({
    id: group.id || `group-${index}-${normalizeText(group.name || 'opcao')}`,
    name: String(group.name || '').trim(),
    min: Number(group.min || 0),
    max: Math.max(1, Number(group.max || 1)),
    pricing: group.pricing || 'sum',
    options: parsePricedOptions(group.options || group.optionsText || ''),
    optionsText: group.optionsText ?? pricedOptionsToText(group.options || [])
  })).filter((group) => group.name);
}

function prepareOptionGroupsForSave(groups) {
  return normalizeOptionGroups(groups)
    .map((group) => ({
      id: group.id || crypto.randomUUID(),
      name: group.name,
      min: Math.max(0, Number(group.min || 0)),
      max: Math.max(1, Number(group.max || 1)),
      pricing: group.pricing || 'sum',
      options: parsePricedOptions(group.optionsText ?? group.options)
    }))
    .filter((group) => group.name && group.options.length);
}

function presetOptionGroups(type) {
  const presets = {
    pizza: [
      { name: 'Sabores', min: 1, max: 2, pricing: 'highest', optionsText: 'Mussarela=0\nCalabresa=0\nFrango com catupiry=5' },
      { name: 'Borda', min: 0, max: 1, pricing: 'sum', optionsText: 'Sem borda=0\nCatupiry=6\nCheddar=7' }
    ],
    snack: [
      { name: 'Ponto/observacao', min: 0, max: 1, pricing: 'free', optionsText: 'Sem cebola=0\nSem tomate=0\nBem passado=0' },
      { name: 'Adicionais', min: 0, max: 5, pricing: 'sum', optionsText: 'Bacon=4\nCheddar=3\nOvo=2' }
    ],
    meal: [
      { name: 'Acompanhamentos', min: 1, max: 3, pricing: 'free', optionsText: 'Arroz=0\nFeijao=0\nSalada=0\nFarofa=0' },
      { name: 'Adicionais', min: 0, max: 5, pricing: 'sum', optionsText: 'Ovo=2\nCarne extra=8\nQueijo=3' }
    ]
  };

  return (presets[type] || []).map((group) => ({ ...group, id: crypto.randomUUID(), options: parsePricedOptions(group.optionsText) }));
}

function optionGroupsForProduct(product, store) {
  if (Array.isArray(product?.optionGroups) && product.optionGroups.length) return normalizeOptionGroups(product.optionGroups);
  if (product?.productType !== 'pizza') return [];

  const groups = [];
  const flavors = parsePricedOptions(store?.pizzaFlavors || []);
  const borders = parsePricedOptions(store?.pizzaBorders || []);
  if (flavors.length) {
    groups.push({
      id: 'legacy-flavors',
      name: 'Sabores',
      min: 1,
      max: Math.max(1, Number(product.maxFlavors || 1)),
      pricing: 'highest',
      options: flavors,
      optionsText: pricedOptionsToText(flavors)
    });
  }
  if (borders.length) {
    groups.push({
      id: 'legacy-borders',
      name: 'Borda',
      min: 0,
      max: 1,
      pricing: 'sum',
      options: borders,
      optionsText: pricedOptionsToText(borders)
    });
  }
  return normalizeOptionGroups(groups);
}

function initialSelectedOptions(groups) {
  return groups.reduce((selected, group) => {
    selected[group.id] = [];
    return selected;
  }, {});
}

function buildSelectedOptionGroups(groups, selected) {
  return groups.map((group) => {
    const names = selected[group.id] || [];
    const options = group.options.filter((option) => names.includes(option.name));
    return {
      name: group.name,
      pricing: group.pricing,
      options,
      price: calculateGroupPrice(group, options)
    };
  }).filter((group) => group.options.length);
}

function calculateOptionsPrice(groups, selected) {
  return buildSelectedOptionGroups(groups, selected).reduce((sum, group) => sum + Number(group.price || 0), 0);
}

function calculateGroupPrice(group, options) {
  if (group.pricing === 'free') return 0;
  if (group.pricing === 'highest') return options.reduce((max, option) => Math.max(max, Number(option.price || 0)), 0);
  return options.reduce((sum, option) => sum + Number(option.price || 0), 0);
}

function validateSelectedOptions(groups, selected) {
  for (const group of groups) {
    const count = (selected[group.id] || []).length;
    if (count < Number(group.min || 0)) return `Escolha pelo menos ${group.min} opcao em ${group.name}.`;
    if (count > Number(group.max || 1)) return `Escolha no maximo ${group.max} opcoes em ${group.name}.`;
  }
  return '';
}

function optionGroupRuleText(group) {
  const min = Number(group.min || 0);
  const max = Number(group.max || 1);
  if (min && max && min === max) return `(escolha ${max})`;
  if (min && max) return `(escolha de ${min} ate ${max})`;
  return `(ate ${max})`;
}

function isFlavorGroup(name) {
  const text = normalizeText(name);
  return text.includes('sabor') || text.includes('sabores');
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function cartKey(productId, options = {}) {
  const groupsKey = Array.isArray(options.optionGroups)
    ? options.optionGroups.map((group) => `${group.name}:${group.options.map((item) => item.name).join('+')}`).join('|')
    : [(options.flavors || []).join('+'), options.border || ''].join('|');
  return [productId, groupsKey].map((part) => encodeURIComponent(part)).join('::');
}

function cartEntryProductId(key, entry) {
  if (entry && typeof entry === 'object') return entry.productId;
  return decodeURIComponent(String(key).split('::')[0] || key);
}

function cartEntryQty(entry) {
  return typeof entry === 'number' ? entry : Number(entry?.qty || 0);
}

function productCartQty(cart, productId) {
  return Object.entries(cart).reduce((sum, [key, entry]) => (
    cartEntryProductId(key, entry) === productId ? sum + cartEntryQty(entry) : sum
  ), 0);
}

function formatItemOptions(item) {
  if (Array.isArray(item.optionGroups) && item.optionGroups.length) {
    return [
      item.pizzaSize,
      item.slices ? `${item.slices} fatias` : '',
      ...item.optionGroups.map((group) => {
        const names = group.options.map((option) => option.name).join(', ');
        const price = Number(group.price || 0);
        return `${group.name}: ${names}${price > 0 ? ` (+ ${BRL.format(price)})` : ''}`;
      })
    ].filter(Boolean).join(' | ');
  }

  return [
    item.pizzaSize,
    item.slices ? `${item.slices} fatias` : '',
    item.flavors?.length ? `Sabores: ${item.flavors.join(', ')}` : item.flavor ? `Sabor: ${item.flavor}` : '',
    item.flavorPrice > 0 ? `Adic. sabor: ${BRL.format(item.flavorPrice)}` : '',
    item.border ? `Borda: ${item.border}` : '',
    item.borderPrice > 0 ? `Adic. borda: ${BRL.format(item.borderPrice)}` : ''
  ].filter(Boolean).join(' | ');
}

function storeOpenInfo(store) {
  if (store.status === 'Fechado') {
    return { open: false, message: 'Este estabelecimento esta fechado agora.' };
  }

  const match = String(store.hours || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return { open: true, message: '' };

  const [, sh, sm, eh, em] = match.map(Number);
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const open = end >= start ? current >= start && current <= end : current >= start || current <= end;

  return open
    ? { open: true, message: '' }
    : { open: false, message: `Fora do horario de atendimento (${store.hours}).` };
}

createRoot(document.getElementById('root')).render(<App />);
