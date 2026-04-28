import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { formatINR } from '../../utils/format'
import { Scale } from 'lucide-react'

export function TrialBalance() {
  const ledger = useAppStore(s=>s.ledger)

  const heads = {}
  ledger.forEach(l => {
    if(!heads[l.head]) heads[l.head] = { debit:0, credit:0 }
    heads[l.head].debit += l.debit
    heads[l.head].credit += l.credit
  })

  const rows = Object.entries(heads).map(([head,{debit,credit}])=>({
    head, debit, credit, net: credit-debit
  }))

  const totalDr = rows.reduce((s,r)=>s+r.debit,0)
  const totalCr = rows.reduce((s,r)=>s+r.credit,0)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']} />
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ background:'var(--sidebar-bg)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'var(--gold)' }}>Trial Balance — FY 2024-2025</span>
          </div>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--toolbar-bg)' }}>
                <th style={{ padding:'8px 14px', textAlign:'left', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Account Head</th>
                <th style={{ padding:'8px 14px', textAlign:'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Debit (Dr)</th>
                <th style={{ padding:'8px 14px', textAlign:'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Credit (Cr)</th>
                <th style={{ padding:'8px 14px', textAlign:'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={r.head} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'var(--surface)':'var(--surface-2)' }}>
                  <td style={{ padding:'7px 14px', fontWeight:500 }}>{r.head}</td>
                  <td style={{ padding:'7px 14px', textAlign:'right', color:r.debit>0?'var(--danger)':'var(--ink-200)' }}>
                    {r.debit>0?formatINR(r.debit):'—'}
                  </td>
                  <td style={{ padding:'7px 14px', textAlign:'right', color:r.credit>0?'var(--success)':'var(--ink-200)' }}>
                    {r.credit>0?formatINR(r.credit):'—'}
                  </td>
                  <td style={{ padding:'7px 14px', textAlign:'right', fontWeight:700, color:r.net>=0?'var(--success)':'var(--danger)' }}>
                    {formatINR(Math.abs(r.net))} {r.net>=0?'Cr':'Dr'}
                  </td>
                </tr>
              ))}
              <tr style={{ background:'var(--toolbar-bg)', borderTop:'2px solid var(--border)' }}>
                <td style={{ padding:'8px 14px', fontWeight:700, fontSize:13 }}>TOTAL</td>
                <td style={{ padding:'8px 14px', textAlign:'right', fontWeight:700, color:'var(--danger)' }}>{formatINR(totalDr)}</td>
                <td style={{ padding:'8px 14px', textAlign:'right', fontWeight:700, color:'var(--success)' }}>{formatINR(totalCr)}</td>
                <td style={{ padding:'8px 14px', textAlign:'right', fontWeight:700, color:totalCr>=totalDr?'var(--success)':'var(--danger)' }}>
                  {formatINR(Math.abs(totalCr-totalDr))} {totalCr>=totalDr?'Cr':'Dr'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
