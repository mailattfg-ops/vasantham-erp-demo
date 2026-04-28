import { useState, useEffect } from 'react'

export function PageSkeleton() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 300)
    return () => clearTimeout(t)
  }, [])
  if (done) return null
  return (
    <div style={{
      position:'absolute', inset:0, background:'var(--bg)', zIndex:50,
      padding:24, display:'flex', flexDirection:'column', gap:12
    }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          height:32, background:'var(--border)', borderRadius:4,
          opacity:1-i*0.1, animation:'shimmer 1.2s infinite'
        }} />
      ))}
      <style>{`@keyframes shimmer {
        0%,100% { opacity:.4 } 50% { opacity:.7 }
      }`}</style>
    </div>
  )
}
