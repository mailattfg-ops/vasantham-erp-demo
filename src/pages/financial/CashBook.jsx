import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { formatINR, formatDate } from '../../utils/format'
import { Wallet } from 'lucide-react'

export function CashBook() {
  const ledger = useAppStore(s=>s.ledger)
  const [from, setFrom] = useState(new Date(Date.now()-7*86400000).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  const cashEntries = ledger.filter(l => {
    const ld = new Date(l.date).toISOString().split('T')[0]
    return (l.head==='Cash'||l.head==='Bank') && ld>=from && ld<=to
  })

  const receipts = cashEntries.reduce((s,l)=>s+l.credit,0)
  const payments = cashEntries.reduce((s,l)=>s+l.debit,0)
  const opening = 50000
  const closing = opening + receipts - payments

  const cols = [
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'particulars', label:'Particulars' },
    { key:'head', label:'Head' },
    { key:'credit', label:'Receipts (Cr)', align:'right', render:v=>v>0?<span style={{ color:'var(--success)', fontWeight:600 }}>{formatINR(v)}</span>:'—' },
    { key:'debit', label:'Payments (Dr)', align:'right', render:v=>v>0?<span style={{ color:'var(--danger)', fontWeight:600 }}>{formatINR(v)}</span>:'—' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']}>
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>From:</label>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ height:28, fontSize:12 }}/>
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>To:</label>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ height:28, fontSize:12 }}/>
      </ActionToolbar>

      <div style={{ display:'flex', gap:12, padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
        {[
          {label:'Opening Balance', value:formatINR(opening), color:'var(--ink)'},
          {label:'Receipts', value:formatINR(receipts), color:'var(--success)'},
          {label:'Payments', value:formatINR(payments), color:'var(--danger)'},
          {label:'Closing Balance', value:formatINR(closing), color:'var(--gold)'},
        ].map(c=>(
          <div key={c.label} style={{ display:'flex', flexDirection:'column', gap:2, padding:'4px 12px', background:'var(--surface-2)', borderRadius:4, flex:1 }}>
            <span style={{ fontSize:10, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'.04em' }}>{c.label}</span>
            <span style={{ fontSize:14, fontWeight:700, color:c.color }}>{c.value}</span>
          </div>
        ))}
      </div>

      <DataTable columns={cols} rows={cashEntries} emptyMessage="No cash/bank entries" emptyIcon={Wallet} />
    </div>
  )
}
