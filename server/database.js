import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || join(__dirname, 'data');
const dbPath = join(dataDir, 'database.json');

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
  deliveryAreas: ''
};

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

const initialData = {
  store: initialStore,
  establishments: [{
    id: 'store-main',
    name: initialStore.name,
    segment: initialStore.segment,
    plan: 'Basico',
    status: 'Ativo',
    phone: initialStore.phone,
    catalogSlug: initialStore.catalogSlug,
    adminUser: 'admin',
    adminPassword: 'admin123',
    store: initialStore,
    products: initialProducts,
    orders: initialOrders,
    coupons: []
  }],
  products: initialProducts,
  orders: initialOrders,
  coupons: []
};

export async function readDb() {
  await ensureDb();
  return JSON.parse(await readFile(dbPath, 'utf-8'));
}

export async function writeDb(data) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(data, null, 2));
  return data;
}

export async function updateDb(updater) {
  const db = await readDb();
  const nextDb = await updater(db);
  return writeDb(nextDb);
}

async function ensureDb() {
  try {
    await readFile(dbPath, 'utf-8');
  } catch {
    await writeDb(initialData);
  }
}
