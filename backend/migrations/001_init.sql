CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Usuarios ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT        NOT NULL,
  email                    TEXT        UNIQUE NOT NULL,
  password                 TEXT        NOT NULL,
  profile_url              TEXT,
  is_active                BOOLEAN     NOT NULL DEFAULT FALSE,
  activation_token         TEXT        UNIQUE,
  activation_token_expires TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Categorías ───────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  icon       TEXT        NOT NULL DEFAULT '💰',
  color      TEXT        NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Transacciones ─────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID           REFERENCES categories(id) ON DELETE SET NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type        TEXT           NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  date        DATE           NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Presupuestos ──────────────────────────────────────────────────────────────
CREATE TABLE budgets (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID           NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  month       CHAR(7)        NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, category_id, month)
);

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_transactions_user_id  ON transactions(user_id);
CREATE INDEX idx_transactions_date     ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_categories_user_id    ON categories(user_id);
CREATE INDEX idx_budgets_user_month    ON budgets(user_id, month);
