import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VasanthamLogo } from '../components/brand/VasanthamLogo'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const VALID_EMAIL    = 'admin@vasantham.com'
const VALID_PASSWORD = 'admin123'

export function Login() {
  const navigate    = useNavigate()
  const login       = useAuthStore(s => s.login)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [shake,    setShake]    = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill all fields'); triggerShake(); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      login()
      navigate('/')
    } else {
      setError('Invalid email or password')
      triggerShake()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--menubar-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Crosshatch SVG background */}
      <svg style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', opacity: 1,
      }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="xhatch" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="28" y2="28" stroke="rgba(201,149,42,0.07)" strokeWidth="0.8"/>
            <line x1="28" y1="0" x2="0" y2="28" stroke="rgba(201,149,42,0.07)" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#xhatch)"/>
      </svg>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(201,149,42,0.07) 0%, transparent 70%)',
      }}/>

      {/* Card */}
      <div
        className={shake ? 'login-shake' : ''}
        style={{
          position: 'relative', zIndex: 1,
          background: '#fff',
          borderRadius: 14,
          padding: '44px 44px 36px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 24px 72px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,149,42,0.12)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <VasanthamLogo />
        </div>

        {/* Headings */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 600,
            color: '#0F1117', lineHeight: 1.15, marginBottom: 6,
          }}>
            Welcome back
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-400)', fontFamily: 'var(--font-body)' }}>
            Sign in to your account
          </div>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, color: '#444',
              display: 'block', marginBottom: 6, letterSpacing: '.02em',
            }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@vasantham.com" autoComplete="username"
              style={{
                width: '100%', height: 42, padding: '0 14px',
                fontSize: 13, borderRadius: 6,
                border: '1.5px solid #E2DDD6',
                background: '#FAFAF8', color: '#1a1a1a',
                outline: 'none', boxSizing: 'border-box',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e  => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,149,42,0.12)' }}
              onBlur={e   => { e.target.style.borderColor = '#E2DDD6'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, color: '#444',
              display: 'block', marginBottom: 6, letterSpacing: '.02em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{
                  width: '100%', height: 42, padding: '0 40px 0 14px',
                  fontSize: 13, borderRadius: 6,
                  border: '1.5px solid #E2DDD6',
                  background: '#FAFAF8', color: '#1a1a1a',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,149,42,0.12)' }}
                onBlur={e  => { e.target.style.borderColor = '#E2DDD6'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button" onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#AAA', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5',
              padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 16,
              fontFamily: 'var(--font-body)',
            }}>{error}</div>
          )}

          {/* Sign In button */}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', height: 44,
              background: loading ? 'var(--gold-100)' : 'transparent',
              border: '1.5px solid var(--gold)',
              color: loading ? 'var(--gold-700)' : 'var(--gold)',
              borderRadius: 6,
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 600, letterSpacing: '.03em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#fff' }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: 'loginSpin 1s linear infinite' }}/> Signing in…</>
              : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: 24,
          background: '#FAFAF8',
          border: '1px solid rgba(201,149,42,0.2)',
          borderRadius: 8, padding: '10px 14px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 5, fontFamily: 'var(--font-body)',
          }}>
            Demo Credentials
          </div>
          <div style={{ fontSize: 12, color: '#666', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
            <span style={{ color: '#444', fontWeight: 500 }}>Email:</span> admin@vasantham.com<br/>
            <span style={{ color: '#444', fontWeight: 500 }}>Password:</span> admin123
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loginSpin { to { transform: rotate(360deg) } }
        @keyframes loginShake {
          0%,100% { transform: translateX(0) }
          15%      { transform: translateX(-8px) }
          30%      { transform: translateX(7px) }
          45%      { transform: translateX(-6px) }
          60%      { transform: translateX(5px) }
          75%      { transform: translateX(-3px) }
          90%      { transform: translateX(2px) }
        }
        .login-shake { animation: loginShake 0.55s ease; }
      `}</style>
    </div>
  )
}
