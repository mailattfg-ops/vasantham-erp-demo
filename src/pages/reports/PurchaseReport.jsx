import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatINR, formatDate } from '../../utils/format'
import { BarChart as BIcon } from 'lucide-react'

export function PurchaseReport() {
  const purchaseOrders = useAppStore(s=>s.purchaseOrders)
  const vendors = useAppStore(s=>s.vendors)
  const { addToast } = useToastStore()
  const [from, setFrom] = useState(new Date(Date.now()-30*86400000).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [vFilter, setVFilter] = useState('all')

  const filtered = purchaseOrders.filter(p => {
    const ld = new Date(p.date).toISOString().split('T')[0]
    const mv = vFilter==='all' || p.vendorId===vFilter
    return ld>=from && ld<=to && mv
  })

  const total = filtered.reduce((s,p)=>s+p.total,0)

  const cols = [
    { key:'poNumber', label:'PO Number', sortable:true },
    { key:'vendorName', label:'Vendor', sortable:true },
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'gstAmount', label:'GST', align:'right', render:v=>formatINR(v) },
    { key:'total', label:'Total', align:'right', render:v=><b>{formatINR(v)}</b>, sortable:true },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={['print','export']}
        onAction={a=>{ if(a==='export') addToast('Exported','info') }}
      >
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>From:</label>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{ height:28, fontSize:12 }}/>
        <label style={{ fontSize:12, color:'var(--ink-400)' }}>To:</label>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{ height:28, fontSize:12 }}/>
        <select value={vFilter} onChange={e=>setVFilter(e.target.value)} style={{ height:28, fontSize:12 }}>
          <option value="all">All Vendors</option>
          {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </ActionToolbar>

      <div style={{ padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', gap:16 }}>
        <span style={{ fontSize:12 }}>{filtered.length} purchase orders | Total: <b style={{ color:'var(--gold)' }}>{formatINR(total)}</b></span>
      </div>

      <DataTable columns={cols} rows={filtered} emptyMessage="No purchase data" emptyIcon={BIcon} />
    </div>
  )
}
