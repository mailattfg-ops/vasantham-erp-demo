import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatINR, formatINRCompact, formatDate } from '../../utils/format'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LineChart as LCIcon } from 'lucide-react'

export function SalesReport() {
  const invoices = useAppStore(s=>s.invoices)
  const customers = useAppStore(s=>s.customers)
  const { addToast } = useToastStore()
  const [from, setFrom] = useState(new Date(Date.now()-30*86400000).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [custFilter, setCustFilter] = useState('all')

  const filtered = invoices.filter(i => {
    const ld = new Date(i.date).toISOString().split('T')[0]
    const mc = custFilter==='all' || i.customerId===custFilter
    return ld>=from && ld<=to && mc
  })

  const totalSales = filtered.reduce((s,i)=>s+i.total,0)
  const totalGST = filtered.reduce((s,i)=>s+i.gstAmount,0)

  const byDate = {}
  filtered.forEach(i => {
    const d = new Date(i.date).toISOString().split('T')[0]
    if(!byDate[d]) byDate[d]=0
    byDate[d]+=i.total
  })
  const chartData = Object.entries(byDate).sort().map(([date,total])=>({ date:date.slice(5), total }))

  const cols = [
    { key:'invoiceNo', label:'Invoice No', sortable:true },
    { key:'customerName', label:'Customer', sortable:true },
    { key:'saleType', label:'Type', render:v=><StatusBadge status={v} /> },
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'subtotal', label:'Taxable', align:'right', render:v=>formatINR(v) },
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
        <select value={custFilter} onChange={e=>setCustFilter(e.target.value)} style={{ height:28, fontSize:12 }}>
          <option value="all">All Customers</option>
          {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </ActionToolbar>

      <div style={{ padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', gap:20, alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--ink-400)' }}>{filtered.length} invoices</span>
        <span style={{ fontSize:12 }}>Total Sales: <b style={{ color:'var(--gold)' }}>{formatINR(totalSales)}</b></span>
        <span style={{ fontSize:12 }}>GST Collected: <b>{formatINR(totalGST)}</b></span>
      </div>

      {chartData.length > 0 && (
        <div style={{ padding:'12px 16px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} tickFormatter={v=>formatINRCompact(v)} />
              <Tooltip formatter={v=>formatINR(v)} />
              <Line type="monotone" dataKey="total" stroke="var(--gold)" strokeWidth={2} dot={{ fill:'var(--gold)', r:3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <DataTable columns={cols} rows={filtered} emptyMessage="No sales data" emptyIcon={LCIcon} />
    </div>
  )
}
