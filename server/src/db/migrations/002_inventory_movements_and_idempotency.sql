ALTER TABLE sales ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS sales_business_idempotency_key_idx
  ON sales(business_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  sale_id BIGINT REFERENCES sales(id),
  user_id BIGINT REFERENCES users(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('SALE', 'ADJUSTMENT', 'RESTOCK')),
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_business_created_idx
  ON inventory_movements(business_id, created_at DESC);
