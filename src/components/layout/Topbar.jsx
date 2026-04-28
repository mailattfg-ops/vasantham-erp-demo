import { useLocation } from 'react-router-dom'
import { Bell, Settings, Search } from 'lucide-react'
import { useNavStore } from '../../store/navStore'

const ROUTE_LABELS = {
  '/':                   ['Dashboard'],
  '/inventory':          ['Registration', 'Inventory Items'],
  '/item-groups':        ['Registration', 'Item Groups'],
  '/gst-units':          ['Registration', 'GST Units'],
  '/customers':          ['Registration', 'Customers'],
  '/vendors':            ['Registration', 'Vendors'],
  '/employees':          ['Registration', 'Employees'],
  '/company':            ['Registration', 'Company Info'],
  '/pos':                ['Tasks', 'POS / Cash Counter'],
  '/sales':              ['Tasks', 'Sales Invoice'],
  '/sales-returns':      ['Tasks', 'Sales Returns'],
  '/purchases':          ['Tasks', 'Purchase Order'],
  '/purchase-returns':   ['Tasks', 'Purchase Returns'],
  '/accounts/daybook':   ['Financial Reports', 'Day Book'],
  '/accounts/cashbook':  ['Financial Reports', 'Cash Book'],
  '/accounts/ledger':    ['Financial Reports', 'Ledger'],
  '/accounts/trial':     ['Financial Reports', 'Trial Balance'],
  '/reports/stock':      ['Reports', 'Stock Report'],
  '/reports/valuation':  ['Reports', 'Stock Valuation'],
  '/reports/sales':      ['Reports', 'Sales Report'],
  '/reports/gst':        ['Reports', 'GST Report'],
  '/reports/purchases':  ['Reports', 'Purchase Report'],
  '/mis':                ['MIS', 'Overview'],
  '/mis/top-items':      ['MIS', 'Top Items'],
  '/mis/categories':     ['MIS', 'Category Analysis'],
  '/mis/payments':       ['MIS', 'Payment Analysis'],
}

export function Topbar() {
  const location = useLocation()
  const crumbs = ROUTE_LABELS[location.pathname] || ['ERP']

  return (
    <div style={{
      height: 52, background: 'var(--surface)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', alignItems: 'center', padding: '0 20px',
      gap: 16, flexShrink: 0, zIndex: 10
    }} className="no-print">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-400)', letterSpacing: '.04em' }}>ERP</span>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ink-200)', fontSize: 12 }}>›</span>
            <span style={{
              fontSize: 11,
              color: i === crumbs.length-1 ? 'var(--gold)' : 'var(--ink-400)',
              fontWeight: i === crumbs.length-1 ? 600 : 400,
              textTransform: 'uppercase', letterSpacing: '.04em'
            }}>{c}</span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)' }} />
        <input
          type="search"
          placeholder="Search items, staff..."
          style={{ width: 260, paddingLeft: 30, height: 32, fontSize: 12, background: 'var(--surface-2)' }}
        />
      </div>

      {/* Icons */}
      <button style={{ color:'var(--ink-400)', padding:6 }}>
        <Bell size={18} />
      </button>
      <button style={{ color:'var(--ink-400)', padding:6 }}>
        <Settings size={18} />
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{
          width:34, height:34, borderRadius:'50%', background:'var(--gold)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:700, color:'#0F1117'
        }}>AK</div>
        <div>
          <div style={{ fontSize:12, fontWeight:600 }}>Admin User</div>
          <div style={{ fontSize:10, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'.05em' }}>Admin</div>
        </div>
      </div>
    </div>
  )
}
