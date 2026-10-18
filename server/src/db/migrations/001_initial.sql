CREATE TABLE IF NOT EXISTS businesses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ETB',
  timezone TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER','EMPLOYEE')),
  permissions JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, email)
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Accessories',
  barcode TEXT,
  supplier TEXT,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  threshold INTEGER NOT NULL DEFAULT 0 CHECK (threshold >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, sku)
);
CREATE INDEX IF NOT EXISTS products_search_idx ON products(business_id, active, name);
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, phone)
);
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES users(id),
  customer_id BIGINT REFERENCES customers(id),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH','TELEBIRR','BANK','CREDIT')),
  total NUMERIC(12,2) NOT NULL CHECK(total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_business_created_idx ON sales(business_id, created_at DESC);
CREATE TABLE IF NOT EXISTS sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK(amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id BIGINT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
