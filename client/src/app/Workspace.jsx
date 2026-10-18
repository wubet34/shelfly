import { useEffect, useMemo, useRef, useState } from 'react'
import { listProducts, saveProduct as saveProductRequest, archiveProduct as archiveProductRequest } from '../features/products/productService.js'
import { listSales, submitSale } from '../features/sales/salesService.js'
import { listCustomers, lookupCustomers, createCustomer, updateCustomer, deleteCustomer as deleteCustomerRequest } from '../features/customers/customerService.js'
import { listExpenses, createExpense } from '../features/expenses/expenseService.js'
import { listEmployees, createEmployee, setEmployeeActive } from '../features/employees/employeeService.js'
import { getSettings, updateSettings } from '../features/settings/settingsService.js'
import { getDashboard } from '../features/dashboard/dashboardService.js'
import { birr } from '../utils/currency.js'
import { seedProducts, initialSales, initialCustomers, nav } from '../data/demoData.js'
import Dashboard from '../features/dashboard/Dashboard.jsx'
import ProductsPage from '../features/products/ProductsPage.jsx'
import SalesPage from '../features/sales/SalesPage.jsx'
import CustomersPage from '../features/customers/CustomersPage.jsx'
import SimplePage from '../components/ui/SimplePage.jsx'
import ExpensesPanel from '../features/expenses/ExpensesPanel.jsx'
import EmployeesPanel from '../features/employees/EmployeesPanel.jsx'
import SettingsPanel from '../features/settings/SettingsPanel.jsx'
import Modal from '../components/ui/Modal.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import { downloadCsv } from '../utils/exportCsv.js'
import { changePassword as changePasswordRequest } from '../features/auth/authService.js'
import { t } from '../i18n.js'

const load = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback } }

export default function Workspace({ session, onLogout, theme, onToggleTheme, language, onToggleLanguage }) {
  const demo = Boolean(session.demo)
  const [page, setPage] = useState(session.user.role === 'OWNER' ? 'Overview' : 'Products & Inventory')
  const [products, setProducts] = useState(() => demo ? load('distro-products', seedProducts) : [])
  const [sales, setSales] = useState(() => demo ? load('distro-sales', initialSales) : [])
  const [customers, setCustomers] = useState(() => demo ? load('distro-customers', initialCustomers) : [])
  const [expenses, setExpenses] = useState([])
  const [employees, setEmployees] = useState([])
  const [business, setBusiness] = useState({ name: session.user.businessName || 'Dessie Electronics', currency: 'ETB', timezone: 'Africa/Addis_Ababa' })
  const [dashboardData, setDashboardData] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const isOwner = session.user.role === 'OWNER'
  const initials = session.user.name.split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase()
  const [period, setPeriod] = useState('Last 7 days')
  const [cart, setCart] = useState([])
  const saleIdempotencyKey = useRef(null)
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const saveProducts = (next) => { setProducts(next); if (demo) localStorage.setItem('distro-products', JSON.stringify(next)) }
  const saveSales = (next) => { setSales(next); if (demo) localStorage.setItem('distro-sales', JSON.stringify(next)) }
  const saveCustomers = (next) => { setCustomers(next); if (demo) localStorage.setItem('distro-customers', JSON.stringify(next)) }
  const refreshData = async () => {
    const [productData, saleData] = await Promise.all([listProducts(), listSales()])
    setProducts(productData.products.map((p)=>({...p,cost:Number(p.cost),price:Number(p.price),stock:Number(p.stock),threshold:Number(p.threshold),tone:'blue',icon:'▣'})))
    setSales(saleData.sales.map((s)=>({id:`SL-${s.id}`,customer:s.customer||'Walk-in customer',time:new Date(s.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),date:new Date(s.created_at).toISOString().slice(0,10),items:s.item_count,total:Number(s.total),method:s.payment_method,status:'Completed'})))
    if(isOwner){const [customerData, expenseData, employeeData, dashboard, settingsData] = await Promise.all([listCustomers(),listExpenses(),listEmployees(),getDashboard(),getSettings()]);setCustomers(customerData.customers.map(c=>({...c,balance:Number(c.balance),visits:Number(c.visits)})));setExpenses(expenseData.expenses);setEmployees(employeeData.employees);setDashboardData(dashboard);setBusiness(settingsData.settings)}else {const customerData=await lookupCustomers();setCustomers(customerData.customers.map(c=>({...c,balance:0,visits:0})))}
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{if(demo)return;const timer=window.setTimeout(()=>refreshData().catch((e)=>notify(e.message)),0);return()=>window.clearTimeout(timer)},[demo])
  const persistProduct = async (product, existingId) => {
    if (demo) { const next = existingId ? products.map((p)=>p.id===existingId?product:p) : [product,...products]; saveProducts(next); return }
    await saveProductRequest({name:product.name,sku:product.sku,category:product.category,barcode:product.barcode||null,supplier:product.supplier||null,cost:Number(product.cost),price:Number(product.price),stock:Number(product.stock),threshold:Number(product.threshold),active:true},existingId,session.csrfToken);await refreshData()
  }
  const archiveProduct = async (product) => {
    if (demo) { saveProducts(products.filter((item) => item.id !== product.id)); return }
    await archiveProductRequest(product, session.csrfToken)
    await refreshData()
  }
  const persistCustomer = async (customer, existingId, originalPhone) => {
    if(demo){saveCustomers(originalPhone ? customers.map((item) => item.phone === originalPhone ? { ...item, ...customer } : item) : [customer,...customers]);return}
    if(existingId) await updateCustomer(existingId,{name:customer.name,phone:customer.phone},session.csrfToken)
    else await createCustomer({name:customer.name,phone:customer.phone},session.csrfToken)
    await refreshData()
  }
  const removeCustomer = async (customer) => {
    if (demo) { saveCustomers(customers.filter((item) => item.phone !== customer.phone)); return }
    await deleteCustomerRequest(customer.id, session.csrfToken)
    await refreshData()
  }
  const persistExpense = async (expense) => {
    if(demo){setExpenses([{id:Date.now(),...expense},...expenses]);notify('Expense recorded');return}
    await createExpense({description:expense.description,amount:Number(expense.amount)},session.csrfToken);await refreshData();notify('Expense recorded')
  }
  const persistEmployee = async (employee) => {
    if(demo){setEmployees([{id:Date.now(),...employee,role:'EMPLOYEE',active:true},...employees]);notify('Employee added to the demo workspace');return}
    await createEmployee(employee,session.csrfToken);await refreshData();notify('Employee account created')
  }
  const toggleEmployee = async (employee) => {
    if(demo){setEmployees(employees.map(item=>item.id===employee.id?{...item,active:!item.active}:item));return}
    try{await setEmployeeActive(employee.id,!employee.active,session.csrfToken);await refreshData();notify(employee.active?'Employee disabled':'Employee activated')}catch(error){notify(error.message)}
  }
  const saveBusiness = async (next) => {
    if(!demo) await updateSettings(next,session.csrfToken)
    setBusiness(next);notify('Business settings saved')
  }
  const changePassword = async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword, session.csrfToken)
    notify('Password updated. Other signed-in sessions were signed out.')
  }
  const lowStock = products.filter((p) => p.stock <= p.threshold)
  const todayKey = new Date().toISOString().slice(0, 10)
  const todaySales = sales.filter((sale) => (sale.date || todayKey) === todayKey)
  const todayRevenue = !demo && dashboardData ? Number(dashboardData.today.revenue) : todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const pageTitle = page === 'Products & Inventory' ? 'Products & inventory' : page
  const filteredProducts = useMemo(() => products.filter((p) => (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())) && (category === 'All categories' || p.category === category)), [products, query, category])
  const recordSale = async (paymentMethod = 'CASH', customerId = null) => {
    if (!cart.length) { notify('Add an item to the sale first'); return }
    if(!demo){try{await submitSale({paymentMethod,customerId:customerId?Number(customerId):null,items:cart.map((item)=>({productId:Number(item.id),quantity:item.qty}))},session.csrfToken,saleIdempotencyKey.current);setCart([]);setModal(null);saleIdempotencyKey.current=null;await refreshData();setPage('Sales');notify('Sale recorded successfully')}catch(error){notify(error.message)}return}
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const nextSale = { id: `SL-${1049 + sales.length - initialSales.length}`, customer: 'Walk-in customer', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), date: new Date().toISOString().slice(0, 10), items: cart.reduce((n, item) => n + item.qty, 0), total, method: 'Cash', status: 'Completed' }
    saveSales([nextSale, ...sales])
    saveProducts(products.map((product) => ({ ...product, stock: product.stock - (cart.find((item) => item.id === product.id)?.qty || 0) })))
    setCart([]); setModal(null); setPage('Sales'); notify('Sale recorded successfully')
  }
  const openSale = () => { saleIdempotencyKey.current = crypto.randomUUID(); setCart([]); setModal({ type: 'sale' }) }
  const addToCart = (product) => setCart((current) => { const found = current.find((item) => item.id === product.id); return found ? current.map((item) => item.id === product.id ? { ...item, qty: Math.min(item.qty + 1, product.stock) } : item) : [...current, { ...product, qty: 1 }] })
  const exportReport = () => downloadCsv('business-report.csv', ['Metric', 'Value'], [['Sales today (ETB)', todayRevenue], ['Transactions today', dashboardData?.today?.transactions ?? todaySales.length], ['Products in stock', products.reduce((total, product) => total + product.stock, 0)], ['Inventory value at cost (ETB)', products.reduce((total, product) => total + product.stock * product.cost, 0)], ['Outstanding customer balances (ETB)', customers.reduce((total, customer) => total + Number(customer.balance || 0), 0)]] )
  const pageView = !isOwner ? page === 'Sales' ? <SalesPage sales={sales} openSale={openSale} notify={notify} isOwner={false} /> : <ProductsPage {...{products,filteredProducts,query,setQuery,category,setCategory,setModal,notify,lowStock,canManage:false}} /> : page === 'Overview' ? <Dashboard {...{products,sales,todaySales,lowStock,todayRevenue,dashboardData,customers,userName:session.user.name,setPage,openSale,setModal,period,setPeriod}} /> : page === 'Products & Inventory' ? <ProductsPage {...{products,filteredProducts,query,setQuery,category,setCategory,setModal,notify,lowStock}} /> : page === 'Sales' ? <SalesPage {...{sales,openSale,notify,isOwner}} /> : page === 'Customers' ? <CustomersPage {...{customers,setModal,notify,persistCustomer,removeCustomer,canManage:isOwner}} /> : page === 'Expenses' ? <SimplePage title="Expenses" subtitle="Keep track of the costs that keep your business moving." icon="↘" action="Add expense" onAction={()=>setModal({type:'expense'})}><ExpensesPanel expenses={expenses} setModal={setModal} /></SimplePage> : page === 'Reports' ? <SimplePage title="Reports" subtitle="Understand how your business is performing." icon="◷" action="Export CSV" onAction={exportReport}><div className="report-grid"><div className="panel report-card"><span className="eyebrow">{t('SALES SUMMARY')}</span><strong>{birr(todayRevenue)}</strong><span className="muted">{t('Recorded sales total')}</span></div><div className="panel report-card"><span className="eyebrow">{t('INVENTORY VALUE')}</span><strong>{birr(products.reduce((n,p)=>n+p.stock*p.cost,0))}</strong><span className="muted">{t('At purchase cost')}</span></div></div></SimplePage> : page === 'Employees & Permissions' ? <SimplePage title="Employees & permissions" subtitle="Manage who can access your business workspace." icon="♧" action="Invite employee" onAction={()=>setModal({type:'employee'})}><EmployeesPanel employees={employees} onToggle={toggleEmployee} /></SimplePage> : <SimplePage title="Settings" subtitle="Manage your business profile and preferences." icon="⚙"><SettingsPanel key={`${business.name}-${business.currency}-${business.timezone}`} business={business} onSave={saveBusiness} notify={notify} /></SimplePage>
  return <>
    <AppLayout {...{ session, business, page, pageTitle, nav, mobileNav, setMobileNav, setPage, lowStock, notify, initials, query, setQuery, onLogout, onChangePassword: changePassword, isOwner, theme, onToggleTheme, language, onToggleLanguage }}>{pageView}</AppLayout>
    {toast && <div className="toast"><span>✓</span>{t(toast)}</div>}
    {modal && <Modal key={`${modal.type}-${modal.product?.id ?? modal.customer?.id ?? ''}`} modal={modal} {...{ setModal, products, saveProducts, persistProduct, archiveProduct, customers, saveCustomers, persistCustomer, persistExpense, persistEmployee, addToCart, cart, setCart, recordSale, notify, demo, language }} />}
  </>
}
