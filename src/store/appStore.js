import { create } from 'zustand'
import { ITEMS, INVOICES, PURCHASE_ORDERS, VENDORS, EMPLOYEES,
         CUSTOMERS, LEDGER, ITEM_GROUPS, GST_UNITS } from '../data/seed'

export const useAppStore = create((set, get) => ({
  items: [...ITEMS],
  invoices: [...INVOICES],
  purchaseOrders: [...PURCHASE_ORDERS],
  vendors: [...VENDORS],
  employees: [...EMPLOYEES],
  customers: [...CUSTOMERS],
  ledger: [...LEDGER],
  itemGroups: [...ITEM_GROUPS],
  gstUnits: [...GST_UNITS],
  salesReturns: [],
  purchaseReturns: [],

  addItem: (item) => set(s => ({ items: [{ ...item, id:'i'+Date.now() }, ...s.items] })),
  updateItem: (id, data) => set(s => ({ items: s.items.map(i => i.id===id ? {...i,...data} : i) })),
  deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id!==id) })),
  adjustStock: (id, delta) => set(s => ({
    items: s.items.map(i => i.id===id ? {...i, stockQty: Math.max(0, i.stockQty+delta)} : i)
  })),

  addInvoice: (inv) => set(s => {
    const updatedItems = s.items.map(item => {
      const li = inv.items.find(i => i.itemId === item.id)
      return li ? { ...item, stockQty: Math.max(0, item.stockQty - li.qty) } : item
    })
    return { invoices: [inv, ...s.invoices], items: updatedItems }
  }),
  updateInvoiceStatus: (id, status) => set(s => ({
    invoices: s.invoices.map(i => i.id===id ? {...i, status} : i)
  })),

  addPO: (po) => set(s => ({ purchaseOrders: [po, ...s.purchaseOrders] })),
  receivePO: (id) => set(s => {
    const po = s.purchaseOrders.find(p => p.id===id)
    const updatedItems = s.items.map(item => {
      const li = po?.items?.find(i => i.itemId===item.id)
      return li ? { ...item, stockQty: item.stockQty + li.qty } : item
    })
    return {
      purchaseOrders: s.purchaseOrders.map(p =>
        p.id===id ? {...p, status:'received', receivedDate:new Date().toISOString()} : p),
      items: updatedItems
    }
  }),

  addSalesReturn: (ret) => set(s => {
    const updatedItems = s.items.map(item => {
      const li = ret.items.find(i => i.itemId===item.id)
      return li ? { ...item, stockQty: item.stockQty + li.qty } : item
    })
    return { salesReturns: [ret, ...s.salesReturns], items: updatedItems }
  }),

  addPurchaseReturn: (ret) => set(s => {
    const updatedItems = s.items.map(item => {
      const li = ret.items.find(i => i.itemId===item.id)
      return li ? { ...item, stockQty: Math.max(0, item.stockQty - li.qty) } : item
    })
    return { purchaseReturns: [ret, ...s.purchaseReturns], items: updatedItems }
  }),

  addVendor: (v) => set(s => ({ vendors: [{ ...v, id:'v'+Date.now() }, ...s.vendors] })),
  updateVendor: (id, data) => set(s => ({ vendors: s.vendors.map(v => v.id===id?{...v,...data}:v) })),
  recordVendorPayment: (id, amount) => set(s => ({
    vendors: s.vendors.map(v => v.id===id ? {...v, outstanding: Math.max(0,v.outstanding-amount)} : v)
  })),
  addCustomer: (c) => set(s => ({ customers: [{ ...c, id:'c'+Date.now() }, ...s.customers] })),
  updateCustomer: (id, data) => set(s => ({ customers: s.customers.map(c => c.id===id?{...c,...data}:c) })),
  addEmployee: (e) => set(s => ({ employees: [{ ...e, id:'e'+Date.now() }, ...s.employees] })),
  updateEmployee: (id, data) => set(s => ({ employees: s.employees.map(e => e.id===id?{...e,...data}:e) })),

  addLedgerEntry: (entry) => set(s => ({ ledger: [entry, ...s.ledger] })),
}))
