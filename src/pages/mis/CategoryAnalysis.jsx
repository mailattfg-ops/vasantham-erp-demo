import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { formatINR, formatINRCompact } from '../../utils/format'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#C9952A','#1E6B45','#1E40AF','#B45309','#7A7268']

export function CategoryAnalysis() {
  const { invoices, items } = useAppStore()

  const catRevenue = {}
  invoices.forEach(inv=>inv.items?.forEach(li=>{
    const item=items.find(i=>i.id===li.itemId)
    const cat=item?.category||'Other'
    if(!catRevenue[cat]) catRevenue[cat]={ revenue:0, cost:0 }
    catRevenue[cat].revenue += li.lineTotal
    catRevenue[cat].cost += (item?.purchasePrice||0)*li.qty
  }))

  const catStock = {}
  items.forEach(i=>{
    if(!catStock[i.category]) catStock[i.category]={ stockVal:0, items:0 }
    catStock[i.category].stockVal += i.retailPrice*i.stockQty
    catStock[i.category].items++
  })

  const categories = [...new Set([...Object.keys(catRevenue),...Object.keys(catStock)])]
  const data = categories.map(cat=>({
    category:cat,
    revenue:catRevenue[cat]?.revenue||0,
    cost:catRevenue[cat]?.cost||0,
    margin:(catRevenue[cat]?.revenue||0)-(catRevenue[cat]?.cost||0),
    stockValue:catStock[cat]?.stockVal||0,
    items:catStock[cat]?.items||0,
  }))

  const pieData = data.map(d=>({ name:d.category, value:d.revenue })).filter(d=>d.value>0)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']} />
      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Revenue by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,percent})=>`${name.slice(0,8)} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Category Summary</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.map((d,i)=>(
                <div key={d.category} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', background:'var(--surface-2)', borderRadius:4 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600 }}>{d.category}</div>
                    <div style={{ fontSize:10, color:'var(--ink-400)' }}>{d.items} items</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--gold)' }}>{formatINRCompact(d.revenue)}</div>
                    <div style={{ fontSize:10, color:'var(--success)' }}>+{formatINRCompact(d.margin)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--toolbar-bg)' }}>
                {['Category','Items','Revenue','Cost','Margin','Stock Value'].map(h=>(
                  <th key={h} style={{ padding:'7px 12px', textAlign:h==='Category'?'left':'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r,i)=>(
                <tr key={r.category} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface-2)' }}>
                  <td style={{ padding:'7px 12px', fontWeight:500 }}>{r.category}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{r.items}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'var(--gold)' }}>{formatINR(r.revenue)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{formatINR(r.cost)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', color:'var(--success)', fontWeight:600 }}>{formatINR(r.margin)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{formatINR(r.stockValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
