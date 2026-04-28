import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { formatINR, formatINRCompact } from '../../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

export function StockValuation() {
  const items = useAppStore(s=>s.items)

  const byCat = {}
  items.forEach(i => {
    if(!byCat[i.category]) byCat[i.category] = { items:0, stockValue:0, cost:0 }
    byCat[i.category].items++
    byCat[i.category].stockValue += i.retailPrice * i.stockQty
    byCat[i.category].cost += i.purchasePrice * i.stockQty
  })

  const data = Object.entries(byCat).map(([cat,v])=>({ category:cat, value:v.stockValue, cost:v.cost, margin:v.stockValue-v.cost }))
  const total = data.reduce((s,d)=>s+d.value,0)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']} />
      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Stock Value by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ left:-10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} tickFormatter={v=>formatINRCompact(v)} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Bar dataKey="value" name="Stock Value" fill="var(--gold)" radius={[3,3,0,0]} />
              <Bar dataKey="cost" name="Cost Value" fill="var(--info)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--toolbar-bg)' }}>
                {['Category','Items','Stock Value','Cost Value','Margin'].map(h=>(
                  <th key={h} style={{ padding:'7px 12px', textAlign:h==='Category'?'left':'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r,i)=>(
                <tr key={r.category} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface-2)' }}>
                  <td style={{ padding:'7px 12px', fontWeight:500 }}>{r.category}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{byCat[r.category].items}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700 }}>{formatINR(r.value)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', color:'var(--ink-400)' }}>{formatINR(r.cost)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', color:'var(--success)', fontWeight:700 }}>{formatINR(r.margin)}</td>
                </tr>
              ))}
              <tr style={{ background:'var(--toolbar-bg)', fontWeight:700 }}>
                <td colSpan={2} style={{ padding:'8px 12px' }}>TOTAL</td>
                <td style={{ padding:'8px 12px', textAlign:'right', color:'var(--gold)' }}>{formatINR(total)}</td>
                <td style={{ padding:'8px 12px', textAlign:'right' }}>{formatINR(data.reduce((s,d)=>s+d.cost,0))}</td>
                <td style={{ padding:'8px 12px', textAlign:'right', color:'var(--success)' }}>{formatINR(data.reduce((s,d)=>s+d.margin,0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
