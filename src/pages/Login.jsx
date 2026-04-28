import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VasanthamLogo } from '../components/brand/VasanthamLogo'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@vasantham.in')
  const [password, setPassword] = useState('admin123')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--menubar-bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      backgroundImage:'radial-gradient(circle at 20% 80%, rgba(201,149,42,0.08) 0%, transparent 60%)'
    }}>
      <div style={{
        background:'var(--surface)', borderRadius:12, padding:'40px 40px 36px',
        width:400, boxShadow:'0 20px 60px rgba(0,0,0,.4)'
      }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
          <VasanthamLogo />
        </div>

        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--ink)', marginBottom:4 }}>
            Welcome back
          </div>
          <div style={{ fontSize:13, color:'var(--ink-400)' }}>
            Sign in to your ERP account
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--ink-600)', display:'block', marginBottom:5 }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@vasantham.in"
              style={{ width:'100%', height:38, padding:'0 12px', fontSize:13 }}
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--ink-600)', display:'block', marginBottom:5 }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width:'100%', height:38, padding:'0 36px 0 12px', fontSize:13 }}
              />
              <button type="button" onClick={()=>setShowPw(v=>!v)} style={{
                position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                color:'var(--ink-400)'
              }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background:'var(--danger-bg)', color:'var(--danger)',
              padding:'8px 12px', borderRadius:4, fontSize:12, marginBottom:14
            }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width:'100%', height:42, background:'var(--gold)',
              color:'#fff', border:'none', borderRadius:6,
              fontSize:14, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              opacity: loading ? .8 : 1
            }}
          >
            {loading ? <><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop:20, textAlign:'center', fontSize:11, color:'var(--ink-400)' }}>
          Demo: admin@vasantham.in / admin123
        </div>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )
}
