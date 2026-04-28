import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { formatINR, formatINRCompact } from '../../utils/format'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#C9952A','#1E6B45','#1E40AF','#B45309','#7A7268']
const MODES = ['cash','upi','card','bank','cheque']

export function PaymentAnalysis() {
  const invoices = useAppStore(s=>s.invoices)

  const modeData = MODES.map(m=>({
    name:m.toUpperCase(),
    value:invoices.filter(i=>i.paymentMode===m).reduce((s,i)=>s+i.total,0),
    count:invoices.filter(i=>i.paymentMode===m).length
  })).filter(d=>d.value>0)

  const byDate={}
  invoices.forEach(i=>{
    const d=new Date(i.date).toISOString().split('T')[0].slice(5)
    if(!byDate[d]) byDate[d]={cash:0,upi:0,card:0,bank:0}
    byDate[d][i.paymentMode]=(byDate[d][i.paymentMode]||0)+i.total
  })
  const trendData=Object.entries(byDate).sort().map(([date,v])=>({date,...v}))

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']} />
      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:14 }}>
          <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Payment Mode Split</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={modeData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {modeData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
              {modeData.map((m,i)=>(
                <div key={m.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:COLORS[i%COLORS.length] }}/>
                    <span>{m.name}</span>
                  </div>
                  <span style={{ fontWeight:700 }}>{formatINRCompact(m.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--surface)', borderRadius:8, padding:16, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Daily Payment Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:10 }} tickFormatter={v=>formatINRCompact(v)} />
                <Tooltip formatter={v=>formatINR(v)} />
                <Legend />
                <Bar dataKey="cash" stackId="a" fill="#C9952A" name="Cash" />
                <Bar dataKey="upi" stackId="a" fill="#1E6B45" name="UPI" />
                <Bar dataKey="card" stackId="a" fill="#1E40AF" name="Card" />
                <Bar dataKey="bank" stackId="a" fill="#B45309" name="Bank" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--toolbar-bg)' }}>
                {['Payment Mode','Transactions','Total Amount','Avg Transaction'].map(h=>(
                  <th key={h} style={{ padding:'7px 12px', textAlign:h==='Payment Mode'?'left':'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modeData.map((m,i)=>(
                <tr key={m.name} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface-2)' }}>
                  <td style={{ padding:'7px 12px', fontWeight:500 }}>{m.name}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{m.count}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right', fontWeight:700, color:'var(--gold)' }}>{formatINR(m.value)}</td>
                  <td style={{ padding:'7px 12px', textAlign:'right' }}>{formatINR(m.count?m.value/m.count:0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
