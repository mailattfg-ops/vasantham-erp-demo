import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate, nextPONo } from '../../utils/format'
import { ShoppingBag, Plus, Trash2, CheckCircle } from 'lucide-react'

export function Purchases() {
  const { purchaseOrders, items, vendors, addPO, receivePO } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ vendorId:'v01', paymentMode:'bank', date:new Date().toISOString().split('T')[0], lines:[] })

  const addLine = () => setForm(f=>({...f,lines:[...f.lines,{itemId:'',name:'',qty:1,unitPrice:0,gstRate:5}]}))
  const removeLine = i => setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}))
  const setLine = (i,k,v) => setForm(f=>({
    ...f, lines:f.lines.map((l,j)=>{
      if(j!==i) return l
      if(k==='itemId'){
        const item=items.find(it=>it.id===v)
        return item?{...l,itemId:v,name:item.name,gstRate:item.gstRate,unitPrice:item.purchasePrice}:{...l,itemId:v}
      }
      return {...l,[k]:v}
    })
  }))

  const subtotal = form.lines.reduce((s,l)=>s+l.qty*l.unitPrice,0)
  const gstTotal = form.lines.reduce((s,l)=>s+Math.round(l.qty*l.unitPrice*l.gstRate/100),0)
  const total = subtotal+gstTotal

  const handleSave = () => {
    if(form.lines.length===0){ addToast('Add items','error'); return }
    const vendor=vendors.find(v=>v.id===form.vendorId)
    const po={
      id:'po'+Date.now(), poNumber:nextPONo(purchaseOrders),
      vendorId:form.vendorId, vendorName:vendor?.name||'',
      total, gstAmount:gstTotal, status:'pending',
      date:new Date(form.date).toISOString(), receivedDate:null,
      items:form.lines.map(l=>({...l,qty:+l.qty,unitPrice:+l.unitPrice,lineTotal:+l.qty*+l.unitPrice+Math.round(+l.qty*+l.unitPrice*+l.gstRate/100)}))
    }
    addPO(po)
    addToast(`${po.poNumber} created`)
    setModal(null)
  }

  const handleReceive = (po) => {
    receivePO(po.id)
    addToast(`${po.poNumber} marked received — stock updated`)
    setSelected(null)
  }

  const cols = [
    { key:'poNumber', label:'PO Number', sortable:true, width:110 },
    { key:'vendorName', label:'Vendor', sortable:true },
    { key:'date', label:'Date', render:v=>formatDate(v), sortable:true },
    { key:'total', label:'Total', align:'right', render:v=><b>{formatINR(v)}</b>, sortable:true },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
    {
      key:'id', label:'Action', sortable:false,
      render:(_,row)=> row.status==='pending' ? (
        <button onClick={e=>{e.stopPropagation();handleReceive(row)}} style={{
          display:'flex', alignItems:'center', gap:4, padding:'3px 10px',
          background:'var(--success-bg)', color:'var(--success)',
          border:'1px solid var(--success)', borderRadius:4, fontSize:11, fontWeight:600, cursor:'pointer'
        }}>
          <CheckCircle size={11}/> Receive
        </button>
      ) : null
    }
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New PO',icon:Plus,primary:true},'print','export']}
        onAction={a=>{
          if(a==='new po'){
            setForm({vendorId:'v01',paymentMode:'bank',date:new Date().toISOString().split('T')[0],lines:[]})
            setModal('new')
          }
        }}
      />
      <DataTable columns={cols} rows={purchaseOrders} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No purchase orders" emptyIcon={ShoppingBag} />

      {modal==='new' && (
        <Modal title="New Purchase Order" onClose={()=>setModal(null)} width={680}>
          <div style={{ padding:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px', marginBottom:16 }}>
              <FormField label="Vendor">
                <FieldSelect value={form.vendorId} onChange={e=>setForm(f=>({...f,vendorId:e.target.value}))}>
                  {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                </FieldSelect>
              </FormField>
              <FormField label="Date">
                <FieldInput type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
              </FormField>
            </div>

            <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600 }}>Items</span>
              <button onClick={addLine} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontSize:11, cursor:'pointer', fontWeight:600 }}>
                <Plus size={11}/> Add Item
              </button>
            </div>

            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:12 }}>
              <thead>
                <tr style={{ background:'var(--toolbar-bg)' }}>
                  {['Item','Qty','Rate','GST%','Total',''].map(h=>(
                    <th key={h} style={{ padding:'4px 6px', textAlign:h===''?'center':'left', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
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
                    <td style={{ padding:'4px 6px', fontSize:12, textAlign:'center' }}>{l.gstRate}%</td>
                    <td style={{ padding:'4px 6px', fontWeight:700 }}>
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
              <div style={{ fontSize:12, color:'var(--ink-400)' }}>Total items: {form.lines.length}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--gold)' }}>Total: {formatINR(total)}</div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16, paddingTop:12, borderTop:'1px solid var(--border)' }}>
              <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'6px 18px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Create PO</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
