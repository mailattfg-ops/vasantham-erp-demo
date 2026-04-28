import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { FormField, FieldInput } from '../../components/shared/FormField'
import { formatINR, formatDate } from '../../utils/format'
import { RotateCcw, Plus } from 'lucide-react'
import { StatusBadge } from '../../components/shared/StatusBadge'

export function PurchaseReturns() {
  const { purchaseReturns, purchaseOrders, addPurchaseReturn } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(false)
  const [poSearch, setPoSearch] = useState('')
  const [srcPO, setSrcPO] = useState(null)
  const [lines, setLines] = useState([])
  const [reason, setReason] = useState('')

  const cols = [
    { key:'returnNo', label:'Return No' },
    { key:'originalPO', label:'Original PO' },
    { key:'vendorName', label:'Vendor' },
    { key:'date', label:'Date', render:v=>formatDate(v) },
    { key:'total', label:'Total', align:'right', render:v=>formatINR(v) },
  ]

  const matchPO = () => {
    const po = purchaseOrders.find(p=>p.poNumber.toLowerCase()===poSearch.toLowerCase())
    if(!po){ addToast('PO not found','error'); return }
    setSrcPO(po); setLines(po.items.map(l=>({...l,returnQty:l.qty})))
  }

  const handleSave = () => {
    if(!srcPO){ addToast('Find a PO first','error'); return }
    const total = lines.reduce((s,l)=>s+l.returnQty*(l.unitPrice||0),0)
    const ret = {
      id:'pret'+Date.now(),
      returnNo:'PRET-'+String(purchaseReturns.length+1).padStart(4,'0'),
      originalPO:srcPO.poNumber, vendorId:srcPO.vendorId, vendorName:srcPO.vendorName,
      date:new Date().toISOString(), reason, total,
      items:lines.map(l=>({...l,qty:+l.returnQty}))
    }
    addPurchaseReturn(ret)
    addToast('Purchase return recorded')
    setModal(false); setSrcPO(null); setLines([]); setReason(''); setPoSearch('')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Return',icon:Plus,primary:true}]}
        onAction={a=>{ if(a==='new return') setModal(true) }}
      />
      <DataTable columns={cols} rows={purchaseReturns} emptyMessage="No purchase returns" emptyIcon={RotateCcw} />

      {modal && (
        <Modal title="New Purchase Return" onClose={()=>setModal(false)} width={580}>
          <div style={{ padding:20 }}>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={poSearch} onChange={e=>setPoSearch(e.target.value)}
                placeholder="Enter PO number (e.g. PO-0156)"
                style={{ flex:1, height:32, fontSize:13 }}/>
              <button onClick={matchPO} style={{ padding:'0 14px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:600, cursor:'pointer' }}>Find</button>
            </div>
            {srcPO && (
              <>
                <div style={{ background:'var(--surface-2)', borderRadius:6, padding:10, marginBottom:14, fontSize:12 }}>
                  <b>{srcPO.poNumber}</b> — {srcPO.vendorName} — {formatDate(srcPO.date)} — {formatINR(srcPO.total)}
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
                        <td style={{ padding:'5px 8px' }}>{l.qty}</td>
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
                  <FieldInput value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason" />
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
