import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { formatINR, formatINRCompact } from '../../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Award } from 'lucide-react'

export function TopItems() {
  const { invoices, items } = useAppStore()

  const revenue = {}
  invoices.forEach(inv=>inv.items?.forEach(li=>{
    revenue[li.itemId] = (revenue[li.itemId]||0) + li.lineTotal
  }))

  const top10 = items
    .map(i=>({ ...i, revenue:revenue[i.id]||0 }))
    .sort((a,b)=>b.revenue-a.revenue)
    .slice(0,10)

  const COLORS = ['#C9952A','#D4A843','#DDBB5E','#E5CD79','#EBD993','#F0E4AE','#F4EEC9','#E8D5A0','#D4BD7B','#C0A556']

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']} />
      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Top 10 Items by Revenue</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10} layout="vertical" margin={{ left:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize:10 }} tickFormatter={v=>formatINRCompact(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:10 }} width={120} tickFormatter={v=>v.length>15?v.slice(0,15)+'…':v} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Bar dataKey="revenue" name="Revenue" radius={[0,3,3,0]}>
                {top10.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--toolbar-bg)' }}>
                {['#','Item','Category','Stock','MRP','Revenue'].map(h=>(
                  <th key={h} style={{ padding:'7px 12px', textAlign:h==='Revenue'||h==='MRP'||h==='Stock'?'right':'left', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top10.map((item,i)=>(
                <tr key={item.id} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface-2)' }}>
                  <td style={{ padding:'7px 12px', color:'var(--ink-400)', fontWeight:700 }}>#{i+1}</td>
                  <td style={{ padding:'7px 12px' }}><span style={{ marginRight:6 }}>{item.emoji}</span><b>{item.name}</b></td>
                  <td style={{ padding:'7px 12px', color:'var(--ink-400)' }}>{item.category}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{item.stockQty} {item.unit}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{formatINR(item.mrp)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'var(--gold)' }}>{formatINR(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
