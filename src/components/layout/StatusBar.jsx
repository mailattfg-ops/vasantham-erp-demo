import { useState, useEffect } from 'react'
import { COMPANY } from '../../data/seed'

export function StatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const dateStr = time.toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' })
  const timeStr = time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })

  return (
    <div style={{
      height: 22, background: 'var(--menubar-bg)',
      display: 'flex', alignItems: 'center', padding: '0 16px',
      gap: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)',
      flexShrink: 0
    }} className="no-print">
      <span>Financial Period: <span style={{ color:'rgba(255,255,255,0.55)' }}>{COMPANY.financialYear}</span></span>
      <Divider />
      <span>Admin User</span>
      <Divider />
      <span style={{ color:'rgba(255,255,255,0.55)' }}>{dateStr}</span>
      <Divider />
      <span style={{ color:'rgba(255,255,255,0.55)' }}>{timeStr}</span>
    </div>
  )
}

function Divider() {
  return <span style={{ margin:'0 14px', opacity:.35 }}>|</span>
}
