# Jumys — AI-поиск работы в Актау

AI-подбор вакансий и кандидатов для города Актау, Казахстан.

Соискатели заполняют профиль один раз и получают персональные подборки — AI ранжирует вакансии по семантической близости к навыкам и опыту. Работодатели публикуют вакансии и получают рейтинг откликов. Telegram-бот присылает свежие матчи и позволяет откликаться в один клик.

## Стек

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript** + **Tailwind CSS** + **shadcn/ui**
- **Supabase** — Postgres с расширением `pgvector`, Auth, RLS
- **OpenAI** — `text-embedding-3-small` (1536 dim) для эмбеддингов, `gpt-4o-mini` для объяснений матча
- **grammY** — Telegram-бот через Next.js webhook
- **react-hook-form** + **zod**, **sonner** для тостов

## Тестовые аккаунты

После запуска `npm run seed`:

| Роль | Email | Пароль |
|------|-------|--------|
| Работодатель (ресторан «Дастархан») | `dastarkhan@jumys.test` | `password123` |
| Работодатель (сеть магазинов Magnum) | `magnum@jumys.test` | `password123` |
| Соискатель (официантка, 2 года) | `aigul.s@jumys.test` | `password123` |
| Соискатель (React-разработчик) | `dinmukhammed@jumys.test` | `password123` |

Всего seed создаёт **10 работодателей**, **15 соискателей** и **50 активных вакансий** с пересчитанными эмбеддингами.

## Быстрый старт

### 1. Supabase

Создайте проект на [supabase.com](https://supabase.com), затем в SQL Editor выполните миграцию:

```
supabase/migrations/0001_jumys.sql
```

Миграция включает расширение `pgvector`, создаёт таблицы, HNSW-индексы, RLS-политики и две RPC функции (`match_jobs_for_seeker`, `match_seekers_for_job`).

### 2. Переменные окружения

```bash
cd nextjs
cp .env.example .env.local
```

Заполните:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — из Project Settings → API
- `OPENAI_API_KEY` — из [platform.openai.com](https://platform.openai.com/api-keys)
- `TELEGRAM_BOT_TOKEN` — создайте бота у [@BotFather](https://t.me/BotFather)
- `NEXT_PUBLIC_SITE_URL` — публичный URL (для локалки — ngrok)
- `CRON_SECRET` — любой длинный случайный токен

### 3. Установка и запуск

```bash
npm install
npm run seed        # опционально: залить 10 работодателей, 15 соискателей, 50 вакансий
npm run dev         # http://localhost:3000
```

## Тестирование Telegram-бота

Webhook живёт по адресу `POST /api/bot`. Для локалки нужен HTTPS-туннель:

```bash
# 1. Запустите ngrok в отдельном терминале
ngrok http 3000

# 2. Обновите NEXT_PUBLIC_SITE_URL в .env.local на ngrok URL
# 3. Зарегистрируйте webhook у Telegram (замените TOKEN и URL):
curl -F "url=https://xxxx.ngrok-free.app/api/bot" \
  https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook

# 4. Откройте бота, нажмите /start и поделитесь контактом.
#    Номер должен совпадать с профилем в базе (для seed — проверьте phone у соискателя)
# 5. /vacancies — получить топ-5 персональных вакансий
```

## Отправка очереди уведомлений (cron)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/notifications
```

В продакшене подключите Vercel Cron или любой внешний шедулер с интервалом 1-5 минут.

## Структура

```
nextjs/src/
├── app/
│   ├── api/
│   │   ├── auth/callback/     # Supabase OAuth callback
│   │   ├── bot/               # Telegram webhook (grammY)
│   │   └── cron/notifications/# Рассылка очереди уведомлений
│   ├── auth/                  # Вход, регистрация, восстановление
│   ├── onboarding/            # Выбор роли → детали профиля
│   ├── dashboard/             # Личный кабинет (роль-зависимый UI)
│   │   ├── recommendations/   # Персональные матчи (соискатель)
│   │   ├── jobs/              # Мои вакансии (работодатель)
│   │   └── applications/      # Отклики
│   ├── jobs/                  # Публичный каталог и страница вакансии
│   └── page.tsx               # Лендинг
├── lib/
│   ├── actions/               # Server actions (jobs, applications, onboarding, matching)
│   ├── ai/                    # embeddings.ts, explanations.ts
│   ├── supabase/              # client/server/middleware/admin
│   ├── telegram/send.ts       # Очередь и отправка уведомлений
│   ├── constants.ts           # Районы, категории, типы занятости
│   └── types.ts               # Database, custom enums
└── components/
    ├── ui/                    # shadcn/ui примитивы
    ├── DashboardNav.tsx
    ├── JobCard.tsx
    ├── MatchScoreBadge.tsx
    ├── ExplainMatchButton.tsx
    └── TagInput.tsx

supabase/migrations/0001_jumys.sql

nextjs/scripts/seed.ts
```

## Ключевые решения

**Матчинг.** Эмбеддинг соискателя и вакансии строится из роли, навыков, района и опыта (см. `lib/ai/embeddings.ts`). Две RPC функции `SECURITY DEFINER` возвращают рейтинг с косинусной близостью через оператор `<=>`. HNSW-индексы на обеих таблицах.

**Объяснение матча.** AI генерирует короткое (2-3 предложения) обоснование на русском через `gpt-4o-mini` и кеширует в таблице `match_explanations` — повторные запросы бесплатны.

**Telegram-бот.** Привязка по номеру телефона: нормализуем, обрезаем до последних 10 цифр для устойчивости к формату (`8` vs `+7`). Команды: `/start` (share contact), `/vacancies` (топ-5 матчей с inline-кнопками «Посмотреть» и «Откликнуться»).

**Очередь уведомлений.** При публикации вакансии `enqueueJobMatchNotifications` сохраняет в `notifications` топ-N соискателей с similarity ≥ 0.6. Крон-эндпоинт раз в минуту рассылает pending-уведомления батчами. Это защищает от рейт-лимитов Telegram и даёт retry out of the box.

