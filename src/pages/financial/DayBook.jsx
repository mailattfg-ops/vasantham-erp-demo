import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { FormField, FieldInput, FieldSelect } from '../../components/shared/FormField'
import { formatINR, formatDate } from '../../utils/format'
import { BookOpen, Plus } from 'lucide-react'

export function DayBook() {
  const ledger = useAppStore(s=>s.ledger)
  const { addLedgerEntry } = useAppStore()
  const { addToast } = useToastStore()
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ particulars:'', head:'Cash', debit:0, credit:0 })
  const set = (k,v)=>setForm(f=>({...f,[k]:v}))

  const filtered = ledger.filter(l => {
    const ld = new Date(l.date).toISOString().split('T')[0]
    return ld === dateFilter
  })

  const totalDr = filtered.reduce((s,l)=>s+l.debit,0)
  const totalCr = filtered.reduce((s,l)=>s+l.credit,0)

  const cols = [
    { key:'particulars', label:'Particulars', sortable:true },
    { key:'head', label:'Account Head' },
    { key:'debit', label:'Debit (Dr)', align:'right', render:v=>v>0?<span style={{ color:'var(--danger)' }}>{formatINR(v)}</span>:'—' },
    { key:'credit', label:'Credit (Cr)', align:'right', render:v=>v>0?<span style={{ color:'var(--success)' }}>{formatINR(v)}</span>:'—' },
  ]

  const handleSave = () => {
    if(!form.particulars){ addToast('Particulars required','error'); return }
    addLedgerEntry({ id:'l'+Date.now(), date:new Date().toISOString(), ...form, debit:+form.debit, credit:+form.credit })
    addToast('Entry added')
    setModal(false)
    setForm({particulars:'',head:'Cash',debit:0,credit:0})
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{label:'New Entry',icon:Plus,primary:true},'print','export']}
        onAction={a=>{ if(a==='new entry') setModal(true) }}
      >
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label style={{ fontSize:12, color:'var(--ink-400)' }}>Date:</label>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{ height:28, fontSize:12 }}/>
        </div>
      </ActionToolbar>

      {/* Summary Row */}
      <div style={{ display:'flex', gap:12, padding:'8px 12px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
        <SumCard label="Total Debit" value={formatINR(totalDr)} color="var(--danger)" />
        <SumCard label="Total Credit" value={formatINR(totalCr)} color="var(--success)" />
        <SumCard label="Net" value={formatINR(totalCr-totalDr)} color={totalCr>=totalDr?'var(--success)':'var(--danger)'} />
        <SumCard label="Entries" value={filtered.length} color="var(--info)" />
      </div>

      <DataTable columns={cols} rows={filtered} emptyMessage="No entries for this date" emptyIcon={BookOpen} />

      {modal && (
        <Modal title="New Journal Entry" onClose={()=>setModal(false)} width={440}>
          <div style={{ padding:20 }}>
            <FormField label="Particulars" required><FieldInput value={form.particulars} onChange={e=>set('particulars',e.target.value)}/></FormField>
            <FormField label="Account Head">
              <FieldSelect value={form.head} onChange={e=>set('head',e.target.value)}>
                {['Cash','Bank','Sales','Purchase','GST Payable','Salary','Rent','Sundry'].map(h=><option key={h}>{h}</option>)}
              </FieldSelect>
            </FormField>
            <FormField label="Debit (Dr)"><FieldInput type="number" value={form.debit} onChange={e=>set('debit',e.target.value)}/></FormField>
            <FormField label="Credit (Cr)"><FieldInput type="number" value={form.credit} onChange={e=>set('credit',e.target.value)}/></FormField>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
              <button onClick={()=>setModal(false)} style={{ padding:'6px 16px', border:'1px solid var(--border)', borderRadius:4, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'6px 18px', background:'var(--gold)', color:'#fff', border:'none', borderRadius:4, fontWeight:600, cursor:'pointer' }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function SumCard({ label, value, color }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'4px 12px', background:'var(--surface-2)', borderRadius:4 }}>
      <span style={{ fontSize:10, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:700, color }}>{value}</span>
    </div>
  )
}
