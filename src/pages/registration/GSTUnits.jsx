import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { FormField, FieldInput } from '../../components/shared/FormField'
import { Receipt, Plus, Pencil } from 'lucide-react'

export function GSTUnits() {
  const gstUnits = useAppStore(s=>s.gstUnits)
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name:'', sgst:0, cgst:0, igst:0, description:'' })
  const [selected, setSelected] = useState(null)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const cols = [
    { key:'name', label:'Name', sortable:true },
    { key:'sgst', label:'SGST %', align:'right', render:v=>`${v}%` },
    { key:'cgst', label:'CGST %', align:'right', render:v=>`${v}%` },
    { key:'igst', label:'IGST %', align:'right', render:v=>`${v}%` },
    { key:'description', label:'Description' },
    {
      key:'id', label:'Actions', sortable:false,
      render:(_,row)=>(
        <button onClick={e=>{e.stopPropagation();setForm({...row});setModal('edit')}}
          style={{ color:'var(--ink-400)', padding:4 }}>
          <Pencil size={13}/>
        </button>
      )
    }
  ]

  const handleSave = () => {
    if(!form.name) { addToast('Name required','error'); return }
    if(modal==='new') {
      useAppStore.setState(s=>({ gstUnits:[{...form,id:'gst'+Date.now()},...s.gstUnits]}))
      addToast('GST Unit added')
    } else {
      useAppStore.setState(s=>({ gstUnits: s.gstUnits.map(g=>g.id===form.id?{...g,...form}:g)}))
      addToast('GST Unit updated')
    }
    setModal(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New GST Unit',icon:Plus,primary:true},'edit','delete']}
        onAction={a=>{
          if(a==='new gst unit'){ setForm({name:'',sgst:0,cgst:0,igst:0,description:''}); setModal('new') }
          if(a==='edit'&&selected){ setForm({...selected}); setModal('edit') }
          if(a==='delete'&&selected){
            useAppStore.setState(s=>({gstUnits:s.gstUnits.filter(g=>g.id!==selected.id)}))
            setSelected(null); addToast('Deleted','info')
          }
        }}
      />
      <DataTable columns={cols} rows={gstUnits} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No GST units" emptyIcon={Receipt} />
      {modal && (
        <Modal title={modal==='new'?'New GST Unit':'Edit GST Unit'} onClose={()=>setModal(null)} width={400}>
          <div style={{ padding:20 }}>
            <FormField label="Name" required><FieldInput value={form.name} onChange={e=>set('name',e.target.value)}/></FormField>
            <FormField label="SGST %"><FieldInput type="number" value={form.sgst} onChange={e=>set('sgst',+e.target.value)}/></FormField>
            <FormField label="CGST %"><FieldInput type="number" value={form.cgst} onChange={e=>set('cgst',+e.target.value)}/></FormField>
            <FormField label="IGST %"><FieldInput type="number" value={form.igst} onChange={e=>set('igst',+e.target.value)}/></FormField>
            <FormField label="Description"><FieldInput value={form.description} onChange={e=>set('description',e.target.value)}/></FormField>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
              <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'6px 16px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
