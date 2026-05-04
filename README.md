<div align="center">

```
███████╗██╗  ██╗ ██████╗██╗  ██╗██╗   ██╗███████╗
╚══███╔╝╚██╗██╔╝██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔════╝
  ███╔╝  ╚███╔╝ ██║     █████╔╝  ╚████╔╝ ███████╗
 ███╔╝   ██╔██╗ ██║     ██╔═██╗   ╚██╔╝  ╚════██║
███████╗██╔╝ ██╗╚██████╗██║  ██╗   ██║   ███████║
╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

### 🎓 Студентський маркетплейс · Івано-Франківськ

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://zxckys.vercel.app)
[![ESLint](https://img.shields.io/badge/ESLint-enabled-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)

**Маркетплейс для студентів — купуй, продавай, обмінюйся.**

[🌐 Production](https://zxckys.vercel.app) · [💬 Чат у реальному часі](#чат) · [🚀 Швидкий старт](#запуск)

</div>

---

## Про проєкт

**zxckys** — повноцінний студентський маркетплейс із підтримкою оголошень, реал-тайм чату, профілів, відгуків і гнучких фільтрів. Побудований на сучасному стеку React + Vite + Supabase з Row Level Security і Realtime-підпискою.

Це не demo — тут є повний marketplace flow від створення оголошення до завершення угоди з відгуком.

---

## Скріншоти

**Головна сторінка**
![Home](https://github.com/user-attachments/assets/0bb5fe28-c0af-46d4-b29c-edd1ff0e9499)

<br/>

<table>
<tr>
<td width="50%">

**Категорія**
![Category](https://github.com/user-attachments/assets/28dca10b-f931-4e19-a44d-380f30a4c3cd)

</td>
<td width="50%">

**Оголошення**
![Listing](https://github.com/user-attachments/assets/0a993a88-51da-4205-ad5f-a468a47be953)

</td>
</tr>
<tr>
<td width="50%">

**Чат**
![Chat](https://github.com/user-attachments/assets/5b378ab8-98c3-4188-be18-691d3c64c0d8)

</td>
<td width="50%">

**Обране**
![Favorites](https://github.com/user-attachments/assets/da3be665-9f9c-4079-bb17-da0ce34db6c5)

</td>
</tr>
<tr>
<td width="50%">

**Нове оголошення**
![Create Listing](https://github.com/user-attachments/assets/916bb6bf-be0c-480f-9d19-4faae2c666ca)

</td>
<td width="50%">

**Профіль**
![Profile](https://github.com/user-attachments/assets/5d5d92c7-8ac8-4150-9e02-3cdd03c2eff0)

</td>
</tr>
</table>

---

## Можливості

### 📦 Оголошення
- Створення оголошень із фото
- Категорії: техніка, авто, одяг, геймінг, конспекти, послуги, робота, безкоштовно
- Category-specific атрибути та фільтри
- Редагування та видалення власних оголошень
- Seller profile preview і схожі оголошення

### 💬 Чат
- Supabase Realtime — оновлення діалогів і повідомлень в реальному часі
- Вкладення фото в повідомлення
- Unread state
- Deal flow: `open → awaiting_confirmation → completed`
- Відгуки після завершення угоди
- Мобільний сценарій: `список → діалог`

### 👤 Профіль
- Supabase Auth
- Редагування display name, bio, phone, avatar
- Seller rating і completed deals
- Публічний seller profile

### 🔍 Пошук і навігація
- Пошук по назві, опису і тегах
- Фільтри за ціною, рейтингом, доставкою, містом
- Окремі маршрути для listings / seller / chat / favorites / settings

---

## Стек

| Шар | Технологія |
|-----|-----------|
| UI | React 19, Heroicons |
| Збірка | Vite 7 |
| Роутинг | React Router DOM 7 |
| Auth | Supabase Auth |
| База даних | Supabase PostgreSQL + RLS |
| Файли | Supabase Storage |
| Реал-тайм | Supabase Realtime |
| Лінтер | ESLint |

---

## Архітектура

```text
src/
├── components/
│   └── routing/
│       ├── AdminRoute.jsx
│       └── ProtectedRoute.jsx
├── constants/
│   ├── cities.js
│   └── roles.js
├── hooks/
│   ├── useAuth.js
│   ├── useFavorites.js
│   └── useNavigation.js
├── lib/
│   ├── routes.js
│   └── supabase.js
├── pages/
│   └── MarketplacePage.jsx
├── services/
│   ├── authService.js
│   ├── chatService.js
│   ├── listingsService.js
│   └── profileService.js
├── App.jsx
└── main.jsx
```

Auth, favorites і navigation винесені в hooks. Supabase CRUD — у services. Роутинг через `Routes / Route / Navigate` із `ProtectedRoute` і `AdminRoute`.

---

## Маршрути

```
/                     → головна
/category/:categoryId → категорія
/listing/:listingId   → сторінка оголошення
/seller/:sellerId     → профіль продавця
/favorites            → обране
/chat                 → чат
/settings             → налаштування профілю
/profile/:profileId   → публічний профіль
/create               → нове оголошення
/admin                → адмін-панель
```

---

## База даних

Основні сутності: `listings`, `listing_extras`, `profiles`, `conversations`, `messages`, `reviews`.

Таблиця `profiles` включає: `role`, `is_banned`, `is_verified`, `rating`, `completed_deals`.

Для деталей — SQL у `db/migrations/` і snapshot у `db/schema/`.

---

## Запуск

### Вимоги

- Node.js 18+
- npm 9+
- Supabase project

### 1. Клонування

```bash
git clone https://github.com/m1rai-tech/zxckys.git
cd zxckys
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Змінні середовища

Створіть `.env` у корені проєкту:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Міграції

```bash
npm run supabase:setup
```

### 5. Dev server

```bash
npm run dev
# http://localhost:5173
```

---

## Скрипти

| Команда | Призначення |
|---------|------------|
| `npm run dev` | Локальний Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Локальний preview build |
| `npm run lint` | ESLint |
| `npm run supabase:setup` | Запуск SQL-міграцій |

---

## Що далі

- [ ] Винести `useListings`, `useChat`, `useProfile`
- [ ] Перенести роль із фронтенд-логіки на `profiles.role`
- [ ] Додати `favorites` у базу замість localStorage
- [ ] Дотиснути UI-систему: `Button`, `Input`, `Modal`, `Badge`, `EmptyState`, `Loader`
- [ ] Базові тести на critical flows

---

## Автори

<table>
<tr>
<td align="center">
<a href="https://github.com/m1rai-tech"><b>m1rai-tech</b></a>
</td>
<td align="center">
<a href="https://github.com/ihorvpalamarchuk-hue"><b>ihorvpalamarchuk-hue</b></a>
</td>
</tr>
</table>

---

<div align="center">
<sub>Зроблено в Івано-Франківську ☕</sub>
</div>
