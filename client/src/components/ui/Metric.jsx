import { t } from '../../i18n.js'

export default function Metric({ label, value, icon, tone, detail, alert, onClick }) { return <button className={`panel metric-card ${onClick ? 'clickable' : ''}`} onClick={onClick}><div className="metric-top"><span>{t(label)}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><div className="metric-value">{value}</div><div className={`metric-detail ${alert ? 'detail-alert' : ''}`}>{alert && <span>↗</span>}{t(detail)}</div></button> }
