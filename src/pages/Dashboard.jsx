import { useAppStore } from '../store/appStore'
import { formatINR, formatINRCompact, formatDate, getStockStatus } from '../utils/format'
import { useNavStore } from '../store/navStore'
import { useNavigate } from 'react-router-dom'
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { ShoppingBag, AlertTriangle, CreditCard, Package, TrendingUp } from 'lucide-react'
import { StatusBadge } from '../components/shared/StatusBadge'

const COLORS = ['#C9952A','#1E6B45','#1E40AF','#B45309','#7A7268']

export function Dashboard() {
  const { invoices, items, vendors, purchaseOrders } = useAppStore()
  const { setActiveMenu } = useNavStore()
  const navigate = useNavigate()

  const todayInv = invoices.filter(i => new Date(i.date).toDateString() === new Date().toDateString())
  const todaySales = todayInv.reduce((s,i)=>s+i.total,0)
  const lowStock = items.filter(i => getStockStatus(i) !== 'normal')
  const pendingPayables = vendors.reduce((s,v)=>s+v.outstanding,0)
  const totalProducts = items.length

  const paymentSplit = ['cash','upi','card','bank','cheque'].map(m => ({
    name: m.toUpperCase(),
    value: todayInv.filter(i=>i.paymentMode===m).reduce((s,i)=>s+i.total,0)
  })).filter(p=>p.value>0)

  const topByValue = [...items].sort((a,b)=>(b.mrp*b.stockQty)-(a.mrp*a.stockQty)).slice(0,5)

  const recentInvoices = invoices.slice(0,6)

  const goTo = (menu, path) => { setActiveMenu(menu); navigate(path) }

  return (
    <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KPICard
          label="Today's Sales"
          value={formatINRCompact(todaySales)}
          sub={`${todayInv.length} invoices`}
          icon={ShoppingBag} color="var(--gold)" bg="var(--gold-50)"
          onClick={() => goTo('tasks','/sales')}
        />
        <KPICard
          label="Low Stock Items"
          value={lowStock.length}
          sub="Need attention"
          icon={AlertTriangle} color="var(--warning)" bg="var(--warning-bg)"
          onClick={() => goTo('reports','/reports/stock')}
        />
        <KPICard
          label="Pending Payables"
          value={formatINRCompact(pendingPayables)}
          sub="To vendors"
          icon={CreditCard} color="var(--danger)" bg="var(--danger-bg)"
          onClick={() => goTo('registration','/vendors')}
        />
        <KPICard
          label="Total Products"
          value={totalProducts}
          sub="Active items"
          icon={Package} color="var(--info)" bg="var(--info-bg)"
          onClick={() => goTo('registration','/inventory')}
        />
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Payment Split Donut */}
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Today's Payment Split</div>
          {paymentSplit.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-400)', fontSize:13 }}>No sales today</div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <ResponsiveContainer width={140} height={140}>
                <RechartsPie>
                  <Pie data={paymentSplit} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" paddingAngle={3}>
                    {paymentSplit.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>formatINR(v)}/>
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                {paymentSplit.map((p,i)=>(
                  <div key={p.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:COLORS[i%COLORS.length] }} />
                      <span style={{ fontSize:12 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:600 }}>{formatINRCompact(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Low Stock Alerts</div>
          {lowStock.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-400)', fontSize:13 }}>All stock levels healthy</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {lowStock.slice(0,5).map(item => {
                const st = getStockStatus(item)
                return (
                  <div key={item.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'6px 8px', borderRadius:4, background:'var(--surface-2)'
                  }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{item.emoji} {item.name}</div>
                      <div style={{ fontSize:11, color:'var(--ink-400)' }}>{item.sku}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{item.stockQty} {item.unit}</div>
                      <StatusBadge status={st} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Top Items by Stock Value */}
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Top Items by Stock Value</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topByValue} margin={{ left:-10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize:10 }} tickFormatter={v=>v.slice(0,10)+'…'} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Bar dataKey={(r)=>r.mrp*r.stockQty} name="Stock Value" fill="var(--gold)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales */}
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Recent Invoices</div>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-2)' }}>
                <th style={{ padding:'4px 8px', textAlign:'left', color:'var(--ink-400)', fontSize:11, fontWeight:600 }}>Invoice</th>
                <th style={{ padding:'4px 8px', textAlign:'left', color:'var(--ink-400)', fontSize:11, fontWeight:600 }}>Customer</th>
                <th style={{ padding:'4px 8px', textAlign:'right', color:'var(--ink-400)', fontSize:11, fontWeight:600 }}>Total</th>
                <th style={{ padding:'4px 8px', color:'var(--ink-400)', fontSize:11, fontWeight:600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'5px 8px', fontWeight:600 }}>{inv.invoiceNo}</td>
                  <td style={{ padding:'5px 8px', color:'var(--ink-600)', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.customerName}</td>
                  <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:700 }}>{formatINR(inv.total)}</td>
                  <td style={{ padding:'5px 8px' }}><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, sub, icon:Icon, color, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:'var(--surface)', borderRadius:8, padding:'16px 18px',
        boxShadow:'var(--shadow-sm)', display:'flex', alignItems:'center', gap:14,
        cursor:'pointer', transition:'box-shadow .15s'
      }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}
    >
      <div style={{
        width:44, height:44, borderRadius:10, background:bg,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize:11, color:'var(--ink-400)', fontWeight:500, textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</div>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--ink)', lineHeight:1.2 }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--ink-400)' }}>{sub}</div>
      </div>
    </div>
  )
}
