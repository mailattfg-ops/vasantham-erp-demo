import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { formatINR } from '../../utils/format'
import { FileSpreadsheet } from 'lucide-react'

export function GSTReport() {
  const invoices = useAppStore(s=>s.invoices)
  const { addToast } = useToastStore()
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth()+1).padStart(2,'0'))
  const [year, setYear] = useState(String(now.getFullYear()))

  const filtered = invoices.filter(i => {
    const d = new Date(i.date)
    return String(d.getMonth()+1).padStart(2,'0')===month && String(d.getFullYear())===year
  })

  const hsnMap = {}
  filtered.forEach(inv => {
    inv.items?.forEach(item => {
      const key = `${item.gstRate}%`
      if(!hsnMap[key]) hsnMap[key]={ hsn:key, taxable:0, cgst:0, sgst:0, total:0, rate:item.gstRate }
      const taxable = item.qty*item.unitPrice
      const gst = Math.round(taxable*item.gstRate/100)
      hsnMap[key].taxable += taxable
      hsnMap[key].cgst += gst/2
      hsnMap[key].sgst += gst/2
      hsnMap[key].total += gst
    })
  })

  const rows = Object.values(hsnMap)
  const totTaxable = rows.reduce((s,r)=>s+r.taxable,0)
  const totGST = rows.reduce((s,r)=>s+r.total,0)

  const cols = [
    { key:'hsn', label:'GST Rate', width:120 },
    { key:'taxable', label:'Taxable Amount', align:'right', render:v=>formatINR(v) },
    { key:'cgst', label:'CGST', align:'right', render:v=>formatINR(v) },
    { key:'sgst', label:'SGST', align:'right', render:v=>formatINR(v) },
    { key:'total', label:'Total Tax', align:'right', render:v=><b>{formatINR(v)}</b> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={['print','export']}
        onAction={a=>{ if(a==='export') addToast('GSTR-1 exported','info') }}
      >
        <select value={month} onChange={e=>setMonth(e.target.value)} style={{ height:28, fontSize:12 }}>
          {Array.from({length:12},(_,i)=>{
            const m=String(i+1).padStart(2,'0')
            const name=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]
            return <option key={m} value={m}>{name}</option>
          })}
        </select>
        <select value={year} onChange={e=>setYear(e.target.value)} style={{ height:28, fontSize:12 }}>
          {['2024','2025','2026'].map(y=><option key={y}>{y}</option>)}
        </select>
      </ActionToolbar>

      <div style={{ padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', gap:20 }}>
        <span style={{ fontSize:12 }}>{filtered.length} invoices | Taxable: <b style={{ color:'var(--gold)' }}>{formatINR(totTaxable)}</b> | GST: <b>{formatINR(totGST)}</b></span>
      </div>

      <div style={{ padding:'8px 12px', background:'var(--info-bg)', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontSize:11, color:'var(--info)', fontWeight:500 }}>GSTR-1 Summary — {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+month-1]} {year}</span>
      </div>

      <DataTable columns={cols} rows={rows} emptyMessage="No GST data for this period" emptyIcon={FileSpreadsheet} />
    </div>
  )
}
