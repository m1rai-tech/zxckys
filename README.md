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

<div align="center">
  <br/>
  <img src="public/logo.svg" width="64" alt="logo" />
  <h1>zxckys</h1>
  <p>Дошка оголошень · React 19 + Supabase + Vite</p>
  <br/>
</div>

---

## Скріншоти

**Головна**
![Home](https://github.com/user-attachments/assets/e8dccb34-1aa4-4e8c-b7be-aa072b789f81)

**Чат**
![Chat](https://github.com/user-attachments/assets/1bef4c60-daea-4570-a5c9-b1a3f9f8c0eb)

**Вибране**
![Favorites](https://github.com/user-attachments/assets/930332c9-9af6-4bc0-b7bf-1e7dcab2bb00)

**Нове оголошення**
![Create](https://github.com/user-attachments/assets/c45b147e-5435-4181-9d91-0c0c4a59f07b)

**Профіль**
![Profile](https://github.com/user-attachments/assets/89c58f49-4885-4134-9e3a-5c2fc010478f)

---

## Стек

| | |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 7 |
| **Backend** | Supabase — PostgreSQL, Auth, Storage, Realtime |
| **Стилі** | Vanilla CSS (CSS-змінні, без UI-фреймворків) |
| **Іконки** | Heroicons + кастомні SVG |
| **Деплой** | Vercel |

---

## Функціонал

- 📋 **Оголошення** — створення, редагування, фото, атрибути під кожну категорію
- 🗂️ **Категорії** — Техніка, Авто, Одяг, Робота, Послуги, Книги, Геймінг, Безкоштовно
- 💬 **Чат** — переписка покупця і продавця в реальному часі, вкладення
- ⭐ **Відгуки** — рейтинг після завершення угоди
- ❤️ **Вибране** — збереження цікавих оголошень
- 🔍 **Пошук** — по всіх активних оголошеннях
- 👤 **Профіль** — аватар, рейтинг, публічна сторінка продавця
- 🛡️ **Ролі** — `user` / `moderator` / `admin`, панель модерації

---

## Структура проекту

```
zxckys/
├── src/
│   ├── components/      # Header, Footer, Layout, ListingCard, CategoryBar…
│   ├── pages/           # Home, Auth, Chat, Admin, Settings, Profile…
│   ├── contexts/        # AuthContext
│   ├── hooks/           # useFavorites
│   ├── lib/             # supabase.js · routes.js · validation.js
│   ├── data/            # categories · autoCatalog · autoBodyCatalog
│   └── constants/       # roles.js · cities.js
├── db/
│   ├── schema/          # 001_supabase_base.sql
│   └── migrations/      # SQL-міграції у хронологічному порядку
├── scripts/
│   ├── run-supabase-migrations.js
│   └── serve-dist.js
├── public/              # logo.svg · logo.png
└── vercel.json
```

---

## Запуск

### 1. Встановлення

```bash
git clone <repo-url>
cd zxckys
npm install
```

### 2. Змінні середовища

Створіть `.env` в корені проекту:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Ключі: **Supabase Dashboard → Settings → API**.

> Якщо `.env` відсутній — застосунок покаже сторінку-підказку замість краша.

### 3. База даних

Відкрийте **Supabase → SQL Editor** і виконайте по черзі:

```
db/schema/001_supabase_base.sql
db/migrations/20260409195000_create_supabase_chat_tables.sql
db/migrations/20260409201500_add_listings_moderation_policy.sql
db/migrations/20260409214000_create_listing_media_and_extras.sql
db/migrations/20260414120000_add_listings_crud_policies.sql
db/migrations/20260414133000_create_public_profiles.sql
db/migrations/20260414143000_add_message_attachments.sql
db/migrations/20260421150000_add_conversation_status_and_reviews.sql
db/migrations/20260422161000_add_completed_conversation_delete_policy.sql
db/migrations/20260422170500_add_reviews_to_supabase_realtime.sql
db/migrations/20260423170000_add_profile_role_and_flags.sql
db/migrations/20260424191000_use_profile_roles_for_listing_delete.sql
db/migrations/20260424200000_add_profile_avatar_upload.sql
```

Або через скрипт (потрібен прямий доступ до БД):

```bash
npm run supabase:setup
```

### 4. Запуск

```bash
npm run dev        # dev-сервер → http://localhost:5173
npm run build      # продакшн-білд
npm run preview    # перегляд білду локально
```

---

## Схема бази даних

| Таблиця | Призначення |
|---|---|
| `profiles` | Профілі користувачів — ім'я, аватар, рейтинг, роль |
| `listings` | Оголошення |
| `listing_media` | Медіафайли до оголошень |
| `conversations` | Чат-сесії між покупцем і продавцем |
| `messages` | Повідомлення у чаті |
| `reviews` | Відгуки після завершення угоди |

Усі таблиці захищені через **Row Level Security** — кожен бачить і редагує тільки своє.

---

## Ролі

| Роль | Доступ |
|---|---|
| `user` | Публікує оголошення, пише в чат |
| `moderator` | + видалення чужих оголошень, бан користувачів |
| `admin` | Повний доступ, керування ролями |

Роль призначається через Supabase Dashboard або панель `/admin`.

---

## Деплой на Vercel

1. Запуш репо на GitHub
2. Імпортуй проект у [vercel.com](https://vercel.com)
3. Додай `VITE_SUPABASE_URL` і `VITE_SUPABASE_ANON_KEY` у Environment Variables
4. Deploy — `vercel.json` вже налаштований, більше нічого не потрібно
