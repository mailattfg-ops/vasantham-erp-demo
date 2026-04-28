import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate } from '../../utils/format'
import { RotateCcw, Plus, Search } from 'lucide-react'

export function SalesReturns() {
  const { salesReturns, invoices, addSalesReturn } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(false)
  const [invSearch, setInvSearch] = useState('')
  const [srcInv, setSrcInv] = useState(null)
  const [lines, setLines] = useState([])
  const [reason, setReason] = useState('')

  const cols = [
    { key:'returnNo', label:'Return No', sortable:true },
    { key:'originalInvoice', label:'Original Invoice' },
    { key:'customerName', label:'Customer' },
    { key:'date', label:'Date', render:v=>formatDate(v) },
    { key:'total', label:'Total', align:'right', render:v=>formatINR(v) },
    { key:'status', label:'Status', render:v=><StatusBadge status={v||'received'} /> },
  ]

  const matchInvoice = () => {
    const inv = invoices.find(i=>i.invoiceNo.toLowerCase()===invSearch.toLowerCase())
    if(!inv){ addToast('Invoice not found','error'); return }
    setSrcInv(inv)
    setLines(inv.items.map(l=>({...l,returnQty:l.qty})))
  }

  const handleSave = () => {
    if(!srcInv){ addToast('Select an invoice first','error'); return }
    const total = lines.reduce((s,l)=>s+l.returnQty*l.unitPrice,0)
    const ret = {
      id:'ret'+Date.now(),
      returnNo:'RET-'+String(salesReturns.length+1).padStart(4,'0'),
      originalInvoice: srcInv.invoiceNo,
      customerId: srcInv.customerId,
      customerName: srcInv.customerName,
      date: new Date().toISOString(),
      reason, total, status:'received',
      items: lines.map(l=>({...l,qty:+l.returnQty}))
    }
    addSalesReturn(ret)
    addToast('Sales return recorded')
    setModal(false); setSrcInv(null); setLines([]); setReason(''); setInvSearch('')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Return',icon:Plus,primary:true}]}
        onAction={a=>{ if(a==='new return') setModal(true) }}
      />
      <DataTable columns={cols} rows={salesReturns} emptyMessage="No sales returns" emptyIcon={RotateCcw} />

      {modal && (
        <Modal title="New Sales Return" onClose={()=>setModal(false)} width={600}>
          <div style={{ padding:20 }}>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={invSearch} onChange={e=>setInvSearch(e.target.value)}
                placeholder="Enter invoice number (e.g. INV-0892)"
                style={{ flex:1, height:32, fontSize:13 }}/>
              <button onClick={matchInvoice} style={{
                padding:'0 14px', background:'var(--gold)', color:'#fff',
                border:'none', borderRadius:4, fontSize:13, fontWeight:600, cursor:'pointer'
              }}>Find</button>
            </div>

            {srcInv && (
              <>
                <div style={{ background:'var(--surface-2)', borderRadius:6, padding:10, marginBottom:14, fontSize:12 }}>
                  <b>{srcInv.invoiceNo}</b> — {srcInv.customerName} — {formatDate(srcInv.date)} — {formatINR(srcInv.total)}
                </div>
                <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:12 }}>
                  <thead>
                    <tr style={{ background:'var(--toolbar-bg)' }}>
                      {['Item','Orig Qty','Return Qty'].map(h=>(
                        <th key={h} style={{ padding:'4px 8px', textAlign:'left', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'5px 8px' }}>{l.name}</td>
                        <td style={{ padding:'5px 8px' }}>{l.qty} {l.unit}</td>
                        <td style={{ padding:'5px 8px' }}>
                          <input type="number" value={l.returnQty} min={0} max={l.qty}
                            onChange={e=>setLines(ls=>ls.map((x,j)=>j===i?{...x,returnQty:+e.target.value}:x))}
                            style={{ width:60, height:24, fontSize:12, textAlign:'center' }}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <FormField label="Reason">
                  <FieldInput value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for return" />
                </FormField>
              </>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
              <button onClick={()=>setModal(false)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'6px 18px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Record Return</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
