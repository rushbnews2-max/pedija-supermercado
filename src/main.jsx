import React from 'react';
import { createRoot } from 'react-dom/client';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  BarChart3,
  Box,
  Check,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Banknote,
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
  QrCode,
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
const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX', description: 'Pague pela chave da loja', icon: QrCode },
  { value: 'Dinheiro', label: 'Dinheiro', description: 'Combine troco na entrega', icon: Banknote },
  { value: 'Cartao', label: 'Cartao', description: 'Pague na entrega/retirada', icon: CreditCard }
];
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

const demoStore = {
  name: 'Loja Demonstracao PediJah',
  type: 'Catalogo exemplo',
  phone: '66996191408',
  hours: '08:00 - 22:00',
  status: 'Aberto',
  address: 'Exemplo comercial',
  catalogSlug: 'catalogo-exemplo',
  segment: 'supermercado',
  bannerText: 'PediJah Demo',
  bannerUrl: '',
  logoUrl: '',
  pixKey: 'pix-demo@pedijah.com.br',
  pixName: 'PediJah Demonstracao',
  deliveryFee: 5,
  minOrder: 20,
  deliveryAreas: 'Centro, Jardim das Flores, Bela Vista',
  deliveryZones: [
    { name: 'Centro', fee: 5 },
    { name: 'Jardim das Flores', fee: 7 },
    { name: 'Bela Vista', fee: 9 }
  ],
  categoryOrder: ['Destaques', 'Pizzas', 'Bebidas', 'Padaria', 'Mercado'],
  pizzaFlavors: [
    { name: 'Mussarela', ingredients: 'molho de tomate, mussarela e oregano', price: 0 },
    { name: 'Calabresa', ingredients: 'calabresa fatiada, cebola, mussarela e oregano', price: 2 },
    { name: 'Frango com catupiry', ingredients: 'frango desfiado, catupiry, milho e mussarela', price: 5 }
  ],
  pizzaBorders: [
    { name: 'Sem borda', price: 0 },
    { name: 'Catupiry', price: 6 },
    { name: 'Cheddar', price: 7 }
  ]
};

const demoProducts = [
  {
    id: 'demo-pizza-g',
    code: 'D001',
    name: 'Pizza Grande',
    category: 'Pizzas',
    price: 54.9,
    active: true,
    featured: true,
    promo: true,
    stock: 99,
    sortOrder: 1,
    image: '',
    productType: 'pizza',
    pizzaSize: 'Grande',
    slices: 8,
    maxFlavors: 2
  },
  {
    id: 'demo-pizza-m',
    code: 'D002',
    name: 'Pizza Media',
    category: 'Pizzas',
    price: 44.9,
    active: true,
    featured: false,
    promo: false,
    stock: 99,
    sortOrder: 2,
    image: '',
    productType: 'pizza',
    pizzaSize: 'Media',
    slices: 6,
    maxFlavors: 2
  },
  {
    id: 'demo-suco',
    code: 'D003',
    name: 'Suco natural 500ml',
    category: 'Bebidas',
    price: 8.9,
    active: true,
    featured: true,
    promo: false,
    stock: 40,
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'demo-pao',
    code: 'D004',
    name: 'Pao frances 10 unidades',
    category: 'Padaria',
    price: 9.5,
    active: true,
    featured: true,
    promo: true,
    stock: 70,
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'demo-cesta',
    code: 'D005',
    name: 'Cesta cafe da manha',
    category: 'Destaques',
    price: 69.9,
    active: true,
    featured: true,
    promo: true,
    stock: 15,
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'demo-arroz',
    code: 'D006',
    name: 'Arroz tipo 1 5kg',
    category: 'Mercado',
    price: 26.9,
    active: true,
    featured: false,
    promo: false,
    stock: 35,
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
  }
];

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
      <span>{(store?.name || 'PediJah').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
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
        <strong><span>Pedi</span>Jah</strong>
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
          <strong><span>Pedi</span>Jah</strong>
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

function MarketingSite() {
  const features = [
    ['Pedidos online', 'Catalogo com carrinho, checkout por etapas e pedidos chegando direto no painel.', ShoppingBag],
    ['Multi segmentos', 'Mercado, pizzaria, lanchonete, padaria, restaurante, farmacia e distribuidora.', Store],
    ['Impressao termica', 'Pedidos podem sair direto na impressora do PDV com uma via limpa e organizada.', Printer],
    ['WhatsApp integrado', 'Links de catalogo, comprovante do PIX manual, status e contato rapido com o cliente.', MessageCircle]
  ];
  const segmentImages = {
    mercado: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&q=80',
    pizzaria: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=240&q=80',
    padaria: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&q=80',
    lanchonete: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=240&q=80',
    distribuidora: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=240&q=80',
    restaurante: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=240&q=80',
    farmacia: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=240&q=80'
  };
  const brandSegments = [
    ['Mercado', segmentImages.mercado],
    ['Pizzaria', segmentImages.pizzaria],
    ['Padaria', segmentImages.padaria],
    ['Lanchonete', segmentImages.lanchonete],
    ['Distribuidora', segmentImages.distribuidora],
    ['Restaurante', segmentImages.restaurante]
  ];
  const segments = [
    ['Supermercados', segmentImages.mercado],
    ['Pizzarias', segmentImages.pizzaria],
    ['Lanchonetes', segmentImages.lanchonete],
    ['Padarias', segmentImages.padaria],
    ['Restaurantes', segmentImages.restaurante],
    ['Farmacias', segmentImages.farmacia],
    ['Distribuidoras', segmentImages.distribuidora]
  ];
  const steps = [
    ['01', 'Crie o cliente', 'Cadastre o estabelecimento, segmento, usuario, senha e link de acesso.'],
    ['02', 'Monte o catalogo', 'Organize produtos por categoria, sabores, bordas, cupons, PIX e entrega.'],
    ['03', 'Receba pedidos', 'O painel avisa, imprime no PDV e ajuda a acompanhar cada status.']
  ];

  return (
    <main className="marketing-site">
      <nav className="marketing-nav">
        <a className="marketing-brand" href="/">
          <strong><span>Pedi</span>Jah</strong>
          <small>Sistema de pedidos</small>
        </a>
        <div>
          <a href="#recursos">Recursos</a>
          <a href="#segmentos">Segmentos</a>
          <a href="#como-funciona">Como funciona</a>
          <a className="nav-login" href="/admin"><Shield size={17} /> Painel administrativo</a>
        </div>
      </nav>

      <section className="marketing-hero">
        <div className="hero-copy">
          <span className="hero-kicker">Delivery proprio para comercios locais</span>
          <h1>PediJah</h1>
          <p>Venda por catalogo online, receba pedidos no painel, imprima automaticamente no PDV e administre varios clientes em uma plataforma pronta para crescer.</p>
          <div className="hero-actions">
            <a className="orange-button" href="/admin"><Shield size={18} /> Entrar no painel</a>
            <a className="ghost-cta" href="/catalogo-exemplo"><Eye size={18} /> Ver catalogo exemplo</a>
          </div>
          <div className="hero-stats" aria-label="Destaques do sistema">
            <span><strong>24h</strong> catalogo online</span>
            <span><strong>PIX</strong> manual com comprovante</span>
            <span><strong>PDV</strong> impressao termica</span>
          </div>
        </div>

        <div className="hero-media">
          <img src="/pedijah-commerce-hero.png" alt="Comerciantes preparando pedidos com produtos de mercado, pizzaria e padaria" />
          <div className="product-visual" aria-label="Previa visual do painel PediJah">
            <div className="visual-glow"></div>
            <div className="visual-topbar">
              <span></span><span></span><span></span>
              <b>Painel PediJah</b>
            </div>
            <div className="visual-toolbar">
              <strong>Pedidos de hoje</strong>
              <em>Ao vivo</em>
            </div>
            <div className="visual-grid">
              <article className="visual-card visual-order">
                <small>Novo pedido</small>
                <strong>#128</strong>
                <p>Pizza grande, borda catupiry, refrigerante e pagamento via PIX.</p>
                <span>R$ 89,90</span>
                <button>Separar pedido</button>
              </article>
              <article className="visual-card">
                <small>Catalogo</small>
                <strong>Online</strong>
                <p>Produtos por categoria e carrinho flutuante.</p>
              </article>
              <article className="visual-card">
                <small>Impressao</small>
                <strong>1 via</strong>
                <p>Cupom do pedido direto na termica.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-strip" aria-label="Segmentos em destaque">
        {brandSegments.map(([segment, image]) => (
          <span key={segment}>
            <img src={image} alt="" loading="lazy" />
            <b>{segment}</b>
          </span>
        ))}
      </section>

      <section className="marketing-band" id="recursos">
        <div className="section-title">
          <h2>Recursos para vender melhor</h2>
          <p>O painel centraliza o que o comerciante precisa para receber, separar, entregar e acompanhar os pedidos.</p>
        </div>
        <div className="feature-grid">
          {features.map(([title, text, Icon]) => (
            <article className="feature-item" key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-band" id="como-funciona">
        <div className="section-title">
          <h2>Do cadastro ao pedido em poucos passos</h2>
          <p>O PediJah foi pensado para quem quer vender para varios tipos de comercio sem montar tudo do zero a cada cliente.</p>
        </div>
        <div className="workflow-grid">
          {steps.map(([number, title, text]) => (
            <article className="workflow-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="segments-band" id="segmentos">
        <div className="section-title">
          <h2>Pronto para varios segmentos</h2>
          <p>Cada cliente pode ter seu proprio link, painel, catalogo, produtos, cupons, horarios e configuracoes.</p>
        </div>
        <div className="segment-list">
          {segments.map(([segment, image]) => (
            <span key={segment}>
              <img src={image} alt="" loading="lazy" />
              {segment}
            </span>
          ))}
        </div>
      </section>

      <section className="marketing-cta">
        <div>
          <h2>Venda com seu proprio link</h2>
          <p>Use o dominio do PediJah para divulgar catalogos e gerenciar seus clientes em um painel master.</p>
        </div>
        <div className="cta-actions">
          <a className="orange-button" href="/admin"><Shield size={18} /> Acessar painel master</a>
          <a className="ghost-cta dark" href="https://wa.me/5566996191408?text=Ola,%20quero%20conhecer%20o%20PediJah" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Falar no WhatsApp</a>
        </div>
      </section>
    </main>
  );
}

function App() {
  const routeSlug = getRouteSlug();
  const adminSlug = getAdminSlug();
  const [page, setPage] = React.useState(() => {
    if (window.location.pathname === '/') return 'home';
    if (window.location.pathname.startsWith('/catalogo-exemplo')) return 'demo-catalog';
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
  const isLanding = page === 'home';
  const isDemoCatalog = page === 'demo-catalog';
  const isCatalog = page === 'catalogo';
  const isTracking = page === 'pedido';
  const isPrintPage = page === 'print';
  const isPublicPage = isLanding || isDemoCatalog || isCatalog || isTracking || isPrintPage;

  React.useEffect(() => {
    pageRef.current = page;
  }, [page]);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const source = isLanding
      ? Promise.resolve({ store: initialStore, products: [], orders: [], coupons: [] })
      : isDemoCatalog
      ? Promise.resolve({ store: demoStore, products: demoProducts, orders: [], coupons: [] })
      : isPublicPage
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
      }).catch(() => ({
        store: {
          name: 'Catalogo indisponivel',
          type: 'Estabelecimento',
          phone: '',
          hours: '',
          status: 'Fechado',
          address: '',
          catalogSlug: routeSlug || 'catalogo',
          segment: 'estabelecimento',
          bannerText: 'Catalogo indisponivel',
          bannerUrl: '',
          logoUrl: ''
        },
        products: [],
        coupons: [],
        orders: []
      }))
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
  }, [authToken, adminSlug, isCatalog, isDemoCatalog, isLanding, isPrintPage, isPublicPage, isTracking, routeSlug]);

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

  if (isLanding) {
    return <MarketingSite />;
  }

  if (isDemoCatalog) {
    return (
      <Catalog
        store={demoStore}
        products={demoProducts}
        coupons={[]}
        onOrder={async () => 'DEMO'}
        storeSlug="catalogo-exemplo"
        demoMode
      />
    );
  }

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
            <strong><span>Pedi</span>Jah</strong>
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
  const printedRef = React.useRef(false);

  React.useEffect(() => {
    if (printedRef.current) return undefined;
    printedRef.current = true;
    const cancel = printThermalOrder(store, order, onDone);
    return cancel;
  }, [onDone, order, store]);

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
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `PediJah-Impressao-${store.catalogSlug || 'loja'}.bat`;
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
      const image = await resizeImageFile(file, { maxWidth: 512, maxHeight: 512, quality: 0.9, format: 'image/png', maxBytes: 450000 });
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
      const image = await resizeImageFile(file, { maxWidth: 1400, maxHeight: 520, quality: 0.74, background: '#ffffff', maxBytes: 900000 });
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
  const [importing, setImporting] = React.useState(null);
  const categories = sortedCategories(products, store.categoryOrder);
  const productsByCategory = categories.map((category) => [
    category,
    sortProductsForCatalog(products.filter((product) => (product.category || 'Sem categoria') === category))
  ]);
  const productTabs = ['Produtos', 'Categorias'];
  const canImportFlavors = supportsFlavorImport(store);
  const savePizzaOptions = async (field, value) => {
    await setStore({ ...store, [field]: parsePricedOptions(value) });
  };

  const saveProduct = (product) => {
    const categoryProducts = products.filter((item) => (item.category || 'Sem categoria') === (product.category || 'Sem categoria'));
    if (product.id) updateProduct(product);
    else createProduct({ ...product, active: true, featured: Boolean(product.featured), sortOrder: nextSortOrder(categoryProducts) });
    setEditing(null);
  };

  const duplicateProduct = (product) => {
    const categoryProducts = products.filter((item) => (item.category || 'Sem categoria') === (product.category || 'Sem categoria'));
    setEditing({
      ...product,
      id: '',
      code: nextProductCode(products),
      name: `${product.name} (copia)`,
      sortOrder: nextSortOrder(categoryProducts),
      optionGroups: cloneOptionGroups(product.optionGroups)
    });
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
            <button className="ghost-button new-product" onClick={() => setImporting('erp')}>
              <PackagePlus size={18} /> Importar PDF ERP
            </button>
            {canImportFlavors && (
              <button className="ghost-button new-product" onClick={() => setImporting('flavors')}>
                <Tag size={18} /> Importar sabores
              </button>
            )}
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
                    onDuplicate={() => duplicateProduct(product)}
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
      {editing && <ProductModal store={store} product={editing} categories={categories} onSave={saveProduct} onClose={() => setEditing(null)} />}
      {importing && <PdfImportModal mode={importing} products={products} updateProduct={updateProduct} importProducts={importProducts} onClose={() => setImporting(null)} />}
    </>
  );
}

function ProductRow({ product, isFirst, isLast, onEdit, onToggle, onMoveUp, onMoveDown, onDuplicate, onDelete }) {
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
        <button aria-label="Duplicar" onClick={onDuplicate}><Copy size={18} /></button>
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

function CatalogProductCard({ product, qty, onAdd, onRemove, featured = false }) {
  return (
    <article className={`catalog-item ${featured ? 'featured-card' : ''}`}>
      <div className="catalog-thumb-wrap">
        <ProductThumb product={product} />
        {(product.promo || product.featured) && <span className="catalog-badge">{product.promo ? 'Oferta' : 'Destaque'}</span>}
      </div>
      <div className="catalog-item-info">
        <span>{product.category || 'Produto'}</span>
        <h3>{product.name}</h3>
      </div>
      <div className="catalog-card-footer">
        <strong>{BRL.format(product.price)}</strong>
        <div className="stepper">
          <button type="button" onClick={onRemove} aria-label={`Remover ${product.name}`}>-</button>
          <b>{qty}</b>
          <button className="add-step" type="button" onClick={onAdd} aria-label={`Adicionar ${product.name}`}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({ store, product, categories = [], onSave, onClose }) {
  const [draft, setDraft] = React.useState(() => normalizeProductForEditing(product, store));
  const [status, setStatus] = React.useState('');
  const availableCategories = React.useMemo(() => {
    const names = [draft.category, ...categories, 'Sem categoria']
      .map((category) => String(category || '').trim())
      .filter(Boolean);
    return [...new Set(names)];
  }, [categories, draft.category]);
  const [categoryMode, setCategoryMode] = React.useState(() => (
    categories.includes(product.category) || product.category === 'Sem categoria' ? 'existing' : 'new'
  ));
  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const selectCategory = (value) => {
    if (value === '__new__') {
      setCategoryMode('new');
      setField('category', '');
      return;
    }

    setCategoryMode('existing');
    setField('category', value);
  };
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
  const importProductImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Preparando imagem do produto...');
      const image = await resizeImageFile(file, { maxWidth: 720, maxHeight: 720, quality: 0.78, background: '#ffffff', maxBytes: 450000 });
      setField('image', image);
      setStatus('Imagem pronta para salvar.');
      event.target.value = '';
    } catch {
      setStatus('Nao consegui importar essa imagem. Tente outra imagem menor.');
    }
  };
  const submit = (event) => {
    event.preventDefault();
    const optionGroups = configurable ? prepareOptionGroupsForSave(draft.optionGroups) : [];
    onSave({
      ...draft,
      category: String(draft.category || 'Sem categoria').trim() || 'Sem categoria',
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
        <label>Categoria<select value={categoryMode === 'new' ? '__new__' : draft.category} onChange={(event) => selectCategory(event.target.value)} required>
          {availableCategories.map((category) => <option value={category} key={category}>{category}</option>)}
          <option value="__new__">Nova categoria...</option>
        </select></label>
        {categoryMode === 'new' && (
          <label>Nome da nova categoria<input value={draft.category} onChange={(event) => setField('category', event.target.value)} placeholder="Ex: Bebidas, Pizzas, Promocoes" required /></label>
        )}
        <label>Tipo de venda<select value={configurable ? 'custom' : 'normal'} onChange={(event) => setField('productType', event.target.value)}>
            <option value="normal">Produto simples</option>
            <option value="custom">Produto com escolhas</option>
          </select></label>
        <label>Imagem URL opcional<input value={draft.image || ''} onChange={(event) => setField('image', event.target.value)} placeholder="Pode deixar em branco" /></label>
        <label>Importar imagem do PC<input type="file" accept="image/*" onChange={importProductImage} /></label>
        <div className="product-image-preview">
          <ProductThumb product={draft} />
          <span>Previa da imagem do produto</span>
        </div>
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
                <label>Opcoes<textarea value={group.optionsText ?? pricedOptionsToText(group.options)} onChange={(event) => updateGroupOptions(index, event.target.value)} placeholder="Calabresa | Molho, mussarela, milho e cebola=R$ 0,00&#10;Frango com catupiry | Molho, frango, catupiry e milho=R$ 5,00&#10;Cheddar=R$ 7,00" /></label>
                <small className="option-format-help">Formato: nome | ingredientes = R$ acrescimo. Se digitar apenas 50, o sistema entende como R$ 50,00.</small>
              </article>
            ))}
            {!normalizeOptionGroups(draft.optionGroups).length && <p className="empty">Clique em Grupo ou escolha um modelo para cadastrar sabores, bordas e adicionais.</p>}
          </section>
        )}
        <label className="check-line"><input type="checkbox" checked={draft.promo} onChange={(event) => setField('promo', event.target.checked)} /> Produto em promocao</label>
        <label className="check-line"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setField('featured', event.target.checked)} /> Mostrar em destaque no catalogo</label>
        <label className="check-line"><input type="checkbox" checked={draft.active !== false} onChange={(event) => setField('active', event.target.checked)} /> Produto disponivel para venda</label>
        {status && <p className="form-status">{status}</p>}
        <button className="orange-button" type="submit"><Check size={18} /> Salvar</button>
      </form>
    </div>
  );
}

function PdfImportModal({ mode = 'erp', products = [], updateProduct, importProducts, onClose }) {
  const isFlavorImport = mode === 'flavors';
  const [status, setStatus] = React.useState(importInitialStatus(mode));
  const [items, setItems] = React.useState([]);
  const [category, setCategory] = React.useState('Sem categoria');
  const pizzaTargets = React.useMemo(() => products.filter((product) => isConfigurableProduct(product) || isPizzaText(product.name) || isPizzaText(product.category)), [products]);
  const [selectedTargets, setSelectedTargets] = React.useState([]);
  const validItems = React.useMemo(() => sanitizeImportedItems(items, category), [items, category]);
  const validFlavors = React.useMemo(() => sanitizeImportedFlavors(items), [items]);

  React.useEffect(() => {
    if (!isFlavorImport) return;
    setSelectedTargets(pizzaTargets.map((product) => product.id));
  }, [isFlavorImport, pizzaTargets]);

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
        const pageLines = isFlavorImport ? groupPdfTextByTableLine(content.items) : groupPdfTextByLine(content.items);
        lines.push(...pageLines);
      }

      if (!lines.length) {
        setStatus('Esse PDF parece ser imagem. Tentando leitura OCR...');
        lines.push(...await readPdfWithOcr(pdf, setStatus));
      }

      const parsed = isFlavorImport
        ? parsePizzaFlavorOptionsFromPdfLines(lines)
        : parseProductsFromPdfLines(lines);
      setItems(parsed.map((item) => ({ ...item, priceText: formatImportPrice(item.price) })));
      setStatus(parsed.length ? `${parsed.length} itens encontrados. Confira antes de importar.` : emptyImportMessage(mode));
    } catch {
      setStatus('Nao consegui ler esse PDF. Se for imagem, tente novamente com internet ativa para baixar o OCR.');
    }
  };

  const updateImportItem = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const removeImportItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleTarget = (id) => {
    setSelectedTargets((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const importItems = async () => {
    if (isFlavorImport) {
      if (!validFlavors.length || !selectedTargets.length) return;
      await Promise.all(products
        .filter((product) => selectedTargets.includes(product.id))
        .map((product) => updateProduct(applyFlavorsToProduct(product, validFlavors))));
      onClose();
      return;
    }

    if (!validItems.length) return;
    await importProducts({ products: validItems, category });
    onClose();
  };

  return (
    <div className="overlay">
      <section className="modal import-modal">
        <div className="modal-head">
          <h2>{importTitle(mode)}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>{importFileLabel(mode)}<input type="file" accept="application/pdf,.pdf" onChange={readPdf} /></label>
        {!isFlavorImport && <label>Categoria dos produtos importados<input value={category} onChange={(event) => setCategory(event.target.value)} /></label>}
        {isFlavorImport && (
          <section className="flavor-targets">
            <strong>Aplicar sabores em</strong>
            {pizzaTargets.length ? pizzaTargets.map((product) => (
              <label className="check-line" key={product.id}>
                <input type="checkbox" checked={selectedTargets.includes(product.id)} onChange={() => toggleTarget(product.id)} />
                {product.name}
              </label>
            )) : <p className="empty">Cadastre primeiro os tamanhos da pizza, exemplo: Pizza Media, Pizza Grande.</p>}
          </section>
        )}
        <p className="import-status">{status}{items.length > 0 && ` ${isFlavorImport ? validFlavors.length : validItems.length} itens validos para importar.`}</p>
        {items.length > 0 && (
          <div className={`import-preview ${isFlavorImport ? 'flavor-import-preview' : ''}`}>
            <div className="import-preview-head">
              {!isFlavorImport && <span>Codigo</span>}
              <span>{isFlavorImport ? 'Sabor' : 'Produto'}</span>
              {isFlavorImport && <span>Ingredientes</span>}
              <span>Preco</span>
              <span></span>
            </div>
            {items.map((item, index) => (
              <div className="import-preview-row" key={`${item.code}-${item.name}-${index}`}>
                {!isFlavorImport && <input value={item.code || ''} onChange={(event) => updateImportItem(index, 'code', event.target.value)} />}
                <input value={item.name || ''} onChange={(event) => updateImportItem(index, 'name', event.target.value)} />
                {isFlavorImport && <input value={item.description || ''} onChange={(event) => updateImportItem(index, 'description', event.target.value)} />}
                <input value={item.priceText ?? formatImportPrice(item.price)} onChange={(event) => updateImportItem(index, 'priceText', event.target.value)} />
                <button className="icon-button danger" type="button" title="Remover produto da importacao" onClick={() => removeImportItem(index)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="orange-button" type="button" disabled={isFlavorImport ? !validFlavors.length || !selectedTargets.length : !validItems.length} onClick={importItems}><Check size={18} /> {isFlavorImport ? 'Aplicar sabores' : 'Importar produtos'}</button>
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
    printThermalOrder(store, order);
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
      {order.location?.mapsUrl && (
        <div className="ticket-qr-box">
          <strong>Localizacao no GPS</strong>
          <img src={qrCodeUrl(order.location.mapsUrl)} alt="QR Code da localizacao do pedido" />
          <small>Aponte a camera para abrir no mapa.</small>
        </div>
      )}
      {order.deliveryNeighborhood && <p>Bairro: {order.deliveryNeighborhood}</p>}
      {order.substitution && <p>Falta produto: {order.substitution}</p>}
      {order.notes && <p>Obs: {order.notes}</p>}
      <hr />
      <div className="ticket-line ticket-head">
        <span className="ticket-product-name"><b>COD</b><em>QTD</em><i>DESCRICAO</i></span>
        <strong>VALOR</strong>
      </div>
      {order.items.map((item) => (
        <div className="ticket-item" key={`${item.productId}-${item.name}`}>
          <div className="ticket-line">
            <span className="ticket-product-name"><b>{item.code || '-'}</b><em>{item.qty}x</em><i>{item.name}</i></span>
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

function printThermalOrder(store, order, onDone) {
  const frame = document.createElement('iframe');
  let finished = false;
  let cleanupTimer = 0;
  let printTimer = 0;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(cleanupTimer);
    window.clearTimeout(printTimer);
    frame.remove();
    onDone?.();
  };

  frame.title = `Impressao do pedido ${order.id}`;
  frame.className = 'print-frame';
  frame.srcdoc = thermalTicketDocument(store, order);
  document.body.appendChild(frame);

  frame.onload = async () => {
    const printWindow = frame.contentWindow;
    if (!printWindow) {
      finish();
      return;
    }

    const afterPrint = () => {
      printWindow.removeEventListener('afterprint', afterPrint);
      window.setTimeout(finish, 600);
    };

    printWindow.addEventListener('afterprint', afterPrint);
    await waitForPrintImages(printWindow.document);
    printTimer = window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      cleanupTimer = window.setTimeout(finish, 8000);
    }, 450);
  };

  cleanupTimer = window.setTimeout(finish, 12000);
  return finish;
}

function thermalTicketDocument(store, order) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pedido #${escapeHtml(order.id)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    html, body { width: 80mm; margin: 0; padding: 0; background: #fff; color: #000; }
    body { font-family: "Courier New", monospace; font-size: 12px; line-height: 1.28; }
    .ticket { width: 80mm; padding: 4mm; box-sizing: border-box; }
    h3 { text-align: center; margin: 0 0 4px; font-size: 14px; }
    p { margin: 3px 0; overflow-wrap: anywhere; }
    hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
    .line { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
    .line span { flex: 1; }
    .line strong { white-space: nowrap; }
    .product-name { display: grid; grid-template-columns: 13mm 7mm minmax(0, 1fr); gap: 2mm; }
    .product-name b, .product-name em, .product-name i { font-style: normal; min-width: 0; }
    .product-name b, .head { font-weight: 700; }
    .product-name em { font-weight: 700; text-align: right; white-space: nowrap; }
    .product-name i { font-weight: 400; }
    .head { border-bottom: 1px dashed #000; margin-bottom: 3px; padding-bottom: 3px; }
    .head .product-name i { font-weight: 700; }
    small { display: block; margin: 2px 0 4px; overflow-wrap: anywhere; }
    .qr-box { text-align: center; margin: 5px 0; }
    .qr-box strong { display: block; margin-bottom: 3px; }
    .qr-box img { width: 28mm; height: 28mm; image-rendering: pixelated; }
    .qr-box small { margin-top: 2px; }
    .total { font-size: 14px; font-weight: 700; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="ticket">${thermalTicketMarkup(store, order)}</div>
</body>
</html>`;
}

function thermalTicketMarkup(store, order) {
  const discount = Number(order.discount || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
  const items = (order.items || []).map((item) => `
    <div>
      <div class="line">
        <span class="product-name"><b>${escapeHtml(item.code || '-')}</b><em>${escapeHtml(item.qty)}x</em><i>${escapeHtml(item.name)}</i></span>
        <strong>${escapeHtml(BRL.format(item.qty * itemUnitPrice(item)))}</strong>
      </div>
      ${formatItemOptions(item) ? `<small>${escapeHtml(formatItemOptions(item))}</small>` : ''}
      ${item.notes ? `<small>Obs item: ${escapeHtml(item.notes)}</small>` : ''}
    </div>
  `).join('');

  return `
    <h3>${escapeHtml(store.name)}</h3>
    <p>${escapeHtml(store.phone)}</p>
    <p>${escapeHtml(store.address)}</p>
    <hr />
    <p>Pedido #${escapeHtml(order.id)} - ${escapeHtml(order.createdAt)}</p>
    <p>Cliente: ${escapeHtml(order.customer)}</p>
    <p>Telefone: ${escapeHtml(order.phone)}</p>
    <p>Tipo: ${escapeHtml(order.deliveryMethod || 'Entrega')}</p>
    <p>Endereco: ${escapeHtml(order.address)}</p>
    ${order.location?.mapsUrl ? `<div class="qr-box"><strong>Localizacao no GPS</strong><img src="${escapeHtml(qrCodeUrl(order.location.mapsUrl))}" alt="QR Code da localizacao" /><small>Aponte a camera para abrir no mapa.</small></div>` : ''}
    ${order.deliveryNeighborhood ? `<p>Bairro: ${escapeHtml(order.deliveryNeighborhood)}</p>` : ''}
    ${order.substitution ? `<p>Falta produto: ${escapeHtml(order.substitution)}</p>` : ''}
    ${order.notes ? `<p>Obs: ${escapeHtml(order.notes)}</p>` : ''}
    <hr />
    <div class="line head"><span class="product-name"><b>COD</b><em>QTD</em><i>DESCRICAO</i></span><strong>VALOR</strong></div>
    ${items}
    <hr />
    ${discount > 0 ? `<div class="line"><span>Desconto ${order.coupon ? `(${escapeHtml(order.coupon)})` : ''}</span><strong>-${escapeHtml(BRL.format(discount))}</strong></div>` : ''}
    ${deliveryFee > 0 ? `<div class="line"><span>Entrega</span><strong>${escapeHtml(BRL.format(deliveryFee))}</strong></div>` : ''}
    <div class="line total"><span>Total</span><strong>${escapeHtml(BRL.format(orderTotal(order)))}</strong></div>
    <p>Pagamento: ${escapeHtml(order.payment)}</p>
    ${order.paymentStatus ? `<p>Pagamento: ${escapeHtml(order.paymentStatus)}</p>` : ''}
    <p>Status: ${escapeHtml(order.status)}</p>
  `;
}

function qrCodeUrl(value) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(value)}`;
}

function waitForPrintImages(documentRef) {
  const images = [...(documentRef?.images || [])];
  if (!images.length) return Promise.resolve();

  const loaded = Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));

  return Promise.race([
    loaded,
    new Promise((resolve) => window.setTimeout(resolve, 2500))
  ]);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
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

function Catalog({ store, products, coupons, onOrder, storeSlug, demoMode = false }) {
  const historyStorageKey = `pedija-order-history:${storeSlug || store.catalogSlug || store.name || 'catalogo'}`;
  const [query, setQuery] = React.useState('');
  const [cart, setCart] = React.useState({});
  const [productNotes, setProductNotes] = React.useState({});
  const [customer, setCustomer] = React.useState({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', deliveryNeighborhood: '', substitution: 'Me chamar no WhatsApp', notes: '' });
  const [sentOrder, setSentOrder] = React.useState(null);
  const [orderHistory, setOrderHistory] = React.useState(() => readOrderHistory(historyStorageKey));
  const [checkoutStep, setCheckoutStep] = React.useState('products');
  const [catalogTab, setCatalogTab] = React.useState('products');
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [couponMessage, setCouponMessage] = React.useState('');
  const [locationStatus, setLocationStatus] = React.useState('');
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [deliveryLocation, setDeliveryLocation] = React.useState(null);
  const [orderStatus, setOrderStatus] = React.useState('');
  const [sendingOrder, setSendingOrder] = React.useState(false);
  const [customizingProduct, setCustomizingProduct] = React.useState(null);
  const [cartMessage, setCartMessage] = React.useState('');
  const activeProducts = products.filter((product) => product.active && product.name.toLowerCase().includes(query.toLowerCase()));
  const items = Object.entries(cart).map(([key, entry]) => {
    const productId = cartEntryProductId(key, entry);
    const product = products.find((item) => item.id === productId);
    const qty = cartEntryQty(entry);
    return product ? {
      cartKey: key,
      productId,
      code: product.code || entry?.code || '',
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
  const cartQty = items.reduce((sum, item) => sum + item.qty, 0);
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
          code: product.code || '',
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
    setCartMessage(`${product.name} esta no carrinho.`);
  };
  React.useEffect(() => {
    if (!cartMessage) return undefined;
    const timeout = window.setTimeout(() => setCartMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [cartMessage]);
  React.useEffect(() => {
    setOrderHistory(readOrderHistory(historyStorageKey));
  }, [historyStorageKey]);
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
  const restoreOrderToCart = (order) => {
    const nextCart = {};
    const nextNotes = {};

    (order.items || []).forEach((item) => {
      const product = products.find((current) => current.id === item.productId && current.active !== false);
      if (!product) return;
      const options = {
        optionGroups: item.optionGroups || [],
        optionsPrice: Number(item.optionsPrice || 0),
        flavors: item.flavors || [],
        border: item.border || '',
        flavorPrice: Number(item.flavorPrice || 0),
        borderPrice: Number(item.borderPrice || 0)
      };
      const key = cartKey(product.id, options);
      nextCart[key] = {
        productId: product.id,
        qty: Number(item.qty || 1),
        ...options
      };
      if (item.notes) nextNotes[key] = item.notes;
    });

    if (!Object.keys(nextCart).length) {
      setCartMessage('Nao encontrei produtos ativos desse pedido no catalogo atual.');
      return;
    }

    setCart(nextCart);
    setProductNotes(nextNotes);
    setCatalogTab('products');
    setCheckoutStep('products');
    setCartMessage('Pedido anterior carregado no carrinho.');
  };
  const goToPaymentStep = () => {
    setOrderStatus('');
    if (!items.length) return setOrderStatus('Adicione produtos ao pedido.');
    if (belowMinOrder) return setOrderStatus(`Pedido minimo de ${BRL.format(minOrder)} para este estabelecimento.`);
    if (!customer.name.trim()) return setOrderStatus('Informe seu nome.');
    if (!onlyDigits(customer.phone)) return setOrderStatus('Informe seu telefone.');
    if (customer.deliveryMethod === 'Entrega' && !customer.address.trim()) return setOrderStatus('Informe o endereco para entrega.');
    if (customer.deliveryMethod === 'Entrega' && deliveryZones.length && !customer.deliveryNeighborhood) return setOrderStatus('Selecione o bairro de entrega.');
    setCheckoutStep('payment');
  };

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
    if (checkoutStep === 'address') {
      goToPaymentStep();
      return;
    }
    setOrderStatus('');
    if (!items.length) return setOrderStatus('Adicione produtos ao pedido.');
    if (!closedInfo.open) return setOrderStatus(closedInfo.message);
    if (belowMinOrder) return setOrderStatus(`Pedido minimo de ${BRL.format(minOrder)} para este estabelecimento.`);
    if (!customer.name.trim()) return setOrderStatus('Informe seu nome.');
    if (!onlyDigits(customer.phone)) return setOrderStatus('Informe seu telefone.');
    if (customer.deliveryMethod === 'Entrega' && !customer.address.trim()) return setOrderStatus('Informe o endereco para entrega.');
    if (customer.deliveryMethod === 'Entrega' && deliveryZones.length && !customer.deliveryNeighborhood) return setOrderStatus('Selecione o bairro de entrega.');

    setSendingOrder(true);
    try {
      const address = customer.deliveryMethod === 'Retirada'
        ? 'Retirada no balcao'
        : [customer.address, customer.deliveryNeighborhood].filter(Boolean).join(' - ');
      const formattedPhone = formatBrazilPhone(customer.phone);
      if (demoMode) {
        const savedOrder = {
          id: 'DEMO',
          customer: customer.name,
          phone: formattedPhone,
          address,
          payment: customer.payment,
          deliveryMethod: customer.deliveryMethod,
          deliveryNeighborhood: customer.deliveryNeighborhood,
          notes: customer.notes,
          substitution: customer.substitution,
          location: deliveryLocation,
          total,
          items,
          coupon: appliedCoupon ? appliedCoupon.code : '',
          discount,
          deliveryFee,
          paymentStatus: 'Demonstracao'
        };
        setSentOrder(savedOrder);
        setCart({});
        setProductNotes({});
        setCustomer({ name: '', phone: '', address: '', payment: 'PIX', deliveryMethod: 'Entrega', deliveryNeighborhood: '', substitution: 'Me chamar no WhatsApp', notes: '' });
        setDeliveryLocation(null);
        setLocationStatus('');
        setCheckoutStep('products');
        return;
      }
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
      const savedOrder = { id: orderId, customer: customer.name, phone: formattedPhone, address, payment: customer.payment, deliveryMethod: customer.deliveryMethod, deliveryNeighborhood: customer.deliveryNeighborhood, notes: customer.notes, substitution: customer.substitution, location: deliveryLocation, total, items, coupon: appliedCoupon ? appliedCoupon.code : '', discount, deliveryFee, paymentStatus: customer.payment === 'PIX' ? 'Aguardando comprovante' : 'A combinar' };
      setSentOrder(savedOrder);
      setOrderHistory(saveOrderHistory(historyStorageKey, savedOrder));
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
          {demoMode && <span className="demo-catalog-pill">Catalogo demonstrativo - nao gera pedido real</span>}
        </div>
        <LogoMark store={store} />
      </header>
      <section className="catalog-body">
        {sentOrder && (
          <div className="success-message">
            <Check size={20} />
            <div>
              <strong>{demoMode ? 'Simulacao concluida' : 'Pedido enviado'}</strong>
              <span>{demoMode ? `Este catalogo e apenas demonstrativo. Nenhum pedido real foi enviado. Total simulado ${BRL.format(sentOrder.total)}.` : `Pedido #${sentOrder.id} recebido. Total ${BRL.format(sentOrder.total)}. Aguarde a confirmacao do mercado.`}</span>
              <div className="success-actions">
                {demoMode ? (
                  <a href="/admin">Conhecer o painel administrativo</a>
                ) : (
                  <>
                    <a href={`/pedido/${sentOrder.id}?slug=${encodeURIComponent(storeSlug || store.catalogSlug || '')}`}>Acompanhar status</a>
                    <a href={buildStoreOrderWhatsapp(store, sentOrder)} target="_blank" rel="noreferrer">Enviar pelo WhatsApp</a>
                    {sentOrder.payment === 'PIX' && <a href={buildPaymentProofWhatsapp(store, sentOrder)} target="_blank" rel="noreferrer">Enviar comprovante</a>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {demoMode && (
          <div className="demo-catalog-notice">
            <Eye size={20} />
            <div>
              <strong>Catalogo de exemplo</strong>
              <span>Voce pode testar produtos, carrinho e checkout. O pedido nao cai em nenhum estabelecimento real.</span>
            </div>
          </div>
        )}
        {!closedInfo.open && (
          <div className="closed-message">
            <Clock size={20} />
            <strong>{closedInfo.message}</strong>
          </div>
        )}
        {cartMessage && (
          <div className="cart-toast">
            <Check size={18} />
            <span>{cartMessage}</span>
          </div>
        )}

        {checkoutStep === 'products' ? (
          <>
            {!customizingProduct && (
              <button className={`floating-cart-button ${cartMessage ? 'pulse' : ''}`} type="button" disabled={!items.length} onClick={() => setCheckoutStep('address')} aria-label="Abrir carrinho">
                <span>
                  <ShoppingBag size={22} />
                  {cartQty > 0 && <b>{cartQty}</b>}
                </span>
                <strong>{items.length ? BRL.format(total) : 'Carrinho'}</strong>
              </button>
            )}
            {orderHistory.length > 0 && (
              <div className="catalog-tabbar">
                <button className={catalogTab === 'products' ? 'active' : ''} type="button" onClick={() => setCatalogTab('products')}>Produtos</button>
                <button className={catalogTab === 'history' ? 'active' : ''} type="button" onClick={() => setCatalogTab('history')}>Meus pedidos</button>
              </div>
            )}

            {catalogTab === 'history' ? (
              <section className="order-history-panel">
                <div className="order-history-head">
                  <div>
                    <span>Meus pedidos</span>
                    <strong>Ultimos pedidos feitos aqui</strong>
                  </div>
                </div>
                <div className="order-history-list">
                  {orderHistory.map((order) => (
                    <article key={`${order.id}-${order.savedAt}`}>
                      <div>
                        <strong>Pedido #{order.id}</strong>
                        <span>{order.items?.slice(0, 2).map((item) => `${item.qty}x ${item.name}`).join(', ')}{order.items?.length > 2 ? ` +${order.items.length - 2}` : ''}</span>
                        <small>{formatHistoryDate(order.savedAt)} - {BRL.format(order.total || orderTotal(order))}</small>
                      </div>
                      <button className="ghost-button" type="button" onClick={() => restoreOrderToCart(order)}>Refazer</button>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
            <div className="catalog-products">
              <div className="search-box">
                <Search size={18} />
                <input placeholder="Buscar produto" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              {catalogCategories.length > 1 && (
                <nav className="catalog-category-nav" aria-label="Categorias do catalogo">
                  {featuredProducts.length > 0 && <a href="#cat-destaques"><Star size={14} /> Destaques</a>}
                  {catalogCategories.map(([category, categoryProducts]) => (
                    <a href={`#cat-${slugify(category)}`} key={category}>
                      {category}
                      <small>{categoryProducts.length}</small>
                    </a>
                  ))}
                </nav>
              )}
              <div className="catalog-sections">
                {featuredProducts.length > 0 && (
                  <section className="catalog-category featured-category" id="cat-destaques">
                    <div className="catalog-category-head">
                      <div>
                        <small>Selecionados para voce</small>
                        <h2>Destaques</h2>
                      </div>
                      <a href="#cat-destaques">Ver todos</a>
                    </div>
                    <div className="catalog-grid">
                      {featuredProducts.map((product) => (
                        <CatalogProductCard
                          featured
                          key={`featured-${product.id}`}
                          product={product}
                          qty={productCartQty(cart, product.id)}
                          onRemove={() => removeProduct(product)}
                          onAdd={() => addProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {catalogCategories.map(([category, categoryProducts]) => (
                  <section className="catalog-category" id={`cat-${slugify(category)}`} key={category}>
                    <div className="catalog-category-head">
                      <div>
                        <small>{categoryProducts.length} itens disponiveis</small>
                        <h2>{category}</h2>
                      </div>
                      <a href={`#cat-${slugify(category)}`}>Ver todos</a>
                    </div>
                    <div className="catalog-grid">
                      {categoryProducts.map((product) => (
                        <CatalogProductCard
                          key={product.id}
                          product={product}
                          qty={productCartQty(cart, product.id)}
                          onRemove={() => removeProduct(product)}
                          onAdd={() => addProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
                {!catalogCategories.length && <p className="empty">Nenhum produto encontrado.</p>}
              </div>
            </div>
            )}
          </>
        ) : (
          <form className="cart-panel checkout-panel" onSubmit={submitOrder}>
            <div className="checkout-head">
              <button className="ghost-button" type="button" onClick={() => setCheckoutStep('products')}>Voltar aos produtos</button>
              <h2>{checkoutStep === 'address' ? 'Endereco e contato' : 'Pagamento'}</h2>
            </div>
            <div className="checkout-steps">
              <span className={checkoutStep === 'address' ? 'active' : ''}>1. Endereco</span>
              <span className={checkoutStep === 'payment' ? 'active' : ''}>2. Pagamento</span>
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
            {checkoutStep === 'address' ? (
              <>
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
              </>
            ) : (
              <>
                <section className="payment-methods">
                  <strong>Escolha a forma de pagamento</strong>
                  <div>
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button className={customer.payment === method.value ? 'active' : ''} type="button" key={method.value} onClick={() => setCustomer({ ...customer, payment: method.value })}>
                          <Icon size={20} />
                          <span>{method.label}</span>
                          <small>{method.description}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <div className="coupon-box">
                  <label>Cupom<input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Ex: 10OFF" /></label>
                  <button className="ghost-button" type="button" onClick={applyCoupon}>Aplicar</button>
                  {couponMessage && <span>{couponMessage}</span>}
                  {discount > 0 && <strong>Desconto {BRL.format(discount)}</strong>}
                </div>
                {customer.payment === 'PIX' && (
                  <div className="pix-manual-box">
                    <span><QrCode size={18} /> Pagamento via PIX manual</span>
                    {store.pixKey ? (
                      <>
                        <small>Chave PIX</small>
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
              </>
            )}
            {orderStatus && <p className="checkout-warning">{orderStatus}</p>}
            {checkoutStep === 'address' ? (
              <button className="orange-button" type="button" onClick={goToPaymentStep}>Ir para pagamento</button>
            ) : (
              <div className="checkout-action-row">
                <button className="ghost-button" type="button" onClick={() => setCheckoutStep('address')}>Voltar ao endereco</button>
                <button className="orange-button" type="submit" disabled={sendingOrder}><ShoppingBag size={18} /> {sendingOrder ? 'Enviando...' : 'Enviar pedido'}</button>
              </div>
            )}
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
  const [expandedOptions, setExpandedOptions] = React.useState({});
  const [stepIndex, setStepIndex] = React.useState(0);
  const steppedMode = usesSteppedProductBuilder(store);
  const currentGroup = steppedMode ? groups[stepIndex] : null;
  const selectedOptionGroups = buildSelectedOptionGroups(groups, selected);
  const optionsPrice = calculateOptionsPrice(groups, selected);
  const finalPrice = Number(product.price || 0) + optionsPrice;
  const validation = validateSelectedOptions(groups, selected);
  const stepValidation = currentGroup ? validateSelectedOptions([currentGroup], selected) : '';
  const isLastStep = stepIndex >= groups.length - 1;

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
  const toggleOptionDetails = (group, option) => {
    if (!option.description) return;
    const key = `${group.id}:${option.name}`;
    setExpandedOptions((current) => ({ ...current, [key]: !current[key] }));
  };
  const handleOptionButtonClick = (event, group, option) => {
    event.preventDefault();
    if (steppedMode) {
      toggleOption(group, option);
      return;
    }
    toggleOptionDetails(group, option);
  };

  const submit = (event) => {
    event.preventDefault();
    if (steppedMode && !isLastStep) {
      nextStep();
      return;
    }
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
  const nextStep = () => {
    if (stepValidation) return;
    setStepIndex((current) => Math.min(groups.length - 1, current + 1));
  };
  const previousStep = () => setStepIndex((current) => Math.max(0, current - 1));
  const renderGroup = (group) => (
    <div className={`pizza-choice-list ${steppedMode ? 'stepped-choice-list' : ''}`} key={group.id}>
      {!steppedMode && <strong>{group.name} <small>{optionGroupRuleText(group)}</small></strong>}
      {group.options.map((item) => (
        <div className="option-choice" key={item.name}>
          <label className="check-line">
            <input
              type={Number(group.max || 1) <= 1 ? 'radio' : 'checkbox'}
              name={`group-${group.id}`}
              checked={(selected[group.id] || []).includes(item.name)}
              onChange={() => toggleOption(group, item)}
            />
            <button
              type="button"
              className="option-detail-button"
              onClick={(event) => handleOptionButtonClick(event, group, item)}
              disabled={!steppedMode && !item.description}
              aria-expanded={Boolean(expandedOptions[`${group.id}:${item.name}`])}
            >
              <span>
                <b>{item.name}</b>
                {item.description && (steppedMode ? <small>{item.description}</small> : <small>Toque para ver ingredientes</small>)}
                <em>{BRL.format(Number(item.price || 0))}</em>
              </span>
              {item.description && !steppedMode && (expandedOptions[`${group.id}:${item.name}`] ? <ChevronUp size={17} /> : <ChevronDown size={17} />)}
            </button>
          </label>
          {item.description && !steppedMode && expandedOptions[`${group.id}:${item.name}`] && (
            <p className="option-description">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="overlay">
      <form className={`modal pizza-modal ${steppedMode ? 'stepped-product-modal' : ''}`} onSubmit={submit}>
        <div className="modal-head">
          <h2>{steppedMode && currentGroup ? stepTitle(currentGroup) : product.name}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        {(product.pizzaSize || product.slices) && (
          <p className="pizza-summary">{[product.pizzaSize, product.slices ? `${product.slices} fatias` : ''].filter(Boolean).join(' - ')}</p>
        )}
        {steppedMode && groups.length > 1 && (
          <div className="step-progress">
            <span>Etapa {stepIndex + 1} de {groups.length}</span>
            <div><i style={{ width: `${((stepIndex + 1) / groups.length) * 100}%` }} /></div>
          </div>
        )}
        {steppedMode && currentGroup ? renderGroup(currentGroup) : groups.map(renderGroup)}
        {(steppedMode ? stepValidation : validation) && <p className="checkout-warning">{steppedMode ? stepValidation : validation}</p>}
        <div className="pizza-total"><span>Total</span><strong>{BRL.format(finalPrice)}</strong></div>
        {steppedMode ? (
          <div className="step-actions">
            <button className="ghost-button" type="button" onClick={previousStep} disabled={stepIndex === 0}>Voltar etapa</button>
            {isLastStep ? (
              <button className="orange-button" type="submit" disabled={Boolean(validation)}><ShoppingBag size={18} /> Adicionar ao carrinho</button>
            ) : (
              <button className="orange-button" type="submit" disabled={Boolean(stepValidation)}>Proxima etapa</button>
            )}
          </div>
        ) : (
          <button className="orange-button" type="submit" disabled={Boolean(validation)}><ShoppingBag size={18} /> Adicionar ao carrinho</button>
        )}
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

function groupPdfTextByTableLine(textItems) {
  const rows = new Map();

  textItems.forEach((item) => {
    const text = String(item.str || '').trim();
    if (!text) return;
    const y = Math.round(item.transform[5]);
    const row = rows.get(y) || [];
    row.push({ x: item.transform[4], text });
    rows.set(y, row);
  });

  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) => row
      .sort((a, b) => a.x - b.x)
      .map((part) => part.text)
      .join(' | ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
}

async function readPdfWithOcr(pdf, setStatus) {
  const { createWorker, PSM } = await import('tesseract.js');
  const lines = [];
  let currentPage = 1;
  const worker = await createWorker('por+eng', 1, {
    logger: (event) => {
      if (event.status !== 'recognizing text') return;
      const progress = Math.round((event.progress || 0) * 100);
      setStatus(`Lendo imagem do cardapio por OCR... pagina ${currentPage}/${pdf.numPages} (${progress}%)`);
    }
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT
    });

    for (currentPage = 1; currentPage <= pdf.numPages; currentPage += 1) {
      setStatus(`Preparando pagina ${currentPage}/${pdf.numPages} para OCR...`);
      const page = await pdf.getPage(currentPage);
      const image = await renderPdfPageToImage(page);
      const result = await worker.recognize(image);
      lines.push(...ocrTextToLines(result.data?.text || ''));
    }
  } finally {
    await worker.terminate();
  }

  return lines;
}

async function renderPdfPageToImage(page) {
  const viewport = page.getViewport({ scale: 2.4 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas indisponivel para OCR.');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
}

function ocrTextToLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
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

function parsePizzaFlavorOptionsFromPdfLines(lines) {
  const flavors = [];
  let pending = null;

  mergeMenuPriceLines(lines.map(cleanMenuLine).filter(Boolean)).forEach((line) => {
    const priceMatch = line.match(/(?:R\$\s*)?(\d{1,4}(?:\.\d{3})*,\d{2}|\d{1,5}\.\d{2})\s*$/);
    const heading = isLikelyMenuHeading(line);
    const optionHeading = optionGroupFromHeading(line);
    if (optionHeading && optionHeading !== 'Sabores') return;
    if (heading && !isFlavorNameLine(line)) return;

    if (priceMatch) {
      if (pending) {
        flavors.push(pending);
        pending = null;
      }
      const namePart = line.slice(0, priceMatch.index).trim();
      const { name, description } = splitMenuNameAndDescription(namePart);
      if (name) flavors.push({ name, description, price: parsePdfPrice(priceMatch[1]) });
      return;
    }

    if (isFlavorNameLine(line)) {
      if (pending) flavors.push(pending);
      pending = { name: titleCaseFlavor(line), description: '', price: 0 };
      return;
    }

    if (pending) {
      pending.description = [pending.description, line].filter(Boolean).join(' ');
    }
  });

  if (pending) flavors.push(pending);
  return uniqueFlavorOptions(flavors);
}

function uniqueFlavorOptions(options) {
  const seen = new Set();
  return options.filter((option) => {
    const name = String(option.name || '').trim();
    if (!name) return false;
    const key = normalizeText(name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isFlavorNameLine(line) {
  const clean = String(line || '').replace(/^[\d.\-\s]+/, '').trim();
  if (!clean || clean.length > 42) return false;
  if (/(sabores?|bordas?|adicionais|pizzas?|cardapio|tamanhos?)/i.test(clean)) return false;
  if (/\d{2,}/.test(clean)) return false;
  const letters = clean.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 4) return false;
  const upperLetters = letters.replace(/[^A-ZÀ-Ý]/g, '').length;
  return upperLetters / letters.length > 0.55 || /^[A-ZÀ-Ý][A-Za-zÀ-ÿ\s]+$/.test(clean);
}

function titleCaseFlavor(value) {
  return titleCaseMenu(String(value || '').replace(/^[\d.\-\s]+/, '').trim());
}

function sanitizeImportedFlavors(items) {
  return uniqueFlavorOptions((Array.isArray(items) ? items : [])
    .map((item) => ({
      name: String(item.name || '').trim(),
      description: String(item.description || '').trim(),
      price: parseCurrencyValue(item.priceText ?? item.price)
    }))
    .filter((item) => item.name));
}

function applyFlavorsToProduct(product, flavors) {
  const groups = normalizeOptionGroups(product.optionGroups);
  const flavorGroupIndex = groups.findIndex((group) => /sabores?/i.test(group.name));
  const flavorGroup = flavorGroupIndex >= 0 ? groups[flavorGroupIndex] : {
    id: crypto.randomUUID(),
    name: 'Sabores',
    min: 1,
    max: Math.max(1, Number(product.maxFlavors || 2)),
    pricing: 'highest',
    options: [],
    optionsText: ''
  };
  const nextFlavorGroup = {
    ...flavorGroup,
    min: Math.max(1, Number(flavorGroup.min || 1)),
    max: Math.max(1, Number(flavorGroup.max || product.maxFlavors || 2)),
    pricing: flavorGroup.pricing || 'highest',
    options: flavors,
    optionsText: pricedOptionsToText(flavors)
  };
  const nextGroups = flavorGroupIndex >= 0
    ? groups.map((group, index) => index === flavorGroupIndex ? nextFlavorGroup : group)
    : [nextFlavorGroup, ...groups];

  return {
    ...product,
    productType: 'custom',
    maxFlavors: nextFlavorGroup.max,
    optionGroups: prepareOptionGroupsForSave(nextGroups)
  };
}

function mergeMenuPriceLines(lines) {
  const merged = [];
  let pending = '';

  lines.forEach((line) => {
    const clean = cleanMenuLine(line);
    if (!clean) return;
    if (looksLikeStandalonePrice(clean) && pending) {
      merged.push(`${pending} ${clean}`);
      pending = '';
      return;
    }
    if (lineHasMenuPrice(clean)) {
      if (pending && !isLikelyMenuHeading(pending)) merged.push(pending);
      merged.push(clean);
      pending = '';
      return;
    }
    if (isLikelyMenuHeading(clean)) {
      if (pending) merged.push(pending);
      merged.push(clean);
      pending = '';
      return;
    }
    pending = pending ? `${pending} ${clean}` : clean;
  });

  if (pending) merged.push(pending);
  return merged;
}

function lineHasMenuPrice(line) {
  return /(?:R\$\s*)?\d{1,4}(?:\.\d{3})*,\d{2}\s*$|(?:R\$\s*)?\d{1,5}\.\d{2}\s*$/.test(String(line || ''));
}

function looksLikeStandalonePrice(line) {
  return /^(?:R\$\s*)?\d{1,4}(?:\.\d{3})*,\d{2}$|^(?:R\$\s*)?\d{1,5}\.\d{2}$/.test(String(line || '').trim());
}

function parsePdfPrice(value) {
  if (value.includes(',')) {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  }

  return Number(value);
}

function formatImportPrice(value) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sanitizeImportedItems(items, fallbackCategory) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      code: String(item.code || '').trim(),
      name: String(item.name || '').trim(),
      price: parseCurrencyValue(item.priceText ?? item.price),
      category: String(item.category || fallbackCategory || 'Sem categoria').trim(),
      image: item.image || '',
      promo: Boolean(item.promo),
      featured: Boolean(item.featured),
      active: item.active !== false,
      stock: Number(item.stock || 0),
      productType: isConfigurableProduct(item) ? 'custom' : 'normal',
      slices: Number(item.slices || 0),
      maxFlavors: Number(item.maxFlavors || 1),
      pizzaSize: item.pizzaSize || '',
      optionGroups: isConfigurableProduct(item) ? prepareOptionGroupsForSave(item.optionGroups || []) : []
    }))
    .filter((item) => item.name && (item.price > 0 || isConfigurableProduct(item)));
}

function importInitialStatus(mode) {
  if (mode === 'flavors') return 'Escolha o PDF com os sabores da pizza.';
  return 'Escolha o PDF exportado do ERP.';
}

function importTitle(mode) {
  if (mode === 'flavors') return 'Importar sabores de pizza';
  return 'Importar produtos do PDF';
}

function importFileLabel(mode) {
  if (mode === 'flavors') return 'Arquivo PDF dos sabores';
  return 'Arquivo PDF do ERP';
}

function emptyImportMessage(mode) {
  if (mode === 'flavors') return 'Nao encontrei sabores automaticamente. Tente um PDF com nomes dos sabores e ingredientes.';
  return 'Nao encontrei produtos automaticamente. Envie um PDF com codigo, nome e preco em linhas de produto.';
}

function cleanMenuLine(line) {
  return String(line || '')
    .replace(/\s+/g, ' ')
    .replace(/[•·]/g, '-')
    .trim();
}

function isLikelyMenuHeading(line) {
  const clean = line.replace(/[^A-Za-zÀ-ÿ0-9\s]/g, '').trim();
  if (!clean || clean.length > 42) return false;
  const lower = clean.toLowerCase();
  if (/(total|subtotal|pagina|telefone|whatsapp|endereco)/.test(lower)) return false;
  const letters = clean.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 4) return false;
  const upperLetters = letters.replace(/[^A-ZÀ-Ý]/g, '').length;
  return upperLetters / letters.length > 0.65 || /(pizza|pizzas|sabores|bordas|adicionais|lanches|bebidas|porcoes|marmitas|pasteis|salgados|doces)/i.test(clean);
}

function optionGroupFromHeading(value) {
  if (/sabores?/i.test(value)) return 'Sabores';
  if (/bordas?/i.test(value)) return 'Borda';
  if (/(adicionais|acrescimos|complementos)/i.test(value)) return 'Adicionais';
  return '';
}

function titleCaseMenu(value) {
  return String(value || '').toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function isPizzaText(value) {
  return /pizza|pizzas|broto|media|m[eé]dia|grande|familia|fam[ií]lia|gigante/i.test(String(value || ''));
}

function looksLikePizzaSize(value) {
  return /(broto|pequena|media|m[eé]dia|grande|familia|fam[ií]lia|gigante|pizza)/i.test(String(value || ''));
}

function guessPizzaSize(value) {
  const match = String(value || '').match(/(broto|pequena|media|m[eé]dia|grande|familia|fam[ií]lia|gigante)/i);
  return match ? titleCaseMenu(match[1].replace('média', 'media').replace('família', 'familia')) : '';
}

function guessPizzaSlices(value) {
  const size = guessPizzaSize(value).toLowerCase();
  if (size.includes('broto') || size.includes('pequena')) return 4;
  if (size.includes('media')) return 6;
  if (size.includes('familia') || size.includes('gigante')) return 12;
  if (size.includes('grande')) return 8;
  return 0;
}

function normalizePizzaProductName(value) {
  const size = guessPizzaSize(value);
  return size ? `Pizza ${size}` : String(value || '').trim();
}

function splitMenuNameAndDescription(value) {
  const clean = String(value || '').replace(/^[-\s]+/, '').trim();
  if (clean.includes('|')) {
    const [name, ...descriptionParts] = clean.split('|').map((part) => part.trim()).filter(Boolean);
    return {
      name: name || '',
      description: descriptionParts.join(' ').trim()
    };
  }
  const separator = clean.match(/\s[-:]\s/);
  if (!separator) return { name: clean, description: '' };
  const index = separator.index;
  return {
    name: clean.slice(0, index).trim(),
    description: clean.slice(index + separator[0].length).trim()
  };
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

function resizeImageFile(file, { maxWidth, maxHeight, quality, format = 'image/jpeg', background = '', maxBytes = 0 }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        let scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        let currentQuality = quality;
        let output = '';

        for (let attempt = 0; attempt < 8; attempt += 1) {
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          canvas.width = width;
          canvas.height = height;
          context.clearRect(0, 0, width, height);
          if (background) {
            context.fillStyle = background;
            context.fillRect(0, 0, width, height);
          }
          context.drawImage(image, 0, 0, width, height);
          output = canvas.toDataURL(format, currentQuality);
          if (!maxBytes || dataUrlBytes(output) <= maxBytes) break;
          scale *= 0.82;
          currentQuality = Math.max(0.52, currentQuality * 0.86);
        }
        resolve(output);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function dataUrlBytes(value) {
  const base64 = String(value || '').split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
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

function nextProductCode(products) {
  const numericCodes = products
    .map((product) => Number(String(product.code || '').trim()))
    .filter((code) => Number.isInteger(code) && code > 0);
  if (!numericCodes.length) return '1';
  return String(Math.max(...numericCodes) + 1);
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
      : { name: String(item?.name || '').trim(), description: String(item?.description || '').trim(), price: Number(item?.price || 0) }).filter((item) => item.name);
  }

  return String(value || '')
    .split(/\r?\n/)
    .map(parsePricedOptionLine)
    .filter((item) => item.name);
}

function parsePricedOptionLine(line) {
  const [nameAndDescription, price = '0'] = String(line || '').split('=');
  const [name, ...descriptionParts] = String(nameAndDescription || '').split('|');
  return {
    name: String(name || '').trim(),
    description: descriptionParts.join('|').trim(),
    price: parseCurrencyValue(price)
  };
}

function pricedOptionsToText(value) {
  return parsePricedOptions(value).map((item) => `${item.name}${item.description ? ` | ${item.description}` : ''}=${BRL.format(Number(item.price || 0))}`).join('\n');
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

function cloneOptionGroups(groups) {
  return normalizeOptionGroups(groups).map((group) => ({
    ...group,
    id: crypto.randomUUID(),
    options: group.options.map((option) => ({ ...option })),
    optionsText: pricedOptionsToText(group.options)
  }));
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
      { name: 'Sabores', min: 1, max: 2, pricing: 'highest', optionsText: 'Mussarela | Molho, mussarela e oregano=0\nCalabresa | Molho, mussarela, calabresa, milho e cebola=0\nFrango com catupiry | Molho, mussarela, frango, catupiry e milho=5' },
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

function usesSteppedProductBuilder(store) {
  return ['pizzaria', 'lanchonete', 'hamburgueria', 'restaurante'].includes(normalizeText(store?.segment || store?.type));
}

function supportsFlavorImport(store) {
  return ['pizzaria', 'lanchonete', 'hamburgueria', 'restaurante', 'padaria'].includes(normalizeText(store?.segment || store?.type));
}

function stepTitle(group) {
  const max = Number(group.max || 1);
  const name = String(group.name || 'opcao').toUpperCase();
  if (max === 1) return `ESCOLHA 1 ${singularizeOptionName(name)}`;
  return `ESCOLHA ${max} ${name}`;
}

function singularizeOptionName(value) {
  if (value.endsWith('S')) return value.slice(0, -1);
  return value;
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

function readOrderHistory(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveOrderHistory(key, order) {
  const historyItem = {
    id: order.id,
    savedAt: new Date().toISOString(),
    total: order.total || orderTotal(order),
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      code: item.code || '',
      name: item.name,
      price: item.price,
      qty: item.qty,
      notes: item.notes || '',
      optionGroups: item.optionGroups || [],
      optionsPrice: Number(item.optionsPrice || 0),
      flavors: item.flavors || [],
      border: item.border || '',
      borderPrice: Number(item.borderPrice || 0),
      flavorPrice: Number(item.flavorPrice || 0)
    }))
  };
  const next = [historyItem, ...readOrderHistory(key).filter((item) => item.id !== order.id)].slice(0, 8);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

function formatHistoryDate(value) {
  if (!value) return 'Pedido recente';
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return 'Pedido recente';
  }
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
        const names = group.options.map((option) => `${option.name}${option.description ? ` (${option.description})` : ''}`).join(', ');
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
