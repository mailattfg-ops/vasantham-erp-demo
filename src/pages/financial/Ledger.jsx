import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { formatINR, formatDate } from '../../utils/format'
import { BookMarked } from 'lucide-react'

const HEADS = ['All','Cash','Bank','Sales','Purchase','GST Payable','Salary','Rent','Sundry']

export function Ledger() {
  const ledger = useAppStore(s=>s.ledger)
  const [head, setHead] = useState('All')
  const [from, setFrom] = useState(new Date(Date.now()-30*86400000).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  const filtered = ledger.filter(l => {
    const ld = new Date(l.date).toISOString().split('T')[0]
    const mh = head==='All' || l.head===head
    return mh && ld>=from && ld<=to
  }).sort((a,b)=>new Date(a.date)-new Date(b.date))

  let running = 0
  const withBalance = filtered.map(l => {
    running += l.credit - l.debit
    return { ...l, balance: running }
  })

  const cols = [
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'particulars', label:'Particulars' },
    { key:'head', label:'Head' },
    { key:'debit', label:'Debit', align:'right', render:v=>v>0?<span style={{ color:'var(--danger)' }}>{formatINR(v)}</span>:'—' },
    { key:'credit', label:'Credit', align:'right', render:v=>v>0?<span style={{ color:'var(--success)' }}>{formatINR(v)}</span>:'—' },
    { key:'balance', label:'Balance', align:'right', render:v=><b style={{ color:v>=0?'var(--success)':'var(--danger)' }}>{formatINR(Math.abs(v))}{v<0?' Dr':' Cr'}</b> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar buttons={['print','export']}>
        <select value={head} onChange={e=>setHead(e.target.value)} style={{ height:28, fontSize:12 }}>
          {HEADS.map(h=><option key={h}>{h}</option>)}
        </select>
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>From:</label>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ height:28, fontSize:12 }}/>
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>To:</label>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ height:28, fontSize:12 }}/>
      </ActionToolbar>
      <DataTable columns={cols} rows={withBalance} emptyMessage="No ledger entries" emptyIcon={BookMarked} />
    </div>
  )
}
