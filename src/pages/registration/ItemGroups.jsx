import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { Layers, Plus, Pencil } from 'lucide-react'

export function ItemGroups() {
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name:'', category:'Silk Fabrics', itemCount:0 })
  const [selected, setSelected] = useState(null)

  const cols = [
    { key:'name', label:'Group Name', sortable:true },
    { key:'category', label:'Category', sortable:true },
    { key:'itemCount', label:'Item Count', align:'right', sortable:true },
    {
      key:'id', label:'Actions', sortable:false,
      render:(_,row) => (
        <button onClick={e=>{e.stopPropagation(); setForm({...row}); setModal('edit')}}
          style={{ color:'var(--ink-400)', padding:4 }}>
          <Pencil size={13}/>
        </button>
      )
    }
  ]

  const handleSave = () => {
    if(!form.name) { addToast('Name required','error'); return }
    if(modal==='new') {
      useAppStore.setState(s=>({ itemGroups:[{...form,id:'ig'+Date.now()},...s.itemGroups]}))
      addToast('Group added')
    } else {
      useAppStore.setState(s=>({ itemGroups: s.itemGroups.map(g=>g.id===form.id?{...g,...form}:g)}))
      addToast('Group updated')
    }
    setModal(null)
  }

  const liveGroups = useAppStore(s=>s.itemGroups)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{ label:'New Group', icon:Plus, primary:true },'edit','delete']}
        onAction={a=>{
          if(a==='new group') { setForm({name:'',category:'Silk Fabrics',itemCount:0}); setModal('new') }
          if(a==='edit'&&selected) { setForm({...selected}); setModal('edit') }
          if(a==='delete'&&selected) {
            useAppStore.setState(s=>({ itemGroups: s.itemGroups.filter(g=>g.id!==selected.id)}))
            setSelected(null); addToast('Group deleted','info')
          }
        }}
      />
      <DataTable columns={cols} rows={liveGroups} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No item groups" emptyIcon={Layers} />

      {modal && (
        <Modal title={modal==='new'?'New Item Group':'Edit Group'} onClose={()=>setModal(null)} width={400}>
          <div style={{ padding:20 }}>
            <FormField label="Group Name" required>
              <FieldInput value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </FormField>
            <FormField label="Category">
              <FieldSelect value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {['Silk Fabrics','Cotton Fabrics','Kurta','Accessories','Synthetic'].map(c=><option key={c}>{c}</option>)}
              </FieldSelect>
            </FormField>
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
