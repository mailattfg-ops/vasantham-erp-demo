const STATUS_STYLES = {
  paid:      { bg:'var(--success-bg)', color:'var(--success)',  label:'Paid' },
  active:    { bg:'var(--success-bg)', color:'var(--success)',  label:'Active' },
  received:  { bg:'var(--success-bg)', color:'var(--success)',  label:'Received' },
  normal:    { bg:'var(--success-bg)', color:'var(--success)',  label:'In Stock' },
  pending:   { bg:'var(--warning-bg)', color:'var(--warning)',  label:'Pending' },
  on_leave:  { bg:'var(--warning-bg)', color:'var(--warning)',  label:'On Leave' },
  low:       { bg:'var(--warning-bg)', color:'var(--warning)',  label:'Low Stock' },
  overdue:   { bg:'var(--danger-bg)',  color:'var(--danger)',   label:'Overdue' },
  critical:  { bg:'var(--danger-bg)',  color:'var(--danger)',   label:'Critical' },
  cancelled: { bg:'var(--danger-bg)',  color:'var(--danger)',   label:'Cancelled' },
  out:       { bg:'var(--danger-bg)',  color:'var(--danger)',   label:'Out of Stock' },
  wholesale: { bg:'var(--info-bg)',    color:'var(--info)',     label:'Wholesale' },
  retail:    { bg:'var(--gold-50)',    color:'var(--gold-700)', label:'Retail' },
  pos:       { bg:'var(--gold-50)',    color:'var(--gold-700)', label:'POS' },
  walkin:    { bg:'var(--surface-2)',  color:'var(--ink-400)',  label:'Walk-in' },
  admin:     { bg:'var(--info-bg)',    color:'var(--info)',     label:'Admin' },
  staff:     { bg:'var(--success-bg)', color:'var(--success)', label:'Staff' },
}

export function StatusBadge({ status, label: customLabel }) {
  const style = STATUS_STYLES[status] || { bg:'var(--surface-2)', color:'var(--ink-400)', label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 3,
      fontSize: 11, fontWeight: 600,
      background: style.bg, color: style.color,
      letterSpacing: '.03em', textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }}>
      {customLabel || style.label}
    </span>
  )
}
