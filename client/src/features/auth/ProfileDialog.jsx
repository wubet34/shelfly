import { useState } from 'react'
import { t } from '../../i18n.js'

export default function ProfileDialog({ session, onClose, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) { setError(t('The new passwords do not match.')); return }
    setBusy(true)
    try { await onChangePassword(currentPassword, newPassword); onClose() }
    catch (cause) { setError(cause.message) }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal form-modal" onSubmit={submit}>
    <div className="modal-head"><div><h2>{t('Your profile')}</h2><p>{t('Manage your sign-in details.')}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label={t('Close profile')}>×</button></div>
    <div className="profile-summary"><span className="profile-avatar">{session.user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><b>{session.user.name}</b><small>{session.user.email} · {t(session.user.role === 'OWNER' ? 'Owner' : 'Employee')}</small></div></div>
    <h3 className="profile-section-title">{t('Change password')}</h3>
    {session.demo ? <p className="field-help">{t('Password changes are unavailable in the demo workspace.')}</p> : <>
      {error && <p className="form-error" role="alert">{error}</p>}
      <label>{t('Current password')}<input autoComplete="current-password" type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
      <label>{t('New password')}<input autoComplete="new-password" type="password" minLength="12" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><small className="field-help">{t('Use at least 12 characters.')}</small></label>
      <label>{t('Confirm new password')}<input autoComplete="new-password" type="password" minLength="12" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
    </>}
    <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>{t('Close')}</button>{!session.demo && <button className="button primary" disabled={busy}>{busy ? t('Updating…') : t('Update password')}</button>}</div>
  </form></div>
}
