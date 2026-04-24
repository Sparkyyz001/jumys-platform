alter table profiles
  add column if not exists telegram_link_token text,
  add column if not exists telegram_link_token_expires_at timestamptz;

create unique index if not exists profiles_telegram_link_token_uq
  on profiles (telegram_link_token)
  where telegram_link_token is not null;
