import { useState } from 'react'
import { t } from '../../i18n.js'

export default function SettingsPanel({ business, onSave, notify }) {
  const [form, setForm] = useState(business)

  return <form className="panel settings-panel" onSubmit={async (event) => {
    event.preventDefault()
    try { await onSave(form) } catch (error) { notify(error.message) }
  }}>
    <div><h3>{t('Business profile')}</h3><p>{t('Update how your business appears in the workspace.')}</p></div>
    <label>{t('Business name')}<input required value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
    <label>{t('Default currency')}<input aria-label={t('Default currency')} value={`${form.currency || 'ETB'} (${t('Ethiopian Birr')})`} readOnly /></label>
    <label>{t('Timezone')}<input required value={form.timezone || 'Africa/Addis_Ababa'} onChange={(event) => setForm({ ...form, timezone: event.target.value })} /></label>
    <button className="button primary">{t('Save changes')}</button>
  </form>
}
