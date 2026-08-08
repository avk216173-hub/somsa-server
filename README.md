# Kishmish Somsa — Buyurtmalar Serveri

Bu — kishmish somsa (va boshqa turdagi somsalar) uchun buyurtmalar qabul qiladigan
to'liq server: Node.js + Express backend va oldindan tayyor frontend.

## Nima uchun bu kerak

Avvalgi versiya (bitta HTML fayl) faqat Claude ilova ichida ochilganda ishlar edi.
Uni yuklab olib, oddiy brauzerda ochsangiz, buyurtmalar hech qayerga saqlanmas edi.
Bu versiya haqiqiy serverda ishlaydi — shuning uchun istalgan qurilmadan (telefon,
kompyuter) buyurtma internetga to'g'ridan-to'g'ri boradi.

## Loyihadagi fayllar

```
somsa-server/
├── server.js        ← backend (API + statik fayllarni beradi)
├── package.json      ← kerakli paketlar ro'yxati
├── public/
│   └── index.html    ← mijoz va oshxona uchun sahifa
└── data/
    └── orders.json    ← buyurtmalar shu yerda saqlanadi (avtomatik yaratiladi)
```

## Kompyuteringizda sinab ko'rish

1. [Node.js](https://nodejs.org) o'rnatilgan bo'lishi kerak (18-versiya yoki undan yuqori).
2. Terminalda shu papkaga kiring:
   ```
   cd somsa-server
   npm install
   npm start
   ```
3. Brauzerda oching: `http://localhost:3000`

## Internetga chiqarish (bepul variantlar)

Eng oson yo'l — **Render.com** yoki **Railway.app**:

1. Ushbu papkani GitHub'ga yuklang (yangi repository yarating va push qiling).
2. Render.com yoki Railway.app'da hisob oching, "New Web Service" tugmasini bosing
   va GitHub repository'ingizni tanlang.
3. Build buyrug'i: `npm install`, Start buyrug'i: `npm start`.
4. Bir necha daqiqadan so'ng sizga `https://sizning-nom.onrender.com` kabi
   ochiq havola beriladi — shu havolani mijozlaringizga yuboraverasiz.

## O'zingizning VPS serveringizga joylashtirish

Agar alohida server (Ubuntu VPS va h.k.) bo'lsa:

```bash
# Node.js o'rnatilganini tekshiring, keyin:
cd somsa-server
npm install
npm install -g pm2       # server doim ishlab turishi uchun
pm2 start server.js --name somsa
pm2 save
pm2 startup              # server qayta yoqilganda avtomatik ishga tushadi uchun
```

Domeningizga ulash uchun Nginx bilan `reverse proxy` sozlang (server 3000-portda
ishlaydi, standart holatda).

## Muhim eslatmalar

- `PORT` muhit o'zgaruvchisi orqali portni o'zgartirish mumkin (masalan, Render buni
  avtomatik beradi).
- Buyurtmalar `data/orders.json` faylida saqlanadi. Serverni ko'chirsangiz, shu
  faylni ham birga ko'chiring — buyurtmalar tarixi yo'qolmaydi.
- Bu oddiy fayl-asosli saqlash; juda katta hajmdagi buyurtmalar oqimi uchun
  (masalan, kuniga minglab) haqiqiy ma'lumotlar bazasiga (PostgreSQL, MongoDB)
  o'tish tavsiya etiladi.
- "Buyurtmalar" bo'limi (oshxona ekrani) har 6 soniyada avtomatik yangilanadi.
