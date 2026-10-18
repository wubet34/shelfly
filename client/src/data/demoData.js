const seedProducts = [
  { id: 1, name: 'USB-C Fast Charger 25W', sku: 'CHG-001', category: 'Chargers', cost: 420, price: 650, stock: 34, threshold: 10, icon: 'ϟ', tone: 'blue' },
  { id: 2, name: 'Wireless Earbuds Pro', sku: 'AUD-014', category: 'Audio', cost: 1100, price: 1650, stock: 8, threshold: 10, icon: '◖', tone: 'violet' },
  { id: 3, name: 'Braided USB-C Cable · 2m', sku: 'CBL-008', category: 'Cables', cost: 180, price: 350, stock: 52, threshold: 15, icon: '⌁', tone: 'orange' },
  { id: 4, name: 'MagSafe Power Bank 10K', sku: 'PWB-003', category: 'Power banks', cost: 1450, price: 2200, stock: 6, threshold: 8, icon: '▰', tone: 'green' },
  { id: 5, name: 'Tempered Glass · iPhone 15', sku: 'SCR-022', category: 'Protection', cost: 120, price: 280, stock: 41, threshold: 12, icon: '▱', tone: 'pink' },
  { id: 6, name: 'Bluetooth Speaker Mini', sku: 'AUD-009', category: 'Audio', cost: 850, price: 1350, stock: 19, threshold: 8, icon: '◉', tone: 'cyan' },
]
const initialSales = [
  { id: 'SL-1048', customer: 'Walk-in customer', time: '10:42 AM', date: '2026-10-18', items: 3, total: 3150, method: 'Cash', status: 'Completed' },
  { id: 'SL-1047', customer: 'Mekdes Tadesse', time: '10:18 AM', date: '2026-10-18', items: 2, total: 1930, method: 'Telebirr', status: 'Completed' },
  { id: 'SL-1046', customer: 'Walk-in customer', time: '9:56 AM', date: '2026-10-18', items: 1, total: 1350, method: 'Cash', status: 'Completed' },
  { id: 'SL-1045', customer: 'Abel Getachew', time: '9:21 AM', date: '2026-10-18', items: 4, total: 2480, method: 'Bank transfer', status: 'Completed' },
]
const initialCustomers = [{ name: 'Mekdes Tadesse', phone: '+251 91 234 5678', visits: 12, balance: 0 }, { name: 'Abel Getachew', phone: '+251 92 345 6789', visits: 8, balance: 1250 }, { name: 'Hana Alemu', phone: '+251 93 456 7890', visits: 5, balance: 0 }]
const nav = [
  { title: 'WORKSPACE', items: [['Overview', '▦'], ['Sales', '↗'], ['Products & Inventory', '▤'], ['Customers', '♙']] },
  { title: 'MANAGE', items: [['Expenses', '↘'], ['Reports', '◷']] },
]
export { seedProducts, initialSales, initialCustomers, nav }
