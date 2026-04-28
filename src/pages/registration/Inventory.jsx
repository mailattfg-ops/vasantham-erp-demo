import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useToastStore } from '../../store/toastStore'
import { ActionToolbar } from '../../components/shared/ActionToolbar'
import { DataTable } from '../../components/shared/DataTable'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatINR, getStockStatus, nextCode } from '../../utils/format'
import {
  Eye, Pencil, Search, Package, Plus, X, Save, Trash2,
  RotateCcw, Settings, Menu,
} from 'lucide-react'

/* ─── constants ─────────────────────────────────────── */
const CATEGORIES = ['All','Silk Fabrics','Cotton Fabrics','Kurta','Accessories','Synthetic']

const VAT_MAP = {
  'GST-5%':  { gstRate:5,  sgst:2.5, cgst:2.5, igst:5  },
  'GST-12%': { gstRate:12, sgst:6,   cgst:6,   igst:12 },
  'GST-18%': { gstRate:18, sgst:9,   cgst:9,   igst:18 },
}

const BLANK_FORM = {
  // header
  name:'', sku:'', itemGroup:'', unit:'pcs', barcode:'', isActive:true,
  vatSchedule:'GST-12%', gstRate:12, sgst:6, cgst:6, igst:12,
  // general
  alias:'', minStock:5, maxStock:50, measure:'Nos', itemType:'Standard',
  reorderQty:20, purchaseUnit:'pcs', hsn:'', eInvoiceHsn:'', decimals:0,
  minProfit:0, loyaltyPoint:0, onlineShopping:false, pluId:'',
  // groups
  taxGroup:'', floor:'', section:'', counter:'', firm:'', category:'', subCategory:'',
  // stock
  company:'', brand:'', size:'', mrp:0, purchasePrice:0, luc:0, stockQty:0,
  retailPrice:0, specialRetail:0, wholesalePrice:0,
  branchPrice:0, discount:0, others:'', location:'',
  // misc
  emoji:'🧵',
}

/* ─── main page component ────────────────────────────── */
export function Inventory() {
  const { items, addItem, updateItem, deleteItem } = useAppStore()
  const { addToast } = useToastStore()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // null | 'new' | 'edit'
  const [form, setForm] = useState(BLANK_FORM)

  const filtered = items.filter(i => {
    const mc = cat === 'All' || i.category === cat
    const ms = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  const openNew = () => {
    setForm({ ...BLANK_FORM, sku: nextCode(items, 'VAS') })
    setModal('new')
  }

  const openEdit = (item) => {
    // map legacy seed fields → extended form fields
    setForm({
      ...BLANK_FORM, ...item,
      vatSchedule: item.gstRate === 5 ? 'GST-5%' : item.gstRate === 18 ? 'GST-18%' : 'GST-12%',
      igst: item.gstRate || 12,
      category: item.category || '',
      unit: item.unit === 'metre' ? 'metre' : item.unit === 'kg' ? 'kg' : item.unit === 'set' ? 'set' : 'pcs',
      measure: item.unit === 'metre' ? 'Mtr' : item.unit === 'kg' ? 'Kg' : 'Nos',
    })
    setModal('edit')
  }

  const handleSave = (f) => {
    if (!f.name.trim()) { addToast('Item Name is required', 'error'); return false }
    if (!f.sku.trim())  { addToast('Item Code is required', 'error'); return false }
    const mapped = {
      ...f,
      unit: f.unit === 'metre' ? 'metre' : f.unit === 'kg' ? 'kg' : f.unit === 'set' ? 'set' : 'piece',
    }
    if (modal === 'new') {
      addItem(mapped)
      addToast('Item saved successfully')
    } else {
      updateItem(f.id, mapped)
      addToast('Item updated successfully')
    }
    return true
  }

  const handleDeleteSelected = () => {
    if (!selected) { addToast('Select an item first', 'error'); return }
    if (!window.confirm(`Delete "${selected.name}"?`)) return
    deleteItem(selected.id)
    setSelected(null)
    addToast('Item deleted', 'info')
  }

  const cols = [
    {
      key:'name', label:'Item Details', sortable:true,
      render:(v,row) => (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>{row.emoji}</span>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>{row.name}</div>
            <div style={{ fontSize:11, color:'var(--ink-400)' }}>{row.sku}</div>
          </div>
        </div>
      )
    },
    { key:'category', label:'Category', width:130 },
    {
      key:'mrp', label:'MRP / Cost', align:'right', sortable:true,
      render:(v,row) => (
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:700 }}>{formatINR(row.mrp)}</div>
          <div style={{ fontSize:11, color:'var(--ink-400)' }}>Cost: {formatINR(row.purchasePrice)}</div>
        </div>
      )
    },
    {
      key:'stockQty', label:'Stock', align:'right', sortable:true,
      render:(v,row) => (
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:700 }}>{row.stockQty}</div>
          <div style={{ fontSize:11, color:'var(--ink-400)' }}>{row.unit}</div>
        </div>
      )
    },
    { key:'_status', label:'Status', sortable:false, render:(_,row) => <StatusBadge status={getStockStatus(row)} /> },
    {
      key:'id', label:'Actions', sortable:false,
      render:(_,row) => (
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={e=>{e.stopPropagation(); openEdit(row)}} style={{ color:'var(--ink-400)', padding:4 }} title="Edit">
            <Pencil size={13}/>
          </button>
          <button onClick={e=>{e.stopPropagation(); setSelected(row)}} style={{ color:'var(--gold)', padding:4 }} title="View">
            <Eye size={13}/>
          </button>
        </div>
      )
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <ActionToolbar
        buttons={[{ label:'New Item', icon:Plus, primary:true }, 'edit', 'delete', 'print', 'export']}
        onAction={a => {
          if (a === 'new item') openNew()
          if (a === 'edit' && selected) openEdit(selected)
          if (a === 'delete') handleDeleteSelected()
          if (a === 'print') window.print()
          if (a === 'export') addToast('Exported to CSV', 'info')
        }}
      >
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search items..." style={{ width:200, paddingLeft:26, height:28, fontSize:12 }}/>
          </div>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{ height:28, fontSize:12 }}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </ActionToolbar>

      <DataTable
        columns={cols} rows={filtered}
        onRowClick={r => setSelected(r === selected ? null : r)}
        selectedId={selected?.id}
        emptyMessage="No inventory items found" emptyIcon={Package}
      />

      {modal && (
        <ItemModal
          mode={modal}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onNew={openNew}
          onDelete={() => {
            if (modal === 'edit' && form.id) {
              if (!window.confirm(`Delete "${form.name}"?`)) return
              deleteItem(form.id)
              setSelected(null)
              addToast('Item deleted', 'info')
              setModal(null)
            }
          }}
        />
      )}
    </div>
  )
}

/* ─── Acro-Tex style modal ────────────────────────────── */
function ItemModal({ mode, form, setForm, onSave, onClose, onNew, onDelete }) {
  const [activeTab, setActiveTab] = useState('General')
  const [errors, setErrors]       = useState({})
  const nameRef = useRef(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleVatChange = (sched) => {
    const t = VAT_MAP[sched] || VAT_MAP['GST-12%']
    setForm(f => ({ ...f, vatSchedule: sched, ...t }))
  }

  const handleSgstChange = (v) => {
    const n = parseFloat(v) || 0
    setForm(f => ({ ...f, sgst: n, cgst: n, gstRate: n * 2, igst: n * 2 }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.sku.trim())  e.sku  = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) return
    const ok = onSave(form)
    if (ok) onClose()
  }

  const handleNew = () => {
    setForm({ ...BLANK_FORM })
    setActiveTab('General')
    setErrors({})
    nameRef.current?.focus()
  }

  return (
    <>
      <style>{`
        .hf-row { display:flex; align-items:center; gap:5px; min-height:26px; }
        .hf-row label { font-size:11px; font-weight:500; color:var(--ink-600); min-width:78px; text-align:right; flex-shrink:0; }
        .hf-input {
          height:22px; padding:0 5px;
          border:1px solid var(--border-input); border-radius:var(--r-xs);
          font-size:12px; font-family:var(--font-body); color:var(--ink);
          background:var(--surface); min-width:120px;
        }
        .hf-input.wide  { min-width:0; flex:1; }
        .hf-input.short { min-width:48px; width:48px; }
        .hf-input:focus { outline:none; border-color:var(--gold); background:var(--gold-50); }
        .hf-input.err   { border-color:var(--danger); }
        .hf-select {
          height:22px; padding:0 4px;
          border:1px solid var(--border-input); border-radius:var(--r-xs);
          font-size:12px; font-family:var(--font-body); min-width:100px;
          background:var(--surface); color:var(--ink);
        }
        .hf-select.short { min-width:64px; width:64px; }
        .hf-select:focus { outline:none; border-color:var(--gold); }
        .itm-tbbtn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          width:52px; height:44px; gap:3px;
          border:1px solid var(--border); border-radius:var(--r-xs);
          background:var(--surface); cursor:pointer;
          font-size:10px; color:var(--ink-400);
          transition:all 120ms; flex-shrink:0;
        }
        .itm-tbbtn:hover { border-color:var(--gold); background:var(--gold-50); color:var(--gold-700); }
        .itm-tbbtn.primary { background:var(--gold); border-color:var(--gold); color:#fff; }
        .itm-tbbtn.primary:hover { background:var(--gold-700); }
        .itm-tbbtn.danger:hover  { background:var(--danger-bg); border-color:var(--danger); color:var(--danger); }
      `}</style>

      {/* Overlay — no close on click outside */}
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
      }}>
        <div style={{
          width:680, maxHeight:'88vh', background:'var(--surface)',
          borderRadius:4, boxShadow:'0 8px 32px rgba(0,0,0,.35)',
          display:'flex', flexDirection:'column', overflow:'hidden'
        }}>

          {/* ── Title bar ── */}
          <div style={{
            background:'var(--sidebar-bg)', padding:'6px 10px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            userSelect:'none', flexShrink:0
          }}>
            <span style={{ fontSize:13, fontWeight:500, color:'var(--gold)', fontFamily:'var(--font-body)' }}>
              Inventory Items
            </span>
            <div style={{ display:'flex', gap:3 }}>
              {['−','□'].map(ch => (
                <button key={ch} style={{
                  width:22, height:18, fontSize:11, border:'1px solid rgba(255,255,255,.15)',
                  borderRadius:2, background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.5)',
                  cursor:'default', display:'flex', alignItems:'center', justifyContent:'center'
                }}>{ch}</button>
              ))}
              <button onClick={onClose} style={{
                width:22, height:18, fontSize:11, border:'1px solid rgba(255,80,80,.3)',
                borderRadius:2, background:'rgba(255,80,80,.15)', color:'#ff6b6b',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
              }}>✕</button>
            </div>
          </div>

          {/* ── Toolbar row ── */}
          <div style={{
            display:'flex', gap:3, padding:'5px 8px',
            background:'var(--toolbar-bg)', borderBottom:'1px solid var(--border-dark)',
            flexShrink:0, flexWrap:'wrap'
          }}>
            <button className="itm-tbbtn" onClick={onClose}><X size={13}/><span>Close</span></button>
            <button className="itm-tbbtn primary" onClick={save}><Save size={13}/><span>Save</span></button>
            <button className="itm-tbbtn" onClick={handleNew}><Plus size={13}/><span>New</span></button>
            <button className="itm-tbbtn danger" onClick={onDelete}><Trash2 size={13}/><span>Delete</span></button>
            <button className="itm-tbbtn"><Pencil size={13}/><span>Change</span></button>
            <button className="itm-tbbtn"><RotateCcw size={13}/><span>Default</span></button>
            <button className="itm-tbbtn"><Settings size={13}/><span>Options</span></button>
            <button className="itm-tbbtn"><Menu size={13}/><span>Menu ▾</span></button>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex:1, overflowY:'auto' }}>

            {/* ── Header fields (always visible) ── */}
            <div style={{
              padding:'10px 14px 8px', borderBottom:'1px solid var(--border)',
              background:'var(--surface)', flexShrink:0
            }}>
              {/* Row 1: Item Name */}
              <div className="hf-row" style={{ marginBottom:5 }}>
                <label>Item Name</label>
                <input ref={nameRef}
                  className={`hf-input wide${errors.name?' err':''}`}
                  value={form.name} onChange={e=>{ set('name',e.target.value); setErrors(er=>({...er,name:''})) }}
                  placeholder="Enter item name"
                />
                <LookupBtn />
              </div>
              {errors.name && <div style={{ fontSize:10, color:'var(--danger)', marginLeft:83, marginBottom:3 }}>{errors.name}</div>}

              {/* 2-col grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 20px' }}>

                {/* left: Item Code */}
                <div className="hf-row">
                  <label>Item Code</label>
                  <input className={`hf-input wide${errors.sku?' err':''}`}
                    value={form.sku} onChange={e=>{ set('sku',e.target.value); setErrors(er=>({...er,sku:''})) }}/>
                </div>
                {/* right: VAT Schedule + Tax% */}
                <div className="hf-row">
                  <label>VAT Schedule</label>
                  <select className="hf-select" value={form.vatSchedule} onChange={e=>handleVatChange(e.target.value)}>
                    <option>GST-5%</option><option>GST-12%</option><option>GST-18%</option>
                  </select>
                  <label style={{ marginLeft:6, minWidth:'auto' }}>Tax%</label>
                  <input className="hf-input short" readOnly value={form.gstRate}/>
                </div>

                {/* left: Item Group */}
                <div className="hf-row">
                  <label>Item Group</label>
                  <input className="hf-input wide" value={form.itemGroup} onChange={e=>set('itemGroup',e.target.value)}/>
                  <LookupBtn />
                </div>
                {/* right: Schedule */}
                <div className="hf-row">
                  <label>Schedule</label>
                  <select className="hf-select wide" value={form.taxGroup||''} onChange={e=>set('taxGroup',e.target.value)}>
                    <option value="">— none —</option>
                    <option>Standard</option><option>Exempt</option><option>Zero Rated</option>
                  </select>
                </div>

                {/* left: Unit */}
                <div className="hf-row">
                  <label>Unit</label>
                  <select className="hf-select short" value={form.unit} onChange={e=>set('unit',e.target.value)}>
                    <option value="pcs">pcs</option>
                    <option value="metre">metre</option>
                    <option value="kg">kg</option>
                    <option value="set">set</option>
                  </select>
                  <LookupBtn />
                </div>
                {/* right: SGST / CGST / IGST */}
                <div className="hf-row" style={{ gap:4 }}>
                  <label>SGST%</label>
                  <input className="hf-input short" value={form.sgst}
                    onChange={e=>handleSgstChange(e.target.value)}/>
                  <label style={{ minWidth:'auto' }}>CGST%</label>
                  <input className="hf-input short" readOnly value={form.cgst}/>
                  <label style={{ minWidth:'auto' }}>IGST</label>
                  <input className="hf-input short" readOnly value={form.igst}/>
                </div>

                {/* left: EAN Code + Active */}
                <div className="hf-row" style={{ gridColumn:'1/-1' }}>
                  <label>EAN Code</label>
                  <input className="hf-input" value={form.barcode} onChange={e=>set('barcode',e.target.value)}/>
                  <label style={{ minWidth:'auto', marginLeft:12 }}>Active</label>
                  <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)}
                    style={{ marginLeft:4, width:13, height:13, accentColor:'var(--gold)', cursor:'pointer' }}/>
                </div>

              </div>
            </div>

            {/* ── Tab row ── */}
            <div style={{
              display:'flex', background:'var(--surface-2)',
              borderBottom:'1px solid var(--border)', padding:'0 14px', flexShrink:0
            }}>
              {['General','Groups','Stock'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding:'7px 20px', fontSize:12,
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontFamily:'var(--font-body)',
                  color: activeTab === tab ? 'var(--gold-700)' : 'var(--ink-400)',
                  background:'transparent', border:'none',
                  borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                  cursor:'pointer', marginBottom:-1, transition:'all 120ms',
                }}>{tab}</button>
              ))}
            </div>

            {/* ── Tab content ── */}
            {activeTab === 'General' && <GeneralTab form={form} set={set}/>}
            {activeTab === 'Groups'  && <GroupsTab  form={form} set={set}/>}
            {activeTab === 'Stock'   && <StockTab   form={form} set={set} onSave={save} onDelete={onDelete}/>}

          </div>{/* end scrollable body */}
        </div>
      </div>
    </>
  )
}

/* ─── Tab: General ───────────────────────────────────── */
function GeneralTab({ form, set }) {
  return (
    <div style={{ padding:'12px 14px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 24px' }}>

        <div className="hf-row" style={{ gridColumn:'1/-1' }}>
          <label>Alias</label>
          <input className="hf-input wide" value={form.alias||''} onChange={e=>set('alias',e.target.value)}/>
          <LookupBtn />
        </div>

        <div className="hf-row">
          <label>Min,Max Stock</label>
          <input className="hf-input short" type="number" value={form.minStock} onChange={e=>set('minStock',+e.target.value)}/>
          <input className="hf-input short" type="number" value={form.maxStock} onChange={e=>set('maxStock',+e.target.value)} style={{ marginLeft:3 }}/>
        </div>
        <div className="hf-row">
          <label>Measure</label>
          <select className="hf-select" value={form.measure||'Nos'} onChange={e=>set('measure',e.target.value)}>
            <option>Nos</option><option>Mtr</option><option>Kg</option>
          </select>
        </div>

        <div className="hf-row">
          <label>Item Type</label>
          <select className="hf-select" value={form.itemType||'Standard'} onChange={e=>set('itemType',e.target.value)}>
            <option>Standard</option><option>Service</option><option>Composite</option>
          </select>
        </div>
        <div className="hf-row">
          <label>PLU ID,EXP Days</label>
          <input className="hf-input short" value={form.pluId||''} onChange={e=>set('pluId',e.target.value)}/>
          <input type="checkbox" checked={!!form.expDays} onChange={e=>set('expDays',e.target.checked)}
            style={{ marginLeft:6, width:13, height:13, accentColor:'var(--gold)' }}/>
        </div>

        <div className="hf-row">
          <label>Reorder Qty</label>
          <input className="hf-input" type="number" value={form.reorderQty} onChange={e=>set('reorderQty',+e.target.value)}/>
        </div>
        <div className="hf-row">
          <label>Purchase Unit</label>
          <input className="hf-input" value={form.purchaseUnit||''} onChange={e=>set('purchaseUnit',e.target.value)}/>
          <LookupBtn />
        </div>

        <div className="hf-row">
          <label>HSN Code</label>
          <input className="hf-input" value={form.hsn||''} onChange={e=>set('hsn',e.target.value)}/>
        </div>
        <div className="hf-row">
          <label>Decimals</label>
          <select className="hf-select short" value={form.decimals||0} onChange={e=>set('decimals',+e.target.value)}>
            <option value={0}>0</option><option value={1}>1</option>
            <option value={2}>2</option><option value={3}>3</option>
          </select>
        </div>

        <div className="hf-row">
          <label>E-Invoice hsn</label>
          <input className="hf-input" value={form.eInvoiceHsn||''} onChange={e=>set('eInvoiceHsn',e.target.value)}/>
        </div>
        <div className="hf-row">
          <label>Min Profit</label>
          <input className="hf-input" type="number" value={form.minProfit||0} onChange={e=>set('minProfit',+e.target.value)}/>
        </div>

        <div className="hf-row">
          <label>Loyalty Point</label>
          <input className="hf-input" type="number" value={form.loyaltyPoint||0} onChange={e=>set('loyaltyPoint',+e.target.value)}/>
        </div>
        <div className="hf-row">
          <input type="checkbox" checked={!!form.onlineShopping} onChange={e=>set('onlineShopping',e.target.checked)}
            style={{ width:13, height:13, accentColor:'var(--gold)', marginLeft:82 }}/>
          <label style={{ textAlign:'left', minWidth:'auto', marginLeft:5 }}>Online Shopping</label>
        </div>

      </div>
    </div>
  )
}

/* ─── Tab: Groups ────────────────────────────────────── */
function GroupsTab({ form, set }) {
  const fields = [
    { label:'Tax Group',    key:'taxGroup' },
    { label:'Floor',        key:'floor' },
    { label:'Section',      key:'section' },
    { label:'Counter',      key:'counter' },
    { label:'Firm',         key:'firm' },
    { label:'Category',     key:'category' },
    { label:'Sub Category', key:'subCategory' },
  ]
  return (
    <div style={{ padding:'12px 14px' }}>
      {fields.map(({ label, key }) => (
        <div key={key} className="hf-row" style={{ marginBottom:6 }}>
          <label style={{ minWidth:90 }}>{label}</label>
          <input
            className="hf-input wide"
            value={form[key]||''}
            onChange={e=>set(key, e.target.value)}
          />
          <LookupBtn />
        </div>
      ))}
    </div>
  )
}

/* ─── Tab: Stock ─────────────────────────────────────── */
function StockTab({ form, set, onSave, onDelete }) {
  const pricingRows = [
    { label:'Retail',         key:'retailPrice' },
    { label:'Special Retail', key:'specialRetail' },
    { label:'Whole Sale',     key:'wholesalePrice' },
    { label:'Branch',         key:'branchPrice' },
    { label:'Discount',       key:'discount' },
    { label:'Others',         key:'others' },
    { label:'Location',       key:'location' },
  ]

  return (
    <div style={{ padding:'12px 14px' }}>

      {/* Barcode + Size */}
      <div className="hf-row" style={{ marginBottom:5 }}>
        <label>Barcode</label>
        <select className="hf-select" style={{ width:48, minWidth:48 }}>
          <option>0</option><option>1</option><option>2</option>
        </select>
        <input className="hf-input" style={{ flex:1 }} value={form.barcode||''} onChange={e=>set('barcode',e.target.value)}/>
        <label style={{ marginLeft:8, minWidth:'auto' }}>Size</label>
        <input className="hf-input short" value={form.size||''} onChange={e=>set('size',e.target.value)}/>
      </div>

      {/* Company */}
      <div className="hf-row" style={{ marginBottom:5 }}>
        <label>Company</label>
        <input className="hf-input wide" value={form.company||''} onChange={e=>set('company',e.target.value)}/>
        <LookupBtn />
      </div>

      {/* Brand */}
      <div className="hf-row" style={{ marginBottom:5 }}>
        <label>Brand</label>
        <input className="hf-input wide" value={form.brand||''} onChange={e=>set('brand',e.target.value)}/>
        <LookupBtn />
      </div>

      <div style={{ borderTop:'1px solid var(--border)', margin:'8px 0' }}/>

      {/* Two-column: cost fields (left) + pricing + save/delete (right) */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px', alignItems:'start' }}>

        {/* Left: cost fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <div className="hf-row">
            <label>MRP</label>
            <input className="hf-input short" type="number" value={form.mrp||0} onChange={e=>set('mrp',+e.target.value)}/>
            <label style={{ marginLeft:8, minWidth:'auto' }}>P.Price</label>
            <input className="hf-input short" type="number" value={form.purchasePrice||0} onChange={e=>set('purchasePrice',+e.target.value)}/>
          </div>
          <div className="hf-row">
            <label>LUC</label>
            <input className="hf-input short" type="number" value={form.luc||0} onChange={e=>set('luc',+e.target.value)}/>
            <label style={{ marginLeft:8, minWidth:'auto' }}>Stock Qty</label>
            <input className="hf-input short" type="number" value={form.stockQty||0}
              onChange={e=>set('stockQty',+e.target.value)}
              style={{ border:'1px solid var(--warning)' }}
              title="Adjust via stock adjustment, not here"/>
          </div>
          <div className="hf-row">
            <label>Min Stock</label>
            <input className="hf-input short" type="number" value={form.minStock||0} onChange={e=>set('minStock',+e.target.value)}/>
          </div>
        </div>

        {/* Right: pricing rows + save/delete inline */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {pricingRows.map(({ label, key }, i) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <label style={{ fontSize:11, color:'var(--ink-600)', minWidth:90, textAlign:'right', flexShrink:0 }}>{label}</label>
              <input
                className="hf-input short"
                style={{ width:72, minWidth:72 }}
                type={key === 'location' || key === 'others' ? 'text' : 'number'}
                value={form[key]||''}
                onChange={e=>set(key, e.target.value)}
              />
              {i === 0 && (
                <button onClick={onSave} style={{
                  marginLeft:4, padding:'2px 8px', height:22, fontSize:11,
                  background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-xs)', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:3, color:'var(--ink-600)',
                  whiteSpace:'nowrap'
                }}>
                  <Save size={11}/> Save
                </button>
              )}
              {i === 1 && (
                <button onClick={onDelete} style={{
                  marginLeft:4, padding:'2px 8px', height:22, fontSize:11,
                  background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-xs)', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:3, color:'var(--danger)',
                  whiteSpace:'nowrap'
                }}>
                  <X size={11}/> Delete
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

/* ─── LookupBtn ──────────────────────────────────────── */
function LookupBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width:22, height:22, border:'1px solid var(--border-input)',
      borderRadius:'var(--r-xs)', background:'var(--toolbar-bg)',
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:11, color:'var(--ink-400)', flexShrink:0,
    }}>↓</button>
  )
}
