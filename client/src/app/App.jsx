import { useEffect, useState } from 'react'
import '../App.css'
import '../dark.css'
import { verifySession, signIn, signOut } from '../features/auth/authService.js'
import { Icon } from '../components/ui/Icon.jsx'
import ThemeIcon from '../components/ui/ThemeIcon.jsx'
import Workspace from './Workspace.jsx'
import { t } from '../i18n.js'

function App() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem('shelfly-language') === 'am' ? 'am' : 'en' } catch { return 'en' } })
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('shelfly-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('shelfly-theme', theme) } catch { /* Theme still applies for this session. */ }
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = language === 'am' ? 'am' : 'en'
    try { localStorage.setItem('shelfly-language', language) } catch { /* Language still applies for this session. */ }
  }, [language])
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  const toggleLanguage = () => {
    const next = language === 'am' ? 'en' : 'am'
    try { localStorage.setItem('shelfly-language', next) } catch { /* Language still applies for this session. */ }
    document.documentElement.lang = next
    setLanguage(next)
  }
  useEffect(() => { verifySession().then(setSession).catch(() => setSession(null)).finally(() => setChecking(false)) }, [])
  if (checking) return <div className="auth-screen"><div className="auth-card loading-card">{t('Loading your workspace…')}</div></div>
  if (!session) return <LoginScreen theme={theme} onToggleTheme={toggleTheme} language={language} onToggleLanguage={toggleLanguage} onLogin={setSession} onDemo={() => setSession({ user: { id: 'demo', name: 'Biruk Tadesse', role: 'OWNER', businessName: 'Dessie Electronics', permissions: {} }, csrfToken: '', demo: true })} />
  return <Workspace session={session} theme={theme} onToggleTheme={toggleTheme} language={language} onToggleLanguage={toggleLanguage} onLogout={() => { signOut(session.csrfToken).catch(() => {}); setSession(null) }} />
}

function LoginScreen({ onLogin, onDemo, theme, onToggleTheme, language, onToggleLanguage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { onLogin(await signIn(email, password)) } catch (e) { setError(e.message === 'Failed to fetch' ? 'Can’t reach the server. Start the API or use the development demo.' : e.message) } finally { setBusy(false) } }
  return <div className="auth-screen"><div className="auth-top-toggles"><button type="button" className="language-toggle" onClick={onToggleLanguage} aria-label={language === 'am' ? 'Switch language to English' : 'ቋንቋን ወደ አማርኛ ቀይር'}>{language === 'am' ? 'EN' : 'አማ'}</button><button type="button" className="auth-theme-toggle" onClick={onToggleTheme} aria-label={`${t('Switch to')} ${t(theme === 'dark' ? 'light' : 'dark')} ${t('mode')}`}><ThemeIcon theme={theme}/><span>{t(theme === 'dark' ? 'Light mode' : 'Dark mode')}</span></button></div><form className="auth-card" onSubmit={submit}><div className="auth-brand"><span className="brand-mark"><Icon>◈</Icon></span><span className="brand-name">shelfly<span className="brand-dot">.</span><small>{t('BUSINESS MANAGER')}</small></span></div><h1>{t('Welcome back')}</h1><p>{t('Sign in to manage your business.')}</p>{error && <div className="auth-error" role="alert">{t(error)}</div>}<label>{t('Email address')}<input autoComplete="username" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></label><label>{t('Password')}<input autoComplete="current-password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} /></label><button className="button primary auth-submit" disabled={busy}>{busy?t('Signing in…'):t('Sign in')}</button>{import.meta.env.DEV && <><div className="auth-divider"><span>{t('DEVELOPMENT')}</span></div><button type="button" className="button secondary auth-submit" onClick={onDemo}>{t('Open demo workspace')}</button></>}</form></div>
}

export default App
