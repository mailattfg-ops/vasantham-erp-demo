import { useToastStore } from '../../store/toastStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
}

const COLORS = {
  success: { bg:'var(--success-bg)', color:'var(--success)', border:'rgba(30,107,69,.2)' },
  error:   { bg:'var(--danger-bg)',  color:'var(--danger)',  border:'rgba(185,28,28,.2)' },
  info:    { bg:'var(--info-bg)',    color:'var(--info)',    border:'rgba(30,64,175,.2)' },
}

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div style={{
      position:'fixed', bottom:32, right:20, zIndex:9999,
      display:'flex', flexDirection:'column', gap:8,
      pointerEvents:'none'
    }} className="no-print">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || CheckCircle
        const c = COLORS[t.type] || COLORS.success
        return (
          <div key={t.id} style={{
            display:'flex', alignItems:'center', gap:10,
            background:c.bg, color:c.color,
            border:`1px solid ${c.border}`,
            borderRadius:6, padding:'9px 14px',
            boxShadow:'var(--shadow-md)',
            fontSize:13, fontWeight:500, minWidth:260,
            pointerEvents:'all',
            animation:'slideIn .2s ease'
          }}>
            <Icon size={15} style={{ flexShrink:0 }} />
            <span style={{ flex:1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ color:'inherit', opacity:.6, padding:2 }}>
              <X size={12} />
            </button>
          </div>
        )
      })}
      <style>{`@keyframes slideIn { from { transform:translateX(20px); opacity:0 } to { transform:translateX(0); opacity:1 } }`}</style>
    </div>
  )
}
