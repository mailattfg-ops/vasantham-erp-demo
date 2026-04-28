import { useNavigate, useLocation } from 'react-router-dom'
import { useNavStore } from '../../store/navStore'
import { useAuthStore } from '../../store/authStore'
import {
  Package, Layers, Receipt, Users, Truck, UserCheck, Building2,
  ShoppingCart, FileText, RotateCcw, ShoppingBag, BookOpen,
  Wallet, BookMarked, Scale, BarChart2, TrendingUp, LineChart,
  FileSpreadsheet, BarChart, LayoutDashboard, Award, PieChart,
  CreditCard, LogOut
} from 'lucide-react'

const SIDEBAR_ITEMS = {
  registration: [
    { section: 'MASTER DATA', items: [
      { label: 'Inventory Items', path: '/inventory', icon: Package },
      { label: 'Item Groups',     path: '/item-groups', icon: Layers },
      { label: 'GST Units',       path: '/gst-units', icon: Receipt },
    ]},
    { section: 'PARTIES', items: [
      { label: 'Customers',  path: '/customers', icon: Users },
      { label: 'Vendors',    path: '/vendors', icon: Truck },
      { label: 'Employees',  path: '/employees', icon: UserCheck },
    ]},
    { section: 'COMPANY', items: [
      { label: 'Company Info', path: '/company', icon: Building2 },
    ]},
  ],
  tasks: [
    { section: 'BILLING', items: [
      { label: 'POS / Cash Counter', path: '/pos', icon: ShoppingCart },
      { label: 'Sales Invoice',      path: '/sales', icon: FileText },
      { label: 'Sales Returns',      path: '/sales-returns', icon: RotateCcw },
    ]},
    { section: 'PROCUREMENT', items: [
      { label: 'Purchase Order',   path: '/purchases', icon: ShoppingBag },
      { label: 'Purchase Returns', path: '/purchase-returns', icon: RotateCcw },
    ]},
  ],
  financial: [
    { section: 'BOOKS OF ACCOUNTS', items: [
      { label: 'Day Book',      path: '/accounts/daybook', icon: BookOpen },
      { label: 'Cash Book',     path: '/accounts/cashbook', icon: Wallet },
      { label: 'Ledger',        path: '/accounts/ledger', icon: BookMarked },
      { label: 'Trial Balance', path: '/accounts/trial', icon: Scale },
    ]},
  ],
  reports: [
    { section: 'INVENTORY', items: [
      { label: 'Stock Report',    path: '/reports/stock', icon: BarChart2 },
      { label: 'Stock Valuation', path: '/reports/valuation', icon: TrendingUp },
    ]},
    { section: 'SALES', items: [
      { label: 'Sales Report', path: '/reports/sales', icon: LineChart },
      { label: 'GST Report',   path: '/reports/gst', icon: FileSpreadsheet },
    ]},
    { section: 'PURCHASE', items: [
      { label: 'Purchase Report', path: '/reports/purchases', icon: BarChart },
    ]},
  ],
  mis: [
    { section: 'ANALYTICS', items: [
      { label: 'Overview',          path: '/mis', icon: LayoutDashboard },
      { label: 'Top Items',         path: '/mis/top-items', icon: Award },
      { label: 'Category Analysis', path: '/mis/categories', icon: PieChart },
      { label: 'Payment Analysis',  path: '/mis/payments', icon: CreditCard },
    ]},
  ],
}

export function Sidebar() {
  const { activeMenu } = useNavStore()
  const navigate = useNavigate()
  const location = useLocation()

  const sections = SIDEBAR_ITEMS[activeMenu] || []

  if (activeMenu === 'dashboard') {
    return (
      <div style={{
        width: 240, background: 'var(--sidebar-bg)', flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }} className="no-print">
        <div style={{ flex: 1 }} />
        <UserChip />
      </div>
    )
  }

  return (
    <div style={{
      width: 240, background: 'var(--sidebar-bg)', flexShrink: 0,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }} className="no-print">
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 8px' }}>
        {sections.map((sec) => (
          <div key={sec.section} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '.1em',
              color: 'rgba(201,149,42,0.45)', textTransform: 'uppercase',
              padding: '0 16px', marginBottom: 4
            }}>
              {sec.section}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path !== '/mis' && location.pathname.startsWith(item.path) && item.path.length > 4)
                || location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 16px 7px 13px',
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--sidebar-active-border)' : '3px solid transparent',
                    color: isActive ? 'var(--sidebar-active-text)' : 'rgba(255,255,255,0.55)',
                    fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: isActive ? 500 : 400,
                    cursor: 'pointer', border: 'none', textAlign: 'left',
                    transition: 'all .12s',
                    borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                  }}
                  onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background='var(--sidebar-hover)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}}
                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.55)' }}}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <UserChip />
    </div>
  )
}

function UserChip() {
  const navigate = useNavigate()
  const logout   = useAuthStore(s => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#0F1117', flexShrink: 0
      }}>AK</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', truncate: true }}>Arjun Kumar</div>
        <div style={{ fontSize: 10, color: 'rgba(201,149,42,0.6)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Admin</div>
      </div>
      <button
        onClick={handleLogout}
        style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        title="Logout"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
