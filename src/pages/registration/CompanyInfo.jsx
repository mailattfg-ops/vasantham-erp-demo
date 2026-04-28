import { useState } from 'react'
import { COMPANY } from '../../data/seed'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { FormField, FieldInput } from '../../components/shared/FormField'
import { Building2 } from 'lucide-react'

export function CompanyInfo() {
  const { addToast } = useToastStore()
  const [form, setForm] = useState({ ...COMPANY })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={['save','print']}
        onAction={a=>{ if(a==='save') addToast('Company info saved') }}
      />
      <div style={{ flex:1, overflow:'auto', padding:24 }}>
        <div style={{ background:'var(--surface)', borderRadius:8, padding:24, maxWidth:600, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:48, height:48, background:'var(--gold)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Building2 size={24} style={{ color:'#0F1117' }} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--ink)' }}>
                {form.name}
              </div>
              <div style={{ fontSize:12, color:'var(--ink-400)' }}>GST: {form.gstin}</div>
            </div>
          </div>

          <FormField label="Company Name" required>
            <FieldInput value={form.name} onChange={e=>set('name',e.target.value)} />
          </FormField>
          <FormField label="Address">
            <textarea value={form.address} onChange={e=>set('address',e.target.value)}
              rows={2} style={{ width:'100%', padding:'4px 8px', fontSize:13, borderRadius:3, border:'1px solid var(--border-input)', resize:'vertical' }} />
          </FormField>
          <FormField label="Phone">
            <FieldInput value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </FormField>
          <FormField label="Email">
            <FieldInput type="email" value={form.email} onChange={e=>set('email',e.target.value)} />
          </FormField>
          <FormField label="GSTIN">
            <FieldInput value={form.gstin} onChange={e=>set('gstin',e.target.value)} />
          </FormField>
          <FormField label="PAN">
            <FieldInput value={form.pan} onChange={e=>set('pan',e.target.value)} />
          </FormField>
          <FormField label="Financial Year">
            <FieldInput value={form.financialYear} onChange={e=>set('financialYear',e.target.value)} />
          </FormField>

          <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
            <button onClick={()=>addToast('Company info saved')} style={{
              padding:'6px 20px', background:'var(--gold)', color:'#fff',
              border:'none', borderRadius:4, fontWeight:600, fontSize:13, cursor:'pointer'
            }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
