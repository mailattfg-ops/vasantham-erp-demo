import { useState } from 'react'
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react'

export function DataTable({
  columns, rows, onRowClick, selectedId,
  emptyMessage = 'No records found', emptyIcon: EmptyIcon = Inbox,
  stickyHeader = true
}) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortCol(key); setSortDir('asc') }
  }

  const sorted = sortCol
    ? [...rows].sort((a,b) => {
        const av = a[sortCol], bv = b[sortCol]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      })
    : rows

  return (
    <div style={{ overflowX:'auto', overflowY:'auto', flex:1 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{
            background:'var(--toolbar-bg)',
            position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 2
          }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{
                  padding: '8px 12px', textAlign: col.align || 'left',
                  fontSize: 11, fontWeight: 600, color:'var(--ink-400)',
                  textTransform:'uppercase', letterSpacing:'.05em',
                  borderBottom:'1px solid var(--border)',
                  cursor: col.sortable!==false ? 'pointer' : 'default',
                  whiteSpace:'nowrap', userSelect:'none',
                  width: col.width
                }}
              >
                <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                  {col.label}
                  {col.sortable !== false && sortCol===col.key && (
                    sortDir==='asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding:'48px 12px', textAlign:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <EmptyIcon size={32} style={{ color:'var(--ink-200)' }} />
                  <span style={{ color:'var(--ink-400)', fontSize:13 }}>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : sorted.map((row, i) => {
            const isSelected = row.id === selectedId
            return (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{
                  background: isSelected ? 'var(--gold-100)' : i%2===0 ? 'var(--surface)' : 'var(--surface-2)',
                  borderLeft: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition:'background .1s'
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background='var(--gold-50)' }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--gold-100)' : i%2===0?'var(--surface)':'var(--surface-2)' }}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding:'6px 12px', borderBottom:'1px solid var(--border)',
                    textAlign: col.align || 'left', whiteSpace: col.wrap ? 'normal' : 'nowrap'
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
