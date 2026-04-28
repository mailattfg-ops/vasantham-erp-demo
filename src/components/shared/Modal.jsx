import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ title, onClose, children, width = 640, toolbar }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.55)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(2px)'
    }} onClick={e => { if(e.target===e.currentTarget) onClose?.() }}>
      <div style={{
        width, maxWidth:'calc(100vw - 40px)', maxHeight:'calc(100vh - 80px)',
        background:'var(--surface)', borderRadius:8,
        boxShadow:'var(--shadow-lg)', display:'flex', flexDirection:'column',
        overflow:'hidden'
      }}>
        {/* Title bar */}
        <div style={{
          background:'var(--sidebar-bg)', padding:'0 16px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          height:44, flexShrink:0
        }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--gold)' }}>
            {title}
          </span>
          <button onClick={onClose} style={{ color:'rgba(255,255,255,0.45)', padding:4 }}>
            <X size={16} />
          </button>
        </div>
        {/* Optional toolbar */}
        {toolbar && (
          <div style={{
            background:'var(--toolbar-bg)', borderBottom:'1px solid var(--border)',
            padding:'6px 12px', display:'flex', gap:8, flexShrink:0
          }}>
            {toolbar}
          </div>
        )}
        {/* Body */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
