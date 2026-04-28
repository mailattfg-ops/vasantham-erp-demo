import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate, nextCode } from '../../utils/format'
import { Users, Plus, Pencil } from 'lucide-react'

export function Customers() {
  const customers = useAppStore(s=>s.customers)
  const invoices = useAppStore(s=>s.invoices)
  const { addCustomer, updateCustomer } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('Details')
  const [form, setForm] = useState({ name:'', phone:'', type:'retail', gstin:'', isActive:true })
  const [selected, setSelected] = useState(null)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const cols = [
    { key:'code', label:'Code', width:90 },
    { key:'name', label:'Name', sortable:true },
    { key:'type', label:'Type', render:v=><StatusBadge status={v} /> },
    { key:'phone', label:'Phone', render:v=>v||'—' },
    { key:'gstin', label:'GSTIN', render:v=>v||'—' },
    { key:'isActive', label:'Status', render:v=><StatusBadge status={v?'active':'cancelled'} /> },
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
    if(!form.name) { addToast('Name required','error'); return }
    if(modal==='new') {
      addCustomer({ ...form, code: nextCode(customers,'CUST') })
      addToast('Customer added')
    } else {
      updateCustomer(form.id, form)
      addToast('Customer updated')
    }
    setModal(null)
  }

  const custInvoices = selected ? invoices.filter(i=>i.customerId===selected.id) : []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Customer',icon:Plus,primary:true},'edit','delete']}
        onAction={a=>{
          if(a==='new customer'){ setForm({name:'',phone:'',type:'retail',gstin:'',isActive:true}); setTab('Details'); setModal('new') }
          if(a==='edit'&&selected){ setForm({...selected}); setTab('Details'); setModal('edit') }
        }}
      />
      <DataTable columns={cols} rows={customers} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No customers" emptyIcon={Users} />

      {modal && (
        <Modal title={modal==='new'?'New Customer':form.name} onClose={()=>setModal(null)} width={560}
          toolbar={
            <div style={{ display:'flex', gap:6 }}>
              {['Details','Sales History'].map(t=>(
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
                <FormField label="Phone"><FieldInput value={form.phone||''} onChange={e=>set('phone',e.target.value)}/></FormField>
                <FormField label="Type">
                  <FieldSelect value={form.type} onChange={e=>set('type',e.target.value)}>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="walkin">Walk-in</option>
                  </FieldSelect>
                </FormField>
                <FormField label="GSTIN"><FieldInput value={form.gstin||''} onChange={e=>set('gstin',e.target.value)}/></FormField>
                <FormField label="Active">
                  <FieldSelect value={form.isActive?'yes':'no'} onChange={e=>set('isActive',e.target.value==='yes')}>
                    <option value="yes">Yes</option><option value="no">No</option>
                  </FieldSelect>
                </FormField>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
                  <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
                  <button onClick={handleSave} style={{ padding:'6px 16px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Save</button>
                </div>
              </>
            )}
            {tab==='Sales History' && (
              <div>
                {custInvoices.length===0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0', color:'var(--ink-400)' }}>No invoices found</div>
                ) : (
                  <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'var(--surface-2)' }}>
                        <th style={{ padding:'6px 10px', textAlign:'left', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Invoice</th>
                        <th style={{ padding:'6px 10px', textAlign:'left', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Date</th>
                        <th style={{ padding:'6px 10px', textAlign:'right', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Total</th>
                        <th style={{ padding:'6px 10px', fontSize:11, color:'var(--ink-400)', fontWeight:600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {custInvoices.map(inv=>(
                        <tr key={inv.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'6px 10px', fontWeight:600 }}>{inv.invoiceNo}</td>
                          <td style={{ padding:'6px 10px' }}>{formatDate(inv.date)}</td>
                          <td style={{ padding:'6px 10px', textAlign:'right', fontWeight:700 }}>{formatINR(inv.total)}</td>
                          <td style={{ padding:'6px 10px' }}><StatusBadge status={inv.status}/></td>
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
