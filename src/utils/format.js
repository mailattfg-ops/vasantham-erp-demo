export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2 }).format(n||0)

export const formatINRCompact = (n) =>
  n >= 100000 ? `₹${(n/100000).toFixed(1)}L` :
  n >= 1000   ? `₹${(n/1000).toFixed(1)}K`   : `₹${n||0}`

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

export const formatDateShort = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })

export const formatTime = () =>
  new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })

export const nextInvoiceNo = (invoices) => {
  if (!invoices.length) return 'INV-0001'
  const max = Math.max(...invoices.map(i => parseInt(i.invoiceNo.split('-')[1]||0)))
  return 'INV-' + String(max+1).padStart(4,'0')
}

export const nextPONo = (pos) => {
  if (!pos.length) return 'PO-0001'
  const max = Math.max(...pos.map(p => parseInt(p.poNumber.split('-')[1]||0)))
  return 'PO-' + String(max+1).padStart(4,'0')
}

export const nextCode = (list, prefix) => {
  if (!list.length) return `${prefix}-001`
  const max = Math.max(...list.map(i => parseInt(i.code?.split('-').pop()||0)))
  return `${prefix}-` + String(max+1).padStart(3,'0')
}

export const getStockStatus = (item) => {
  if (item.stockQty === 0)               return 'out'
  if (item.stockQty <= item.minStock)    return 'critical'
  if (item.stockQty <= item.minStock*2)  return 'low'
  return 'normal'
}

export const calcGST = (qty, unitPrice, gstRate) => {
  const taxableValue = qty * unitPrice
  const gstAmount    = Math.round(taxableValue * gstRate / 100)
  return { taxableValue, gstAmount, cgst: gstAmount/2, sgst: gstAmount/2,
           lineTotal: taxableValue + gstAmount }
}
