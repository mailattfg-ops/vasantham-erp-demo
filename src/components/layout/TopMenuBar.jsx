import { useNavigate } from 'react-router-dom'
import { useNavStore } from '../../store/navStore'
import { VasanthamLogo } from '../brand/VasanthamLogo'

const MENUS = [
  { id: 'dashboard',    label: 'Dashboard' },
  { id: 'registration', label: 'Registration' },
  { id: 'tasks',        label: 'Tasks' },
  { id: 'financial',    label: 'Financial Reports' },
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
  const { activeMenu, setActiveMenu } = useNavStore()
  const navigate = useNavigate()

  const handleMenu = (id) => {
    setActiveMenu(id)
    navigate(MENU_DEFAULT_ROUTES[id])
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
                height: '100%',
                padding: '0 14px',
                background: 'none',
                border: 'none',
                borderBottom: activeMenu === menu.id ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeMenu === menu.id ? 'var(--gold)' : 'var(--menubar-text)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: activeMenu === menu.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'color .15s',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
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
