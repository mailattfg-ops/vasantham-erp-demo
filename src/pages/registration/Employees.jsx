import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { nextCode } from '../../utils/format'
import { UserCheck, Plus, Pencil } from 'lucide-react'

const MODULES = ['Dashboard','Inventory','POS','Sales','Purchases','Reports','MIS','Accounts']

export function Employees() {
  const employees = useAppStore(s=>s.employees)
  const { addEmployee, updateEmployee } = useAppStore()
  const { addToast } = useToastStore()
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('Details')
  const [form, setForm] = useState({ name:'', department:'', role:'staff', phone:'', status:'active' })
  const [selected, setSelected] = useState(null)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const cols = [
    { key:'code', label:'Code', width:90 },
    { key:'name', label:'Name', sortable:true },
    { key:'department', label:'Department' },
    { key:'role', label:'Role', render:v=><StatusBadge status={v} /> },
    { key:'phone', label:'Phone' },
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
    const initials = form.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
    if(modal==='new'){
      addEmployee({ ...form, code:nextCode(employees,'EMP'), initials })
      addToast('Employee added')
    } else {
      updateEmployee(form.id, { ...form, initials })
      addToast('Employee updated')
    }
    setModal(null)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Employee',icon:Plus,primary:true},'edit','delete']}
        onAction={a=>{
          if(a==='new employee'){ setForm({name:'',department:'',role:'staff',phone:'',status:'active'}); setTab('Details'); setModal('new') }
          if(a==='edit'&&selected){ setForm({...selected}); setTab('Details'); setModal('edit') }
        }}
      />
      <DataTable columns={cols} rows={employees} onRowClick={setSelected} selectedId={selected?.id}
        emptyMessage="No employees" emptyIcon={UserCheck} />

      {modal && (
        <Modal title={modal==='new'?'New Employee':form.name} onClose={()=>setModal(null)} width={520}
          toolbar={
            <div style={{ display:'flex', gap:6 }}>
              {['Details','Access'].map(t=>(
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
                <FormField label="Full Name" required><FieldInput value={form.name} onChange={e=>set('name',e.target.value)}/></FormField>
                <FormField label="Department"><FieldInput value={form.department||''} onChange={e=>set('department',e.target.value)}/></FormField>
                <FormField label="Phone"><FieldInput value={form.phone||''} onChange={e=>set('phone',e.target.value)}/></FormField>
                <FormField label="Role">
                  <FieldSelect value={form.role} onChange={e=>set('role',e.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </FieldSelect>
                </FormField>
                <FormField label="Status">
                  <FieldSelect value={form.status} onChange={e=>set('status',e.target.value)}>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </FieldSelect>
                </FormField>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
                  <button onClick={()=>setModal(null)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
                  <button onClick={handleSave} style={{ padding:'6px 16px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Save</button>
                </div>
              </>
            )}
            {tab==='Access' && (
              <div>
                <div style={{ fontSize:12, color:'var(--ink-400)', marginBottom:12 }}>Module access for {form.role==='admin'?'Admin (Full Access)':'Staff'}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {MODULES.map(mod=>(
                    <label key={mod} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, padding:'6px 8px', background:'var(--surface-2)', borderRadius:4 }}>
                      <input type="checkbox" defaultChecked={form.role==='admin'} readOnly />
                      {mod}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
