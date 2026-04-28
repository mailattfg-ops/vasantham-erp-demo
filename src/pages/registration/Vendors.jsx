import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate, nextCode } from '../../utils/format'
import { Truck, Plus, Pencil } from 'lucide-react'

export function Vendors() {
  const vendors = useAppStore(s=>s.vendors)
  const purchaseOrders = useAppStore(s=>s.purchaseOrders)
  const { addVendor, updateVendor, recordVendorPayment } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('Details')
  const [form, setForm] = useState({ name:'', category:'', phone:'', gstin:'', outstanding:0, status:'active' })
  const [selected, setSelected] = useState(null)
  const [payAmt, setPayAmt] = useState('')
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const cols = [
    { key:'code', label:'Code', width:90 },
    { key:'name', label:'Name', sortable:true },
    { key:'category', label:'Category' },
    { key:'phone', label:'Phone' },
    { key:'gstin', label:'GSTIN' },
    {
      key:'outstanding', label:'Outstanding', align:'right', sortable:true,
      render:v=><span style={{ color:v>0?'var(--danger)':'var(--success)', fontWeight:700 }}>{formatINR(v)}</span>
    },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
    {
      key:'id', label:'', sortable:false,
      render:(_,row)=>(
        <button onClick={e=>{e.stopPropagation();setForm({...row});setTab('Details');setModal('edit')}} style={{ color:'var(--ink-400)', padding:4 }}>
          <Pencil size={13}/>
        </button>
      )
    }
  ]

  const handleSave = () => {
    if(!form.name){ addToast('Name required','error'); return }
    if(modal==='new'){
      addVendor({ ...form, code: nextCode(vendors,'VND') })
      addToast('Vendor added')
    } else {
      updateVendor(form.id, form)
      addToast('Vendor updated')
    }
    setModal(null)
  }

  const handlePayment = () => {
    const a = parseFloat(payAmt)
    if(!a||a<=0){ addToast('Enter valid amount','error'); return }
    recordVendorPayment(form.id, a)
    addToast(`Payment of ${formatINR(a)} recorded`)
    setPayAmt('')
  }

  const vendPOs = selected ? purchaseOrders.filter(p=>p.vendorId===selected.id) : []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Vendor',icon:Plus,primary:true},'edit','delete']}
        onAction={a=>{
          if(a==='new vendor'){ setForm({name:'',category:'',phone:'',gstin:'',outstanding:0,status:'active'}); setTab('Details'); setModal('new') }
          if(a==='edit'&&selected){ setForm({...selected}); setTab('Details'); setModal('edit') }
        }}
      />
      <DataTable columns={cols} rows={vendors} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No vendors" emptyIcon={Truck} />

      {modal && (
        <Modal title={modal==='new'?'New Vendor':form.name} onClose={()=>setModal(null)} width={560}
          toolbar={
            <div style={{ display:'flex', gap:6 }}>
              {['Details','Purchase History'].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{
                  padding:'4px 12px', borderRadius:4, fontSize:12, cursor:'pointer',
                  background:tab===t?'var(--gold)':'transparent',
                  color:tab===t?'#fff':'var(--ink-600)',
                  border:tab===t?'none':'1px solid var(--border)', fontWeight:tab===t?600:400
                }}>{t}</button>
              ))}
            </div>
          }
        >
          <div style={{ padding:20 }}>
            {tab==='Details' && (
              <>
                <FormField label="Name" required><FieldInput value={form.name} onChange={e=>set('name',e.target.value)}/></FormField>
                <FormField label="Category"><FieldInput value={form.category||''} onChange={e=>set('category',e.target.value)}/></FormField>
                <FormField label="Phone"><FieldInput value={form.phone||''} onChange={e=>set('phone',e.target.value)}/></FormField>
                <FormField label="GSTIN"><FieldInput value={form.gstin||''} onChange={e=>set('gstin',e.target.value)}/></FormField>
                <FormField label="Status">
                  <FieldSelect value={form.status} onChange={e=>set('status',e.target.value)}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </FieldSelect>
                </FormField>
                {form.outstanding > 0 && (
                  <div style={{ background:'var(--warning-bg)', border:'1px solid var(--warning)', borderRadius:6, padding:12, marginTop:12 }}>
                    <div style={{ fontSize:12, color:'var(--warning)', fontWeight:600, marginBottom:8 }}>
                      Outstanding: {formatINR(form.outstanding)}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <input
                        type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)}
                        placeholder="Payment amount" style={{ flex:1, height:28, fontSize:13 }}
                      />
                      <button onClick={handlePayment} style={{
                        padding:'0 12px', background:'var(--warning)', color:'#fff',
                        border:'none', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer'
                      }}>Record Payment</button>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
                  <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
                  <button onClick={handleSave} style={{ padding:'6px 16px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Save</button>
                </div>
              </>
            )}
            {tab==='Purchase History' && (
              <div>
                {vendPOs.length===0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0', color:'var(--ink-400)' }}>No purchase orders</div>
                ) : (
                  <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'var(--surface-2)' }}>
                        {['PO No','Date','Total','Status'].map(h=>(
                          <th key={h} style={{ padding:'6px 10px', textAlign:h==='Total'?'right':'left', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vendPOs.map(po=>(
                        <tr key={po.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'6px 10px', fontWeight:600 }}>{po.poNumber}</td>
                          <td style={{ padding:'6px 10px' }}>{formatDate(po.date)}</td>
                          <td style={{ padding:'6px 10px', textAlign:'right', fontWeight:700 }}>{formatINR(po.total)}</td>
                          <td style={{ padding:'6px 10px' }}><StatusBadge status={po.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
