import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [], discount: 0, paymentMode: 'cash', cashTendered: 0, priceType: 'retail',

  addItem: (item) => set(s => {
    const ex = s.items.find(i => i.itemId===item.id)
    const price = item[s.priceType+'Price'] || item.retailPrice
    if (ex) return { items: s.items.map(i => i.itemId===item.id ? {...i,qty:i.qty+1} : i) }
    return { items: [...s.items, { itemId:item.id, sku:item.sku, name:item.name,
      emoji:item.emoji, unit:item.unit, qty:1, unitPrice:price, gstRate:item.gstRate,
      sgst:item.sgst, cgst:item.cgst }] }
  }),
  updateQty: (id, qty) => set(s => ({
    items: qty<=0 ? s.items.filter(i=>i.itemId!==id) : s.items.map(i=>i.itemId===id?{...i,qty}:i)
  })),
  updatePrice: (id, price) => set(s => ({
    items: s.items.map(i => i.itemId===id ? {...i, unitPrice: parseFloat(price)||0} : i)
  })),
  removeItem: (id) => set(s => ({ items: s.items.filter(i=>i.itemId!==id) })),
  setDiscount: (d) => set({ discount: d }),
  setPaymentMode: (m) => set({ paymentMode: m }),
  setCashTendered: (v) => set({ cashTendered: v }),
  setPriceType: (t) => set(s => ({
    priceType: t,
    items: s.items // prices would ideally update here
  })),
  clear: () => set({ items:[], discount:0, cashTendered:0 }),

  get subtotal() { return get().items.reduce((s,i) => s+i.unitPrice*i.qty, 0) },
  get gstTotal() { return get().items.reduce((s,i) => s+Math.round(i.unitPrice*i.qty*i.gstRate/100), 0) },
  get grandTotal() { return get().subtotal + get().gstTotal - get().discount },
  get change() { return Math.max(0, get().cashTendered - get().grandTotal) },
}))
