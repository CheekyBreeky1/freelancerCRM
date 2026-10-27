# freelancerCRM

CRM-система для фрилансера — pet-проект, который я делаю в одиночку.
Цель — разобраться в связке React + Express + PostgreSQL и подтянуть бэкенд,
поэтому проект для меня не столько «продукт», сколько способ делать всё руками
и понимать, как оно работает под капотом.

## Статус

Проект в активной разработке. Сейчас готово:

- **Контракт** — описание сущностей и API: [`docs/openapi.yaml`](./docs/openapi.yaml).
- **Вёрстка** интерфейса на React + TypeScript (папка `frontend`): готовые
  компоненты без роутинга. Роутинг сознательно оставляю на потом — он завязан
  на аутентификацию, поэтому логичнее делать его после бэкенда, а не
  переделывать дважды.

В планах:

- бэкенд на Node.js + Express;
- слой работы с PostgreSQL и Prisma;
- аутентификация;
- роутинг на фронтенде (после аутентификации);
- логика на фронтенде: запросы к API, состояние, обработка ошибок.

## Стек

**Frontend:**
- React 18 + Vite
- TypeScript
- CSS с глобальными переменными

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT (access + refresh в HttpOnly cookie)

**Контракт:**
- OpenAPI 3.0 (`docs/openapi.yaml`)
- Генерация типов для фронта через `openapi-typescript`

## Установка и запуск

### 1. Клонировать репозиторий

```bash
git clone <url-репозитория>
cd freelancerCRM
```

### 2. Настроить базу данных

Создай две базы в PostgreSQL:
- `freelance_crm` — для разработки
- `freelance_crm_test` — для тестов

### 3. Переменные окружения

#### `backend/.env` (для dev-сервера)

Скопируй шаблон и заполни своими значениями:

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/freelance_crm?schema=public"
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
```

#### `backend/.env.test` (для тестов)

```bash
cp backend/.env.test.example backend/.env.test
```

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/freelance_crm_test?schema=public"
JWT_ACCESS_SECRET=test-access-secret
JWT_REFRESH_SECRET=test-refresh-secret
NODE_ENV=test
```

**Важно:** `.env` и `.env.test` в `.gitignore` — они не попадают в репозиторий. В репозитории лежат только `.env.example` и `.env.test.example` как шаблоны.

### 4. Backend (в отдельном терминале)

```bash
cd backend

# Установить зависимости
npm install

# Применить миграции к базе данных
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Запустить dev-сервер
npm run dev
```

Сервер поднимется на `http://localhost:3000`. Проверка: `GET http://localhost:3000/health` → `{ "status": "ok" }`.

### 5. Frontend (в отдельном терминале)

```bash
cd frontend

# Установить зависимости
npm install

# Сгенерировать типы из OpenAPI-контракта
npm run gen:api

# Запустить dev-сервер
npm run dev
```

Приложение откроется на `http://localhost:5173`.

## Тесты

```bash
cd backend
npm test
```

Тесты используют отдельную базу `freelance_crm_test`. Перед запуском убедись, что она создана в PostgreSQL и что `.env.test` заполнен.

## Работа с OpenAPI-контрактом

`docs/openapi.yaml` — **единственный источник правды** для API. Любые изменения эндпоинтов, моделей или ошибок начинаются здесь.

После изменения контракта:

```bash
cd frontend
npm run gen:api
```

Это перегенерирует `frontend/src/api/schema.d.ts` — TypeScript-типы, которые используются в компонентах. Если что-то сломалось на фронте из-за изменения контракта, TypeScript покажет это при компиляции.

## Аутентификация

- **Access-токен** (JWT, 15 минут) — в заголовке `Authorization: Bearer <token>`.
- **Refresh-токен** (JWT, 30 дней) — в `HttpOnly` cookie с `Path=/api/v1/auth/refresh`.
- При истечении access-токена клиент вызывает `POST /api/v1/auth/refresh`, получает новый и повторяет запрос.
- При выходе (`POST /api/v1/auth/logout`) refresh-cookie зануляется.