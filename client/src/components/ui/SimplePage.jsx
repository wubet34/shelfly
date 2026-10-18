import { Icon } from '../../components/ui/Icon.jsx'
import { t } from '../../i18n.js'

export default function SimplePage({ title, subtitle, icon, action, onAction, children }) { return <><div className="page-heading"><div><div className="eyebrow greeting">{t('BUSINESS')} <span>·</span> DESSIE ELECTRONICS</div><h1>{t(title)}</h1><p>{t(subtitle)}</p></div>{action&&<button className="button primary" onClick={onAction}><Icon>{icon}</Icon>{t(action)}</button>}</div>{children}</> }
