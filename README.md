Markdown
somsa-server/
├── server.js          ← backend (API + statik fayllarni beradi)
├── package.json       ← kerakli paketlar ro'yxati
├── public/
│   ├── index.html     ← mijoz, oshxona va admin sahifasi
│   ├── manifest.json  ← PWA (telefonga o'rnatish) sozlamasi
│   ├── sw.js          ← service worker (o'rnatish uchun)
│   ├── icon-192.png   ← ilova ikonkasi
│   └── icon-512.png   ← ilova ikonkasi
└── data/
├── orders.json    ← buyurtmalar (avtomatik yaratiladi)
└── menu.json      ← menyu, narx, rasm, bor/yo'q holati (avtomatik yaratiladi)
## Kompyuteringizda sinab ko'rish
cd somsa-server
npm install
npm start
Brauzerda: `http://localhost:3000`

## Internetga chiqarish

Render.com yoki Railway.app: GitHub repoga ulang, Build: `npm install`,
Start: `npm start`.

## Telefon ilova kabi o'rnatish (PWA)

Ilova PWA sifatida tayyorlangan — brauzerda ochib, "Bosh ekranga qo'shish"
tugmasini bossangiz, telefonda alohida ikonka bilan ochiladi.

## Admin panel

"Admin" bo'limiga standart raqam bilan kiriladi: `+998944404321`. U yerda
mahsulotlarni **bor/tugagan** deb belgilash, narxni o'zgartirish va rasm
havolasini qo'shish mumkin.

Admin va buyurtma raqamlarini o'zgartirish uchun Render sozlamalarida
**Environment** bo'limiga `ADMIN_PHONE` va `ORDER_PHONE` qo'shing.

## Muhim eslatmalar

- Buyurtmalar `data/orders.json`, menyu esa `data/menu.json` faylida saqlanadi.
- "Buyurtmalar" bo'limi har 6 soniyada avtomatik yangilanadi.
