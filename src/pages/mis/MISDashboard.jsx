import { useAppStore } from '../../store/appStore'
import { formatINR, formatINRCompact } from '../../utils/format'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, ShoppingBag, Package, CreditCard, Users } from 'lucide-react'

const COLORS = ['#C9952A','#1E6B45','#1E40AF','#B45309','#7A7268','#B91C1C']

export function MISDashboard() {
  const { invoices, purchaseOrders, items } = useAppStore()

  const totalSales = invoices.reduce((s,i)=>s+i.total,0)
  const totalPurchases = purchaseOrders.reduce((s,p)=>s+p.total,0)
  const avgOrderValue = invoices.length ? totalSales/invoices.length : 0
  const stockValue = items.reduce((s,i)=>s+i.retailPrice*i.stockQty,0)

  const salesByDay = {}
  const purchasesByDay = {}
  invoices.forEach(i=>{ const d=new Date(i.date).toISOString().split('T')[0].slice(5); salesByDay[d]=(salesByDay[d]||0)+i.total })
  purchaseOrders.forEach(p=>{ const d=new Date(p.date).toISOString().split('T')[0].slice(5); purchasesByDay[d]=(purchasesByDay[d]||0)+p.total })
  const allDays=[...new Set([...Object.keys(salesByDay),...Object.keys(purchasesByDay)])].sort()
  const trendData=allDays.map(d=>({ date:d, sales:salesByDay[d]||0, purchases:purchasesByDay[d]||0 }))

  const catSales={}
  invoices.forEach(inv=>inv.items?.forEach(item=>{
    const it=items.find(i=>i.id===item.itemId)
    const cat=it?.category||'Other'
    catSales[cat]=(catSales[cat]||0)+item.lineTotal
  }))
  const pieData=Object.entries(catSales).map(([name,value])=>({name,value}))

  const payData = {}
  invoices.forEach(i=>{ payData[i.paymentMode]=(payData[i.paymentMode]||0)+i.total })
  const payChartData=Object.entries(payData).map(([name,value])=>({name:name.toUpperCase(),value}))

  return (
    <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Sales', value:formatINRCompact(totalSales), icon:TrendingUp, color:'var(--gold)', bg:'var(--gold-50)' },
          { label:'Total Purchases', value:formatINRCompact(totalPurchases), icon:ShoppingBag, color:'var(--info)', bg:'var(--info-bg)' },
          { label:'Avg Order Value', value:formatINRCompact(avgOrderValue), icon:CreditCard, color:'var(--success)', bg:'var(--success-bg)' },
          { label:'Stock Value', value:formatINRCompact(stockValue), icon:Package, color:'var(--warning)', bg:'var(--warning-bg)' },
        ].map(k=>(
          <div key={k.label} style={{ background:'var(--surface)', borderRadius:8, padding:'14px 16px', boxShadow:'var(--shadow-sm)', display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:40, height:40, borderRadius:8, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <k.icon size={18} style={{ color:k.color }} />
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'.04em' }}>{k.label}</div>
              <div style={{ fontSize:20, fontWeight:700 }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Sales vs Purchases Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>formatINRCompact(v)} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="var(--gold)" strokeWidth={2} dot={false} name="Sales" />
              <Line type="monotone" dataKey="purchases" stroke="var(--info)" strokeWidth={2} dot={false} name="Purchases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Category Sales Split</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              {pieData.map((p,i)=>(
                <div key={p.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:COLORS[i%COLORS.length] }} />
                    <span style={{ color:'var(--ink-600)' }}>{p.name}</span>
                  </div>
                  <span style={{ fontWeight:600 }}>{formatINRCompact(p.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Payment Mode Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={payChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>formatINRCompact(v)} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Bar dataKey="value" fill="var(--gold)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Summary Metrics</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'Total Invoices', value:invoices.length },
              { label:'Paid Invoices', value:invoices.filter(i=>i.status==='paid').length },
              { label:'Pending Invoices', value:invoices.filter(i=>i.status==='pending').length },
              { label:'Total Purchase Orders', value:purchaseOrders.length },
              { label:'Pending POs', value:purchaseOrders.filter(p=>p.status==='pending').length },
            ].map(m=>(
              <div key={m.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--ink-400)' }}>{m.label}</span>
                <span style={{ fontSize:13, fontWeight:700 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
