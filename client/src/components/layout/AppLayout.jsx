import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/Icon.jsx'
import ThemeIcon from '../ui/ThemeIcon.jsx'
import ProfileDialog from '../../features/auth/ProfileDialog.jsx'
import { t } from '../../i18n.js'

const amharicLabels = {
  Workspace: 'የሥራ ቦታ', Overview: 'አጠቃላይ እይታ', Sales: 'ሽያጮች',
  'Products & Inventory': 'ምርቶች እና ክምችት', Customers: 'ደንበኞች',
  Expenses: 'ወጪዎች', Reports: 'ሪፖርቶች', 'Employees & Permissions': 'ሠራተኞች እና ፈቃዶች',
  Settings: 'ቅንብሮች', BUSINESS: 'ንግድ', WORKSPACE: 'የሥራ ቦታ', MANAGE: 'አስተዳደር',
  'Products & inventory': 'ምርቶች እና ክምችት', 'Employees & permissions': 'ሠራተኞች እና ፈቃዶች',
}

export default function AppLayout({ session, business, page, pageTitle, nav, mobileNav, setMobileNav, setPage, lowStock, initials, query, setQuery, onLogout, onChangePassword, isOwner, theme, onToggleTheme, language, onToggleLanguage, children }) {
  const translate = (text) => language === 'am' ? amharicLabels[text] || text : text
  const searchInput = useRef(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handleShortcuts = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
      if (event.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [])

  const navigate = (destination) => {
    setPage(destination)
    setMobileNav(false)
    setHelpOpen(false)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => navigate(isOwner ? 'Overview' : 'Products & Inventory')}><span className="brand-mark"><Icon>◈</Icon></span><span className="brand-name">shelfly<span className="brand-dot">.</span><small>{t('BUSINESS MANAGER')}</small></span></button>
      <div className="workspace-switch"><span className="store-avatar">{business.name?.[0] || 'B'}</span><span className="workspace-copy"><b>{business.name}</b><small>{t(isOwner ? 'Owner workspace' : 'Employee workspace')}</small></span></div>
      <nav className="sidebar-nav">{nav.map((group) => <div className="nav-group" key={group.title}><span className="nav-label">{translate(group.title)}</span>{group.items.filter(([label]) => isOwner || ['Sales', 'Products & Inventory'].includes(label)).map(([label, icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => navigate(label)}><Icon>{icon}</Icon><span>{translate(label)}</span>{label === 'Products & Inventory' && lowStock.length > 0 && <span className="nav-count">{lowStock.length}</span>}</button>)}</div>)}{isOwner && <div className="nav-group"><span className="nav-label">{translate('BUSINESS')}</span>{[['Employees & Permissions', '♧'], ['Settings', '⚙']].map(([label, icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => navigate(label)}><Icon>{icon}</Icon><span>{translate(label)}</span></button>)}</div>}</nav>
      <div className="sidebar-bottom"><button className="help-link" onClick={() => setHelpOpen(true)}><Icon>ⓘ</Icon>{language === 'am' ? 'እገዛ እና አቋራጮች' : 'Help & shortcuts'}<span>?</span></button><button type="button" className="profile" onClick={() => setProfileOpen(true)} aria-label={language === 'am' ? 'መገለጫዎን ይክፈቱ' : 'Open your profile'}><span className="profile-avatar">{initials}</span><span className="profile-info"><b>{session.user.name}</b><small>{isOwner ? (language === 'am' ? 'የንግድ ባለቤት' : 'Business owner') : (language === 'am' ? 'ሠራተኛ' : 'Employee')} · {language === 'am' ? 'መገለጫ' : 'Profile'}</small></span><Icon>›</Icon></button></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label={t("Close navigation")} onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label={language === 'am' ? 'ምናሌን ክፈት' : 'Open navigation'} onClick={() => setMobileNav(true)}><Icon>☰</Icon></button><div className="breadcrumbs"><span>{translate('Workspace')}</span><Icon>›</Icon><b>{translate(pageTitle)}</b></div><div className="top-actions"><label className="global-search"><Icon>⌕</Icon><input ref={searchInput} aria-label={language === 'am' ? 'ዕቃዎችን ፈልግ' : 'Search inventory'} placeholder={language === 'am' ? 'ዕቃዎችን ፈልግ…' : 'Search inventory...'} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate('Products & Inventory') }} /><kbd>⌘ K</kbd></label><button type="button" className="language-toggle" onClick={onToggleLanguage} aria-label={language === 'am' ? 'Switch language to English' : 'ቋንቋን ወደ አማርኛ ቀይር'} title={language === 'am' ? 'English' : 'አማርኛ'}>{language === 'am' ? 'EN' : 'አማ'}</button><button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label={`${t('Switch to')} ${t(theme === 'dark' ? 'light' : 'dark')} ${t('mode')}`} title={`${t('Switch to')} ${t(theme === 'dark' ? 'light' : 'dark')} ${t('mode')}`}><ThemeIcon theme={theme}/><span>{t(theme === 'dark' ? 'Light' : 'Dark')}</span></button><button type="button" className="logout-button" onClick={onLogout} aria-label={language === 'am' ? 'ውጣ' : 'Sign out'}><Icon>↪</Icon><span>{t('Sign out')}</span></button></div></header>
      <div className="page-content">{children}</div>
    </main>
    {helpOpen && <div className="help-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false) }}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title"><div className="modal-head"><div><h2 id="help-title">{language === 'am' ? 'እገዛ እና አቋራጮች' : 'Help & shortcuts'}</h2><p>{language === 'am' ? 'ለሥራ ቦታዎ ፈጣን መመሪያዎች።' : 'Quick guides for your workspace.'}</p></div><button type="button" className="icon-button" aria-label={language === 'am' ? 'እገዛን ዝጋ' : 'Close help'} onClick={() => setHelpOpen(false)}>×</button></div><div className="help-content"><h3>{language === 'am' ? 'የቁልፍ ሰሌዳ አቋራጭ' : 'Keyboard shortcut'}</h3><p>{language === 'am' ? <><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> የዕቃ ፍለጋን ይከፍታል። <kbd>Enter</kbd> በመጫን ወደ ዕቃዎች ይሂዱ።</> : <><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> focuses inventory search. Press <kbd>Enter</kbd> to open inventory results.</>}</p><h3>{language === 'am' ? 'የተለመዱ ተግባራት' : 'Common tasks'}</h3><div className="help-actions"><button onClick={() => navigate('Products & Inventory')}>{language === 'am' ? 'ዕቃዎችን ፈልግ እና አስተዳድር' : 'Search and manage inventory'}</button><button onClick={() => navigate('Sales')}>{language === 'am' ? 'ሽያጮችን እይ እና ሽያጭ መዝግብ' : 'View sales and record checkout'}</button>{isOwner && <button onClick={() => navigate('Customers')}>{language === 'am' ? 'ደንበኞችን ፈልግ እና አስተዳድር' : 'Search and manage customers'}</button>}{isOwner && <button onClick={() => navigate('Settings')}>{language === 'am' ? 'የንግድ ቅንብሮችን አዘምን' : 'Update business settings'}</button>}</div><p className="help-note">{language === 'am' ? 'ከሽያጭ ወይም ከቀሪ ዕዳ ጋር የተያያዙ የደንበኛ መዝገቦች መሰረዝ አይቻልም።' : 'Customer records with sales or unpaid balances are protected from deletion.'}</p></div></section></div>}
    {profileOpen && <ProfileDialog session={session} onClose={() => setProfileOpen(false)} onChangePassword={onChangePassword} />}
  </div>
}
