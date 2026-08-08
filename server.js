// Kishmish Somsa — buyurtmalar serveri
// Express server: buyurtmalar va menyuni data/ papkasidagi JSON fayllarda saqlaydi.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');

const ADMIN_PHONE = process.env.ADMIN_PHONE || '+998944404321';
const ORDER_PHONE = process.env.ORDER_PHONE || '+998996561007';

const DEFAULT_MENU = [
  { id:'qoy',       name:"Qo'y go'shtli somsa", tag:"An'anaviy",      desc:"",                   price:15000, image:'', available:true },
  { id:'mol',       name:"Mol go'shtli somsa",  tag:"Mazali",         desc:"",                   price:12000, image:'', available:true },
  { id:'qiyma',     name:"Qiymali somsa",       tag:"Aralash go'sht", desc:"",                   price:6000,  image:'', available:true },
  { id:'tovuq',     name:"Tovuqli somsa",       tag:"Yengil",         desc:"",                   price:6000,  image:'', available:true },
  { id:'kartoshka', name:"Kartoshkali somsa",   tag:"Vegetarian",     desc:"",                   price:6000,  image:'', available:true },
  { id:'ashqovoq',  name:"Ashqovoqli somsa",    tag:"Vegetarian",     desc:"",                   price:6000,  image:'', available:true },
  { id:'kishmish',  name:"Kishmishli somsa",    tag:"Shirin",         desc:"Mazali va sifatli",  price:6000,  image:'', available:true },
  { id:'kampot',    name:"Kampot",              tag:"Ichimlik",       desc:"",                   price:12000, image:'', available:true },
];

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
if (!fs.existsSync(MENU_FILE)) fs.writeFileSync(MENU_FILE, JSON.stringify(DEFAULT_MENU, null, 2), 'utf8');

let writeQueue = Promise.resolve();
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  } catch (e) {
    console.error(`${file} o'qishda xatolik:`, e);
    return [];
  }
}
function writeJson(file, data) {
  writeQueue = writeQueue.then(() =>
    fs.promises.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
  );
  return writeQueue;
}

function isAdmin(req) {
  return (req.headers['x-admin-phone'] || '').trim() === ADMIN_PHONE;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
  res.json({ orderPhone: ORDER_PHONE, adminPhoneMasked: ADMIN_PHONE.replace(/\d(?=\d{4})/g, '•') });
});

app.get('/api/menu', (req, res) => {
  res.json(readJson(MENU_FILE));
});

app.patch('/api/menu/:id', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Admin ruxsati kerak." });
  }
  const menu = readJson(MENU_FILE);
  const idx = menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Mahsulot topilmadi.' });

  const { available, image, price } = req.body || {};
  if (typeof available === 'boolean') menu[idx].available = available;
  if (typeof image === 'string') menu[idx].image = image.slice(0, 500);
  if (typeof price === 'number' && price >= 0) menu[idx].price = Math.round(price);

  await writeJson(MENU_FILE, menu);
  res.json(menu[idx]);
});

app.post('/api/admin/login', (req, res) => {
  const { phone } = req.body || {};
  if ((phone || '').trim() === ADMIN_PHONE) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: "Raqam noto'g'ri." });
});

app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE).sort((a, b) => b.createdAt - a.createdAt);
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const { name, phone, items, type, addr, note } = req.body || {};

  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Ism, telefon va kamida bitta mahsulot kerak.' });
  }
  if (type === 'yetkaz' && !addr) {
    return res.status(400).json({ error: "Yetkazib berish uchun manzil kerak." });
  }

  const menu = readJson(MENU_FILE);
  const resolvedItems = [];
  for (const it of items) {
    const menuItem = menu.find(m => m.id === it.id || m.name === it.name);
    if (!menuItem || !menuItem.available) continue;
    const qty = Math.max(1, parseInt(it.qty, 10) || 1);
    resolvedItems.push({ name: menuItem.name, qty, price: menuItem.price });
  }
  if (resolvedItems.length === 0) {
    return res.status(400).json({ error: "Tanlangan mahsulotlar mavjud emas. Iltimos, sahifani yangilang." });
  }
  const total = resolvedItems.reduce((s, it) => s + it.qty * it.price, 0);

  const orders = readJson(ORDERS_FILE);
  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: String(name).slice(0, 100),
    phone: String(phone).slice(0, 30),
    items: resolvedItems,
    total,
    type: type === 'yetkaz' ? 'yetkaz' : 'olib',
    addr: type === 'yetkaz' ? String(addr).slice(0, 200) : '',
    note: note ? String(note).slice(0, 300) : '',
    status: 'yangi',
    createdAt: Date.now()
  };

  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  res.status(201).json(order);
});

app.patch('/api/orders/:id', async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['yangi', 'tayyor', 'yetkazildi'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Noto'g'ri holat." });
  }

  const orders = readJson(ORDERS_FILE);
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Buyurtma topilmadi.' });

  orders[idx].status = status;
  await writeJson(ORDERS_FILE, orders);
  res.json(orders[idx]);
});

app.listen(PORT, () => {
  console.log(`Kishmish Somsa server ${PORT}-portda ishlamoqda`);
});
