import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useCartStore } from '../../store/cartStore'
import { useToastStore } from '../../store/toastStore'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Modal } from '../../components/shared/Modal'
import { formatINR, nextInvoiceNo, formatDate } from '../../utils/format'
import { Search, ShoppingCart, Trash2, Printer, Plus, Minus } from 'lucide-react'
import { COMPANY } from '../../data/seed'

const CATEGORIES = ['All','Silk Fabrics','Cotton Fabrics','Kurta','Accessories','Synthetic']
const PRICE_TYPES = ['retail','wholesale']
const PAYMENT_MODES = ['cash','upi','card','bank']

export function POS() {
  const items = useAppStore(s=>s.items)
  const customers = useAppStore(s=>s.customers)
  const { addInvoice, invoices } = useAppStore()
  const cart = useCartStore()
  const { addToast } = useToastStore()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [invoiceModal, setInvoiceModal] = useState(null)
  const [custId, setCustId] = useState('c01')

  const filtered = items.filter(i => {
    const mc = cat==='All'||i.category===cat
    const ms = !search||i.name.toLowerCase().includes(search.toLowerCase())||i.sku.toLowerCase().includes(search.toLowerCase())
    return mc && ms && i.isActive
  })

  const handleAdd = (item) => {
    if(item.stockQty <= 0) { addToast('Out of stock','error'); return }
    cart.addItem(item)
  }

  const handleGenerate = () => {
    if(cart.items.length===0){ addToast('Cart is empty','error'); return }
    const cust = customers.find(c=>c.id===custId) || customers[0]
    const inv = {
      id: 'inv'+Date.now(),
      invoiceNo: nextInvoiceNo(invoices),
      customerId: cust.id,
      customerName: cust.name,
      saleType: 'pos',
      subtotal: cart.subtotal,
      gstAmount: cart.gstTotal,
      discount: cart.discount,
      total: cart.grandTotal,
      paymentMode: cart.paymentMode,
      status: 'paid',
      date: new Date().toISOString(),
      items: cart.items.map(i=>({
        itemId:i.itemId, name:i.name, qty:i.qty, unit:i.unit,
        unitPrice:i.unitPrice, gstRate:i.gstRate, sgst:i.sgst, cgst:i.cgst,
        gstAmount:Math.round(i.unitPrice*i.qty*i.gstRate/100),
        lineTotal:i.unitPrice*i.qty+Math.round(i.unitPrice*i.qty*i.gstRate/100)
      }))
    }
    addInvoice(inv)
    setInvoiceModal(inv)
    cart.clear()
    addToast(`Invoice ${inv.invoiceNo} generated!`)
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* LEFT — Item grid */}
      <div style={{ flex:'0 0 55%', display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)' }}>
        {/* Search & filter */}
        <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
          <div style={{ position:'relative', marginBottom:8 }}>
            <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search items by name or SKU..."
              style={{ width:'100%', paddingLeft:28, height:34, fontSize:13 }}/>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500,
                background:cat===c?'var(--gold)':'var(--surface-2)',
                color:cat===c?'#fff':'var(--ink-600)',
                border:cat===c?'none':'1px solid var(--border)', cursor:'pointer'
              }}>{c}</button>
            ))}
          </div>
        </div>
        {/* Grid */}
        <div style={{ flex:1, overflowY:'auto', padding:10, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, alignContent:'start' }}>
          {filtered.map(item => (
            <div key={item.id}
              onClick={()=>handleAdd(item)}
              style={{
                background:'var(--surface)', borderRadius:6, padding:'10px 10px 8px',
                cursor:item.stockQty>0?'pointer':'not-allowed',
                border:'1px solid var(--border)',
                opacity:item.stockQty>0?1:.5,
                transition:'all .12s'
              }}
              onMouseEnter={e=>{ if(item.stockQty>0) e.currentTarget.style.borderColor='var(--gold)' }}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ fontSize:22, marginBottom:4 }}>{item.emoji}</div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--ink)', lineHeight:1.3 }}>{item.name}</div>
              <div style={{ fontSize:10, color:'var(--ink-400)', marginBottom:6 }}>{item.sku}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--gold)' }}>{formatINR(item.retailPrice)}</div>
              <div style={{ fontSize:10, color:'var(--ink-400)' }}>MRP: {formatINR(item.mrp)}</div>
              <div style={{ fontSize:10, marginTop:3 }}>
                <StatusBadge status={item.stockQty>0?'active':'out'} label={item.stockQty>0?`${item.stockQty} ${item.unit}`:'Out'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div style={{ flex:'0 0 45%', display:'flex', flexDirection:'column', background:'var(--surface)' }}>
        {/* Cart header */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <ShoppingCart size={16} style={{ color:'var(--gold)' }} />
            <span style={{ fontWeight:600, fontSize:13 }}>Cart ({cart.items.length})</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {PRICE_TYPES.map(t=>(
              <button key={t} onClick={()=>cart.setPriceType(t)} style={{
                padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:500,
                background:cart.priceType===t?'var(--gold)':'var(--surface-2)',
                color:cart.priceType===t?'#fff':'var(--ink-400)',
                border:cart.priceType===t?'none':'1px solid var(--border)', cursor:'pointer',
                textTransform:'capitalize'
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Customer */}
        <div style={{ padding:'6px 14px', borderBottom:'1px solid var(--border)' }}>
          <select value={custId} onChange={e=>setCustId(e.target.value)} style={{ width:'100%', height:28, fontSize:12 }}>
            {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Cart items */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {cart.items.length===0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:8, color:'var(--ink-400)' }}>
              <ShoppingCart size={36} style={{ opacity:.3 }} />
              <div style={{ fontSize:13 }}>Add items to cart</div>
            </div>
          ) : (
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--toolbar-bg)' }}>
                  <th style={{ padding:'5px 10px', textAlign:'left', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>ITEM</th>
                  <th style={{ padding:'5px 8px', textAlign:'center', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>QTY</th>
                  <th style={{ padding:'5px 10px', textAlign:'right', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>PRICE</th>
                  <th style={{ padding:'5px 6px', textAlign:'right', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>TOTAL</th>
                  <th style={{ width:28 }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map(item=>(
                  <tr key={item.itemId} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'6px 10px' }}>
                      <div style={{ fontWeight:500 }}>{item.emoji} {item.name}</div>
                      <div style={{ fontSize:10, color:'var(--ink-400)' }}>{item.unit} · GST {item.gstRate}%</div>
                    </td>
                    <td style={{ padding:'5px 8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                        <button onClick={()=>cart.updateQty(item.itemId,item.qty-1)} style={{ width:20, height:20, borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Minus size={10}/>
                        </button>
                        <input type="number" value={item.qty} min={1}
                          onChange={e=>cart.updateQty(item.itemId,+e.target.value)}
                          style={{ width:36, textAlign:'center', height:22, fontSize:12, padding:'0 2px' }}/>
                        <button onClick={()=>cart.updateQty(item.itemId,item.qty+1)} style={{ width:20, height:20, borderRadius:4, background:'var(--surface-2)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Plus size={10}/>
                        </button>
                      </div>
                    </td>
                    <td style={{ padding:'6px 10px', textAlign:'right' }}>
                      <input type="number" value={item.unitPrice}
                        onChange={e=>cart.updatePrice(item.itemId, e.target.value)}
                        style={{ width:70, textAlign:'right', height:22, fontSize:12 }}/>
                    </td>
                    <td style={{ padding:'6px 10px', textAlign:'right', fontWeight:700 }}>
                      {formatINR(item.unitPrice*item.qty)}
                    </td>
                    <td style={{ padding:'4px 6px' }}>
                      <button onClick={()=>cart.removeItem(item.itemId)} style={{ color:'var(--danger)', padding:3 }}>
                        <Trash2 size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals & Payment */}
        <div style={{ borderTop:'1px solid var(--border)', padding:'10px 14px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink-400)' }}>
              <span>Subtotal</span><span>{formatINR(cart.subtotal)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink-400)' }}>
              <span>GST</span><span>{formatINR(cart.gstTotal)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink-400)' }}>
              <span>Discount</span>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                <span>₹</span>
                <input type="number" value={cart.discount} min={0}
                  onChange={e=>cart.setDiscount(+e.target.value)}
                  style={{ width:60, height:20, fontSize:12, textAlign:'right' }}/>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, paddingTop:6, borderTop:'1px solid var(--border)' }}>
              <span>TOTAL</span><span style={{ color:'var(--gold)' }}>{formatINR(cart.grandTotal)}</span>
            </div>
          </div>

          {/* Payment mode */}
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {PAYMENT_MODES.map(m=>(
              <button key={m} onClick={()=>cart.setPaymentMode(m)} style={{
                padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:500,
                background:cart.paymentMode===m?'var(--sidebar-bg)':'var(--surface-2)',
                color:cart.paymentMode===m?'var(--gold)':'var(--ink-600)',
                border:cart.paymentMode===m?'1px solid var(--gold)':'1px solid var(--border)',
                cursor:'pointer', textTransform:'capitalize'
              }}>{m.toUpperCase()}</button>
            ))}
          </div>

          {cart.paymentMode==='cash' && (
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:12, color:'var(--ink-400)', minWidth:80 }}>Cash Tendered:</span>
              <input type="number" value={cart.cashTendered||''}
                onChange={e=>cart.setCashTendered(+e.target.value)}
                style={{ flex:1, height:28, fontSize:13, textAlign:'right' }}/>
              {cart.cashTendered > 0 && (
                <div style={{ fontSize:12, color:'var(--success)', fontWeight:700 }}>
                  Change: {formatINR(cart.change)}
                </div>
              )}
            </div>
          )}

          <button onClick={handleGenerate} style={{
            width:'100%', height:42, background:'var(--gold)', color:'#fff',
            border:'none', borderRadius:6, fontSize:14, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8
          }}>
            <Printer size={16}/> Generate Invoice
          </button>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {invoiceModal && (
        <Modal title={`Receipt — ${invoiceModal.invoiceNo}`} onClose={()=>setInvoiceModal(null)} width={480}
          toolbar={
            <button onClick={()=>window.print()} style={{
              display:'flex', alignItems:'center', gap:6, padding:'4px 12px',
              background:'var(--gold)', color:'#fff', border:'none', borderRadius:4,
              fontSize:12, fontWeight:600, cursor:'pointer'
            }}>
              <Printer size={13}/> Print
            </button>
          }
        >
          <InvoicePrint invoice={invoiceModal} />
        </Modal>
      )}
    </div>
  )
}

function InvoicePrint({ invoice }) {
  return (
    <div style={{ padding:20, fontFamily:'var(--font-body)', fontSize:12 }} id="print-invoice">
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--gold)' }}>{COMPANY.name}</div>
        <div style={{ fontSize:11, color:'var(--ink-400)' }}>{COMPANY.address}</div>
        <div style={{ fontSize:11, color:'var(--ink-400)' }}>GSTIN: {COMPANY.gstin} | Ph: {COMPANY.phone}</div>
        <div style={{ marginTop:8, borderTop:'2px solid var(--border)', paddingTop:8, fontWeight:700 }}>TAX INVOICE</div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, fontSize:11 }}>
        <div>
          <div><b>Invoice:</b> {invoice.invoiceNo}</div>
          <div><b>Date:</b> {formatDate(invoice.date)}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div><b>Customer:</b> {invoice.customerName}</div>
          <div><b>Payment:</b> {invoice.paymentMode?.toUpperCase()}</div>
        </div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, marginBottom:12 }}>
        <thead>
          <tr style={{ background:'var(--toolbar-bg)' }}>
            {['Item','Qty','Rate','GST%','GST Amt','Total'].map(h=>(
              <th key={h} style={{ padding:'4px 6px', textAlign:h==='Item'?'left':'right', borderBottom:'1px solid var(--border)', fontSize:10, color:'var(--ink-400)', fontWeight:600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item,i)=>(
            <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
              <td style={{ padding:'4px 6px' }}>{item.name}</td>
              <td style={{ padding:'4px 6px', textAlign:'right' }}>{item.qty} {item.unit}</td>
              <td style={{ padding:'4px 6px', textAlign:'right' }}>{formatINR(item.unitPrice)}</td>
              <td style={{ padding:'4px 6px', textAlign:'right' }}>{item.gstRate}%</td>
              <td style={{ padding:'4px 6px', textAlign:'right' }}>{formatINR(item.gstAmount||0)}</td>
              <td style={{ padding:'4px 6px', textAlign:'right', fontWeight:700 }}>{formatINR(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display:'flex', flexDirection:'column', gap:3, fontSize:11 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'var(--ink-400)' }}>Taxable Amount</span>
          <span>{formatINR(invoice.subtotal)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'var(--ink-400)' }}>CGST</span>
          <span>{formatINR(invoice.gstAmount/2)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'var(--ink-400)' }}>SGST</span>
          <span>{formatINR(invoice.gstAmount/2)}</span>
        </div>
        {invoice.discount > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'var(--ink-400)' }}>Discount</span>
            <span style={{ color:'var(--danger)' }}>-{formatINR(invoice.discount)}</span>
          </div>
        )}
        <div style={{
          display:'flex', justifyContent:'space-between',
          fontSize:14, fontWeight:700, paddingTop:6, borderTop:'2px solid var(--border)'
        }}>
          <span>TOTAL</span>
          <span style={{ color:'var(--gold)' }}>{formatINR(invoice.total)}</span>
        </div>
      </div>
      <div style={{ textAlign:'center', marginTop:14, fontSize:10, color:'var(--ink-400)', borderTop:'1px dashed var(--border)', paddingTop:10 }}>
        Thank you for shopping at {COMPANY.name}!<br/>
        Goods once sold will not be returned without valid receipt.
      </div>
    </div>
  )
}
