-- ── Cuentas ───────────────────────────────────────────────────────────────────
CREATE TABLE accounts (
  id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 TEXT           NOT NULL,
  icon                 TEXT           NOT NULL DEFAULT 'wallet',
  color                TEXT           NOT NULL DEFAULT '#6366f1',
  balance              NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency             CHAR(3)        NOT NULL DEFAULT 'USD',
  exclude_from_stats   BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ── Agregar account_id a transactions ────────────────────────────────────────
ALTER TABLE transactions
  ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_account_id ON transactions(account_id);

-- ── Transferencias ───────────────────────────────────────────────────────────
CREATE TABLE transfers (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_account_id       UUID            NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id         UUID            NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  fee_transaction_id    UUID            REFERENCES transactions(id) ON DELETE SET NULL,
  amount                NUMERIC(12, 2)  NOT NULL CHECK (amount > 0),
  fee                   NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  description           TEXT,
  date                  DATE            NOT NULL,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- No puede transferir a la misma cuenta
  CHECK (from_account_id != to_account_id)
);

CREATE INDEX idx_transfers_user_id         ON transfers(user_id);
CREATE INDEX idx_transfers_from_account_id ON transfers(from_account_id);
CREATE INDEX idx_transfers_to_account_id   ON transfers(to_account_id);
CREATE INDEX idx_transfers_date            ON transfers(date DESC);
