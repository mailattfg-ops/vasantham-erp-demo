import { useNavigate } from 'react-router-dom'
import { useNavStore } from '../../store/navStore'
import { VasanthamLogo } from '../brand/VasanthamLogo'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { Menu } from 'lucide-react'

const MENUS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'registration', label: 'Registration' },
  { id: 'tasks',        label: 'Tasks' },
  { id: 'financial',    label: 'Financial' },
  { id: 'reports',      label: 'Reports' },
  { id: 'mis',          label: 'MIS' },
]

const MENU_DEFAULT_ROUTES = {
  dashboard:    '/',
  registration: '/inventory',
  tasks:        '/pos',
  financial:    '/accounts/daybook',
  reports:      '/reports/stock',
  mis:          '/mis',
}

export function TopMenuBar() {
  const { activeMenu, setActiveMenu, toggleSidebar, setSidebarOpen } = useNavStore()
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()

  const handleMenu = (id) => {
    setActiveMenu(id)
    navigate(MENU_DEFAULT_ROUTES[id])
    setSidebarOpen(false)
  }

  if (isMobile) {
    return (
      <div style={{ flexShrink: 0, zIndex: 100, background: 'var(--menubar-bg)', boxShadow: '0 1px 0 rgba(201,149,42,0.15)' }} className="no-print">
        {/* Mobile top row: hamburger + logo */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, gap: 12 }}>
          <button
            onClick={toggleSidebar}
            style={{ color: 'rgba(255,255,255,0.7)', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <VasanthamLogo />
          </div>
          {/* Spacer to balance hamburger */}
          <div style={{ width: 28 }} />
        </div>

        {/* Scrollable module tabs */}
        <div style={{
          display: 'flex', overflowX: 'auto', height: 36,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <style>{`.mob-tabs::-webkit-scrollbar{display:none}`}</style>
          <div className="mob-tabs" style={{ display: 'flex', minWidth: 'max-content', width: '100%' }}>
            {MENUS.map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleMenu(menu.id)}
                style={{
                  height: '100%', padding: '0 16px',
                  background: 'none', border: 'none',
                  borderBottom: activeMenu === menu.id ? '2px solid var(--gold)' : '2px solid transparent',
                  color: activeMenu === menu.id ? 'var(--gold)' : 'rgba(255,255,255,0.55)',
                  fontSize: 12, fontFamily: 'var(--font-body)',
                  fontWeight: activeMenu === menu.id ? 600 : 400,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color .15s',
                }}
              >
                {menu.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: 48, background: 'var(--menubar-bg)',
      display: 'flex', alignItems: 'center', paddingLeft: 16,
      gap: 0, flexShrink: 0, zIndex: 100, position: 'relative',
      boxShadow: '0 1px 0 rgba(201,149,42,0.15)'
    }} className="no-print">
      <div style={{ marginRight: 24 }}>
        <VasanthamLogo />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2 }}>
        {MENUS.map((menu, idx) => (
          <div key={menu.id} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {idx > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 16, margin: '0 2px' }}>|</span>
            )}
            <button
              onClick={() => handleMenu(menu.id)}
              style={{
                height: '100%', padding: '0 14px',
                background: 'none', border: 'none',
                borderBottom: activeMenu === menu.id ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeMenu === menu.id ? 'var(--gold)' : 'var(--menubar-text)',
                fontSize: 13, fontFamily: 'var(--font-body)',
                fontWeight: activeMenu === menu.id ? 600 : 400,
                cursor: 'pointer', transition: 'color .15s',
                letterSpacing: '0.01em', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if(activeMenu!==menu.id) e.target.style.color='rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { if(activeMenu!==menu.id) e.target.style.color='var(--menubar-text)' }}
            >
              {menu.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
