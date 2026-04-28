import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatINR, formatINRCompact, getStockStatus } from '../../utils/format'
import { BarChart2 } from 'lucide-react'

const CATS = ['All','Silk Fabrics','Cotton Fabrics','Kurta','Accessories','Synthetic']

export function StockReport() {
  const items = useAppStore(s=>s.items)
  const { addToast } = useToastStore()
  const [cat, setCat] = useState('All')

  const filtered = items.filter(i=>cat==='All'||i.category===cat)
  const totalValue = filtered.reduce((s,i)=>s+i.retailPrice*i.stockQty,0)

  const cols = [
    { key:'sku', label:'Code', width:120 },
    { key:'name', label:'Name', sortable:true, render:(v,r)=><span>{r.emoji} {v}</span> },
    { key:'category', label:'Category', sortable:true },
    { key:'stockQty', label:'Stock', align:'right', sortable:true, render:(v,r)=><b>{v} {r.unit}</b> },
    { key:'minStock', label:'Min', align:'right' },
    { key:'mrp', label:'MRP', align:'right', render:v=>formatINR(v) },
    { key:'retailPrice', label:'Retail', align:'right', render:v=>formatINR(v) },
    { key:'retailPrice', label:'Stock Value', align:'right', sortable:false, render:(_,r)=><b>{formatINR(r.retailPrice*r.stockQty)}</b> },
    { key:'stockQty', label:'Status', sortable:false, render:(_,r)=><StatusBadge status={getStockStatus(r)} /> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={['print','export']}
        onAction={a=>{ if(a==='export') addToast('Exported to CSV','info') }}
      >
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{ height:28, fontSize:12 }}>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
      </ActionToolbar>

      <div style={{ padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', gap:16, alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--ink-400)' }}>{filtered.length} items</span>
        <span style={{ fontSize:12, fontWeight:700 }}>Total Stock Value: <span style={{ color:'var(--gold)' }}>{formatINR(totalValue)}</span></span>
      </div>

      <DataTable columns={cols} rows={filtered} emptyMessage="No stock data" emptyIcon={BarChart2} />
    </div>
  )
}
