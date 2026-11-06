# GradeFlow — Intellektual Akademik Monitoring & AI Mentor Platformasi

**GradeFlow** — bu o'quvchilar va talabalar uchun o'z baholarini tizimli monitoring qilish, akademik natijalarni chuqur tahlil qilish, zaif fanlarni o'z vaqtida aniqlash va o'quv ko'rsatkichlarini sezilarli darajada oshirishga yordam beruvchi zamonaviy veb-platforma.

Ilova shaxsiy akademik mentor kabi harakat qilib, baholarning nafaqat o'rtacha arifmetik qiymatini, balki ularning vaqt bo'yicha dinamikasini, chastotasini va o'zgarish tendensiyasini hisobga oladi.

---

## 🚀 Asosiy Imkoniyatlar

### 1. 📊 Zamonaviy Dashboard (Boshqaruv Paneli)
- **Umumiy GPA (O'rtacha ball)** va akademik o'zlashtirish foizi ($5.0$ ballik shkala asosida).
- Jami fanlar va barcha kiritilgan baholar soni.
- **Baholar taqsimoti:** 5 (A'lo), 4 (Yaxshi), 3 (Qoniqarli) va 2 (Qoniqarsiz) baholarning vizual nisbati.
- **Akademik o'sish ko'rsatkichi (Improvement Indicator):** O'tgan davrga nisbatan natijalar dinamikasi.
- **Haftalik va Oylik Recharts diagrammalari:** Tebranishlar va barqarorlik egri chiziqlari.
- **Oxirgi baholar jurnali:** Tezkor tahrirlash va o'chirish imkoniyati bilan.

### 2. 📝 Baholar Boshqaruvi (Grade Management)
- Yangi baho kiritish (Fan, Baho: 2, 3, 4, 5, Sana, Izoh va Baho turi: sinf ishi, uy vazifasi, nazorat ishi, imtihon).
- Baholarni tahrirlash va o'chirish.
- Fanlar, baho qiymatlari va kalit so'zlar bo'yicha tezkor qidiruv hamda saralash (eng yangi, eng eski, eng yuqori, eng past).

### 3. 📚 Fanlar Tahlili (Subject Analytics)
- Har bir fan uchun alohida karta:
  - O'rtacha ball va tendensiya ko'rsatkichi (ko'tarilish/pasayish).
  - O'tgan davr bilan dinamik taqqoslash.
  - Baholar taqsimoti progress-bari.
  - O'qituvchi ma'lumotlari.
- Fan bo'yicha to'liq xronologik tarix va chuqur tahlil modali.
- Yangi fan qo'shish, tahrirlash va ranglarini moslash.

### 4. 🧠 Shaxsiy AI Akademik Mentor (Asosiy Xususiyat)
Baholar dinamikasini avtomatlashtirilgan aqlli tahlil qilish tizimi:
- **Qat'iy status qoidalari:**
  - **O'rtacha ball < 4.0 (Qizil ogohlantirish):**  
    *"Ushbu fan bo'yicha ko'rsatkichlaringiz pasaymoqda. Ushbu fanga ko'proq e'tibor qaratishingiz zarur."*
  - **O'rtacha ball 4.0 — 4.49 (Sariq ogohlantirish):**  
    *"Ko'rsatkichlaringiz qoniqarli, ammo yaxshilash uchun imkoniyatlar mavjud."*
  - **O'rtacha ball 4.5 — 4.79 (Yaxshi ko'rsatkich):**  
    *"Yaxshi natija! A'lo natijalarga erishish uchun ishlashda davom eting."*
  - **O'rtacha ball >= 4.80 (Yashil status):**  
    *"A'lo darajadagi natija! Ushbu yuqori darajani saqlab qoling."*
- **Eng zaif va eng kuchli fanlarni aniqlash** (Multi-faktorli baholash: o'rtacha ball 60% + tendensiya tezligi 25% + muntazamlik 15%).
- **Haftalik va oylik natijalarni qiyoslash**.
- **Amaliy o'qish tavsiyalari (Interactive Action Steps):** O'quvchi tomonidan bajarilgan qadamlarni belgilash (Pomodoro, Feynman texnikasi, xatolar jurnali).
- **Tavsiyalar samaradorligi monitoringi (Impact Tracker):** Mentor ogohlantirishlaridan keyin o'rtacha ball qanchaga oshganini o'lchash.
- **Interaktiv AI Mentor Chat:** Baholar kontekstini inobatga olgan holda o'quvchining savollariga jonli javob beruvchi yordamchi.

### 5. 🎯 Akademik Maqsadlar (Academic Goals)
- Har bir fan bo'yicha maqsadli ball belgilash (masalan: Matematika: 4.8, Ingliz tili: 5.0, Kimyo: 4.5).
- Maqsadgacha bo'lgan masofa va foiz ko'rsatkichi.
- **Matematik formulaga asoslangan talab:** Maqsadga yetish uchun ketma-ket nechta 5 baho olish zarurligini aniq hisoblab beradi.
- Maqsadga erishilganda konfetti bayram animatsiyasi! 🎉

### 6. 🔔 Xabarnomalar Tizimi (Notifications)
- Avtomatik ogohlantirishlar:
  - Fan o'rtachasi 4.5 dan pastga tushganda.
  - Natijalar pasayishi aniqlanganda.
  - Maqsadga erishilganda.
  - Qo'shimcha e'tibor talab etilganda.
- Takroriy bildirishnomalarning oldini oluvchi dedup kalit mexanizmi.

### 7. 🌐 Ko'p Tillilik (i18n)
- **O'zbek tili (Standart)**
- **English**
- **Русский**

### 8. 🗄️ Ma'lumotlar Bazasi & Supabase Integratsiyasi
- **Supabase PostgreSQL** bilan to'liq integratsiya (`profiles`, `subjects`, `grades`, `academic_goals`, `notifications` jadvallari, RLS xavfsizlik qoidalari, triggerlar).
- **Dual-Mode arxitekturasi:** Dastur darhol ishga tushishi uchun boy namunaviy ma'lumotlar bazasi bilan lokal rejimda ishlaydi hamda Sozlamalar orqali bir tugma bilan Supabase loyihasiga ulanadi!

---

## 🛠️ Texnologiyalar Steki

- **Freymvork:** Next.js (App Router)
- **Dasturlash tili:** TypeScript
- **Stilizatsiya:** Tailwind CSS (Modern Dark Mode by default)
- **Vizualizatsiya & Grafika:** Recharts, Lucide React, Canvas Confetti
- **Ma'lumotlar bazasi:** Supabase & PostgreSQL (Row Level Security bilan)

---

## 📦 O'rnatish va Ishga Tushirish

Loyihani kompyuteringizda ishga tushirish uchun:

```bash
# 1. Bog'liqliklarni o'rnatish
npm install

# 2. Dasturni rivojlantirish (dev) rejimida ishga tushirish
npm run dev

# 3. Yoki production build va start qilish
npm run build
npm run start
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

---

## 🗄️ Supabase Ma'lumotlar Bazasini Sozlash

Supabase loyihangizni ulash uchun:
1. `supabase/schema.sql` faylidagi barcha SQL buyruqlarni nusxalang.
2. Supabase panelingizdagi **SQL Editor** bo'limiga tashlab, **Run** tugmasini bosing.
3. `.env.local` faylini yarating yoki ilova ichidagi **Sozlamalar (Settings)** bo'limidan Supabase URL va Anon Key ni kiriting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
