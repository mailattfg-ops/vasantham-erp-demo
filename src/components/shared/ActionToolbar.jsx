import { Plus, Pencil, Trash2, Printer, Download, Save, RefreshCw } from 'lucide-react'

const BTN_DEFS = {
  save:    { label:'Save',   icon:Save,       shortcut:'Ctrl+S', primary:true },
  new:     { label:'New',    icon:Plus,        shortcut:'Ctrl+N' },
  edit:    { label:'Edit',   icon:Pencil,      shortcut:'Ctrl+E' },
  delete:  { label:'Delete', icon:Trash2,      shortcut:'Del',   danger:true },
  print:   { label:'Print',  icon:Printer,     shortcut:'Ctrl+P' },
  export:  { label:'Export', icon:Download,    shortcut:'Ctrl+X' },
  refresh: { label:'Refresh',icon:RefreshCw,   shortcut:'F5' },
}

export function ActionToolbar({ buttons = [], onAction, children, style: extraStyle }) {
  return (
    <div style={{
      height: 42, background: 'var(--toolbar-bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 2,
      padding: '0 12px', flexShrink: 0,
      ...extraStyle
    }} className="no-print">
      {buttons.map((btn, idx) => {
        const def = typeof btn === 'string' ? BTN_DEFS[btn] : btn
        if (!def) return null
        const Icon = def.icon
        return (
          <div key={idx} style={{ display:'flex', alignItems:'center' }}>
            {idx > 0 && (
              <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
            )}
            <button
              onClick={() => onAction?.(def.label.toLowerCase())}
              title={def.shortcut ? `${def.label} (${def.shortcut})` : def.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 4,
                background: def.primary ? 'var(--gold)' : 'transparent',
                color: def.primary ? '#fff' : def.danger ? 'var(--danger)' : 'var(--ink-600)',
                fontSize: 12, fontWeight: def.primary ? 600 : 500,
                border: def.primary ? 'none' : '1px solid transparent',
                cursor: 'pointer', transition: 'all .12s'
              }}
              onMouseEnter={e => {
                if(!def.primary) {
                  e.currentTarget.style.background = def.danger ? 'var(--danger-bg)' : 'var(--border)'
                }
              }}
              onMouseLeave={e => {
                if(!def.primary) e.currentTarget.style.background = 'transparent'
              }}
            >
              {Icon && <Icon size={13} />}
              <span>{def.label}</span>
            </button>
          </div>
        )
      })}
      {children && (
        <>
          <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
          {children}
        </>
      )}
    </div>
  )
}
