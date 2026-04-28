import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate, nextInvoiceNo, calcGST } from '../../utils/format'
import { FileText, Plus, Trash2, Search } from 'lucide-react'

export function Sales() {
  const { invoices, items, customers, addInvoice, updateInvoiceStatus } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [form, setForm] = useState({
    customerId:'c01', saleType:'retail', paymentMode:'cash',
    date: new Date().toISOString().split('T')[0], lines:[]
  })

  const filtered = invoices.filter(i => {
    const ms = !search || i.invoiceNo.toLowerCase().includes(search.toLowerCase()) || i.customerName.toLowerCase().includes(search.toLowerCase())
    const mst = statusFilter==='all' || i.status===statusFilter
    return ms && mst
  })

  const addLine = () => setForm(f=>({...f, lines:[...f.lines, {itemId:'',name:'',qty:1,unit:'piece',unitPrice:0,gstRate:5}]}))
  const removeLine = (i) => setForm(f=>({...f, lines:f.lines.filter((_,idx)=>idx!==i)}))
  const setLine = (i,k,v) => setForm(f=>({
    ...f, lines:f.lines.map((l,idx)=>{
      if(idx!==i) return l
      if(k==='itemId'){
        const item = items.find(it=>it.id===v)
        return item ? {...l,itemId:v,name:item.name,unit:item.unit,unitPrice:item.retailPrice,gstRate:item.gstRate} : {...l,itemId:v}
      }
      return {...l,[k]:v}
    })
  }))

  const subtotal = form.lines.reduce((s,l)=>s+l.qty*l.unitPrice,0)
  const gstTotal = form.lines.reduce((s,l)=>s+Math.round(l.qty*l.unitPrice*l.gstRate/100),0)
  const grandTotal = subtotal + gstTotal

  const handleSave = () => {
    if(form.lines.length===0){ addToast('Add at least one item','error'); return }
    const cust = customers.find(c=>c.id===form.customerId)
    const inv = {
      id:'inv'+Date.now(),
      invoiceNo: nextInvoiceNo(invoices),
      customerId: form.customerId,
      customerName: cust?.name||'',
      saleType: form.saleType,
      subtotal, gstAmount:gstTotal, total:grandTotal,
      paymentMode: form.paymentMode,
      status: 'paid',
      date: new Date(form.date).toISOString(),
      items: form.lines.map(l=>({
        itemId:l.itemId, name:l.name, qty:+l.qty, unit:l.unit,
        unitPrice:+l.unitPrice, gstRate:+l.gstRate,
        sgst:Math.round(l.qty*l.unitPrice*l.gstRate/100)/2,
        cgst:Math.round(l.qty*l.unitPrice*l.gstRate/100)/2,
        gstAmount:Math.round(l.qty*l.unitPrice*l.gstRate/100),
        lineTotal:+l.qty*+l.unitPrice+Math.round(l.qty*l.unitPrice*l.gstRate/100)
      }))
    }
    addInvoice(inv)
    addToast(`Invoice ${inv.invoiceNo} created`)
    setModal(null)
  }

  const cols = [
    { key:'invoiceNo', label:'Invoice No', sortable:true, width:110 },
    { key:'customerName', label:'Customer', sortable:true },
    { key:'saleType', label:'Type', render:v=><StatusBadge status={v} /> },
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'subtotal', label:'Taxable', align:'right', render:v=>formatINR(v) },
    { key:'gstAmount', label:'GST', align:'right', render:v=>formatINR(v) },
    { key:'total', label:'Total', align:'right', render:v=><b>{formatINR(v)}</b>, sortable:true },
    { key:'paymentMode', label:'Mode', render:v=>v?.toUpperCase() },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Invoice',icon:Plus,primary:true},'print','export']}
        onAction={a=>{
          if(a==='new invoice'){
            setForm({customerId:'c01',saleType:'retail',paymentMode:'cash',date:new Date().toISOString().split('T')[0],lines:[]})
            setModal('new')
          }
          if(a==='print') window.print()
          if(a==='export') addToast('Exported','info')
        }}
      >
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ width:180, paddingLeft:26, height:28, fontSize:12 }}/>
          </div>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ height:28, fontSize:12 }}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </ActionToolbar>

      <DataTable columns={cols} rows={filtered} onRowClick={r=>{setSelected(r);setDetailOpen(true)}}
        selectedId={selected?.id} emptyMessage="No invoices" emptyIcon={FileText} />

      {detailOpen && selected && (
        <Modal title={`Invoice — ${selected.invoiceNo}`} onClose={()=>setDetailOpen(false)} width={560}
          toolbar={
            <div style={{ display:'flex', gap:6 }}>
              {['pending','paid','overdue'].map(s=>(
                <button key={s} onClick={()=>{ updateInvoiceStatus(selected.id,s); setSelected({...selected,status:s}); addToast(`Status updated to ${s}`) }} style={{
                  padding:'3px 10px', borderRadius:4, fontSize:11, cursor:'pointer',
                  background:selected.status===s?'var(--gold)':'transparent',
                  color:selected.status===s?'#fff':'var(--ink-600)',
                  border:selected.status===s?'none':'1px solid var(--border)', fontWeight:selected.status===s?600:400,
                  textTransform:'capitalize'
                }}>{s}</button>
              ))}
            </div>
          }
        >
          <div style={{ padding:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16, fontSize:12 }}>
              <div><span style={{ color:'var(--ink-400)' }}>Customer:</span> <b>{selected.customerName}</b></div>
              <div><span style={{ color:'var(--ink-400)' }}>Date:</span> {formatDate(selected.date)}</div>
              <div><span style={{ color:'var(--ink-400)' }}>Type:</span> <StatusBadge status={selected.saleType} /></div>
              <div><span style={{ color:'var(--ink-400)' }}>Payment:</span> {selected.paymentMode?.toUpperCase()}</div>
            </div>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--toolbar-bg)' }}>
                  {['Item','Qty','Rate','GST','Total'].map(h=>(
                    <th key={h} style={{ padding:'5px 8px', textAlign:h==='Item'?'left':'right', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.items?.map((item,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'5px 8px' }}>{item.name}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right' }}>{item.qty} {item.unit}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right' }}>{formatINR(item.unitPrice)}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right' }}>{formatINR(item.gstAmount||0)}</td>
                    <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:700 }}>{formatINR(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:3, fontSize:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--ink-400)' }}>Subtotal</span><span>{formatINR(selected.subtotal)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--ink-400)' }}>CGST</span><span>{formatINR(selected.gstAmount/2)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--ink-400)' }}>SGST</span><span>{formatINR(selected.gstAmount/2)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, paddingTop:6, borderTop:'2px solid var(--border)' }}>
                <span>Total</span><span style={{ color:'var(--gold)' }}>{formatINR(selected.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'new' && (
        <Modal title="New Sales Invoice" onClose={()=>setModal(null)} width={700}>
          <div style={{ padding:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px', marginBottom:16 }}>
              <FormField label="Customer">
                <FieldSelect value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))}>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </FieldSelect>
              </FormField>
              <FormField label="Type">
                <FieldSelect value={form.saleType} onChange={e=>setForm(f=>({...f,saleType:e.target.value}))}>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="pos">POS</option>
                </FieldSelect>
              </FormField>
              <FormField label="Payment">
                <FieldSelect value={form.paymentMode} onChange={e=>setForm(f=>({...f,paymentMode:e.target.value}))}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="cheque">Cheque</option>
                </FieldSelect>
              </FormField>
            </div>

            <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600 }}>Line Items</span>
              <button onClick={addLine} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontSize:11, cursor:'pointer', fontWeight:600 }}>
                <Plus size={11}/> Add Item
              </button>
            </div>

            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:12 }}>
              <thead>
                <tr style={{ background:'var(--toolbar-bg)' }}>
                  {['Item','Qty','Rate','GST%','Total',''].map(h=>(
                    <th key={h} style={{ padding:'4px 6px', textAlign:h===''||h==='Qty'?'center':'left', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.lines.map((l,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'4px 6px' }}>
                      <select value={l.itemId} onChange={e=>setLine(i,'itemId',e.target.value)} style={{ width:'100%', height:26, fontSize:12 }}>
                        <option value="">Select item...</option>
                        {items.map(it=><option key={it.id} value={it.id}>{it.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'4px 6px' }}>
                      <input type="number" value={l.qty} min={1} onChange={e=>setLine(i,'qty',+e.target.value)} style={{ width:50, height:26, fontSize:12, textAlign:'center' }}/>
                    </td>
                    <td style={{ padding:'4px 6px' }}>
                      <input type="number" value={l.unitPrice} onChange={e=>setLine(i,'unitPrice',+e.target.value)} style={{ width:80, height:26, fontSize:12 }}/>
                    </td>
                    <td style={{ padding:'4px 6px', textAlign:'center', fontSize:12 }}>{l.gstRate}%</td>
                    <td style={{ padding:'4px 6px', fontWeight:700, textAlign:'right' }}>
                      {formatINR(l.qty*l.unitPrice+Math.round(l.qty*l.unitPrice*l.gstRate/100))}
                    </td>
                    <td style={{ padding:'4px 6px', textAlign:'center' }}>
                      <button onClick={()=>removeLine(i)} style={{ color:'var(--danger)', padding:2 }}><Trash2 size={12}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:12, color:'var(--ink-400)' }}>
                Subtotal: {formatINR(subtotal)} | GST: {formatINR(gstTotal)}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--gold)' }}>Total: {formatINR(grandTotal)}</div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16, paddingTop:12, borderTop:'1px solid var(--border)' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'6px 18px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Create Invoice</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
