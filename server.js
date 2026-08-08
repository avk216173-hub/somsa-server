// Kishmish Somsa — buyurtmalar serveri
// Oddiy Express server, buyurtmalarni data/orders.json faylida saqlaydi.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

// --- Ma'lumotlar bazasi (oddiy JSON fayl) ---

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

// Yozish paytida poydevor buzilmasligi uchun oddiy navbat
let writeQueue = Promise.resolve();
function readOrders() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('orders.json o\'qishda xatolik:', e);
    return [];
  }
}
function writeOrders(orders) {
  writeQueue = writeQueue.then(() =>
    fs.promises.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8')
  );
  return writeQueue;
}

// --- Middleware ---

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API ---

// Barcha buyurtmalarni olish (eng yangisi birinchi)
app.get('/api/orders', (req, res) => {
  const orders = readOrders().sort((a, b) => b.createdAt - a.createdAt);
  res.json(orders);
});

// Yangi buyurtma qo'shish
app.post('/api/orders', async (req, res) => {
  const { name, phone, items, total, type, addr, note } = req.body || {};

  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Ism, telefon va kamida bitta mahsulot kerak.' });
  }
  if (type === 'yetkaz' && !addr) {
    return res.status(400).json({ error: "Yetkazib berish uchun manzil kerak." });
  }

  const orders = readOrders();
  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: String(name).slice(0, 100),
    phone: String(phone).slice(0, 30),
    items: items.map(it => ({
      name: String(it.name).slice(0, 60),
      qty: Math.max(1, parseInt(it.qty, 10) || 1),
      price: Math.max(0, parseInt(it.price, 10) || 0)
    })),
    total: Math.max(0, parseInt(total, 10) || 0),
    type: type === 'yetkaz' ? 'yetkaz' : 'olib',
    addr: type === 'yetkaz' ? String(addr).slice(0, 200) : '',
    note: note ? String(note).slice(0, 300) : '',
    status: 'yangi',
    createdAt: Date.now()
  };

  orders.push(order);
  await writeOrders(orders);
  res.status(201).json(order);
});

// Buyurtma holatini yangilash (yangi -> tayyor -> yetkazildi)
app.patch('/api/orders/:id', async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['yangi', 'tayyor', 'yetkazildi'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri holat.' });
  }

  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Buyurtma topilmadi.' });
  }

  orders[idx].status = status;
  await writeOrders(orders);
  res.json(orders[idx]);
});

app.listen(PORT, () => {
  console.log(`Kishmish Somsa server ${PORT}-portda ishlamoqda`);
});
