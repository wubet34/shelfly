function toCents(value) {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new TypeError('Money values must have at most two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

function fromCents(cents) {
  return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
}

function prepareSale(items, products) {
  const productById = new Map(products.map((product) => [Number(product.id), product]));
  const quantities = new Map();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  const lines = [...quantities].map(([productId, quantity]) => {
    const product = productById.get(productId);
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
    if (Number(product.stock) < quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}. Only ${product.stock} in stock.`), { status: 409 });
    return { product, quantity, lineTotalCents: toCents(product.price) * BigInt(quantity) };
  });
  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0n);
  if (totalCents > 999999999999n) throw Object.assign(new Error('Sale total exceeds the supported amount.'), { status: 400 });
  return { lines, total: fromCents(totalCents) };
}

module.exports = { toCents, fromCents, prepareSale };
