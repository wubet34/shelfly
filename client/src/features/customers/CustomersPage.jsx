import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { birr } from '../../utils/currency.js'
import { Icon } from '../../components/ui/Icon.jsx'
import { t } from '../../i18n.js'

export default function CustomersPage({ customers, setModal, notify, removeCustomer, canManage = false }) {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuRef = useRef(null)
  const needle = search.trim().toLocaleLowerCase()
  const phoneNeedle = search.replace(/\D/g, '')
  const visible = customers.filter((customer) => {
    const nameMatches = customer.name.toLocaleLowerCase().includes(needle)
    const phone = customer.phone.toLocaleLowerCase()
    const phoneMatches = phone.includes(needle) || (phoneNeedle && phone.replace(/\D/g, '').includes(phoneNeedle))
    return nameMatches || phoneMatches
  })
  const activeCustomer = customers.find((customer) => (customer.id || customer.phone) === openMenu)

  useEffect(() => {
    if (!openMenu) return undefined
    const closeOnOutsideClick = (event) => {
      if (menuRef.current?.contains(event.target) || event.target.closest?.('.customer-menu-trigger')) return
      setOpenMenu(null)
    }
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpenMenu(null) }
    const closeOnScroll = () => setOpenMenu(null)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [openMenu])

  const toggleMenu = (event, customer) => {
    const key = customer.id || customer.phone
    if (openMenu === key) { setOpenMenu(null); return }
    const bounds = event.currentTarget.getBoundingClientRect()
    const menuHeight = 78
    setMenuPosition({
      top: bounds.bottom + menuHeight + 8 <= window.innerHeight ? bounds.bottom + 4 : Math.max(8, bounds.top - menuHeight - 4),
      left: Math.min(window.innerWidth - 148, Math.max(8, bounds.right - 140)),
    })
    setOpenMenu(key)
  }

  const deleteCustomer = async (customer) => {
    const confirmed = window.confirm(`${t('Delete')} ${customer.name}? ${t('Customers linked to sales or with an outstanding balance cannot be deleted.')}`)
    if (!confirmed) return
    try {
      await removeCustomer(customer)
      setOpenMenu(null)
      notify('Customer deleted')
    } catch (error) {
      notify(error.message)
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <div className="eyebrow greeting">{t('YOUR COMMUNITY')} <span>·</span> {customers.length} {t('CUSTOMERS')}</div>
        <h1>{t('Customers')}</h1>
        <p>{t('Build lasting relationships with your regulars.')}</p>
      </div>
      {canManage && <button className="button primary" onClick={() => setModal({ type: 'customer' })}><Icon>＋</Icon>{t('Add customer')}</button>}
    </div>

    <div className="sales-summary">
      <div className="panel"><span>{t('Total customers')}</span><b>{customers.length}</b></div>
      <div className="panel"><span>{t('Returning customers')}</span><b>{customers.filter((customer) => customer.visits > 1).length}</b></div>
      <div className="panel"><span>{t('Outstanding balances')}</span><b>{birr(customers.reduce((total, customer) => total + Number(customer.balance || 0), 0))}</b></div>
    </div>

    <section className="panel full-sales">
      <div className="panel-head">
        <div><h2>{t('Customer directory')}</h2><p>{t('Your customer relationships in one place')}</p></div>
        <label className="table-search customer-search">
          <Icon>⌕</Icon>
          <input type="search" aria-label={t('Search customers by name or phone')} value={search} placeholder={t('Search name or phone...')} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('CUSTOMER')}</th><th>{t('PHONE')}</th><th>{t('VISITS')}</th><th>{t('OUTSTANDING')}</th>{canManage && <th><span className="visually-hidden">{t('Actions')}</span></th>}</tr></thead>
          <tbody>
            {visible.map((customer) => <tr key={customer.id || customer.phone}>
              <td><b>{customer.name}</b></td>
              <td>{customer.phone}</td>
              <td>{customer.visits} {t('visits')}</td>
              <td className={Number(customer.balance) ? 'text-warning' : ''}><b>{birr(customer.balance)}</b></td>
              {canManage && <td className="customer-action-cell">
                <button type="button" className="row-menu customer-menu-trigger" aria-label={`${t('Actions')} ${customer.name}`} aria-haspopup="menu" aria-expanded={openMenu === (customer.id || customer.phone)} onClick={(event) => toggleMenu(event, customer)}>···</button>
              </td>}
            </tr>)}
            {!visible.length && <tr><td className="table-empty" colSpan={canManage ? 5 : 4}>{t(customers.length ? 'No customers match your search.' : 'No customers yet.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
    {activeCustomer && menuPosition && createPortal(<div className="customer-action-menu" role="menu" ref={menuRef} style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, right: 'auto', bottom: 'auto' }}>
      <button type="button" role="menuitem" onClick={() => { setModal({ type: 'edit-customer', customer: activeCustomer }); setOpenMenu(null) }}>{t('Edit')}</button>
      <button type="button" role="menuitem" className="customer-delete-action" onClick={() => deleteCustomer(activeCustomer)}>{t('Delete')}</button>
    </div>, document.body)}
  </>
}
