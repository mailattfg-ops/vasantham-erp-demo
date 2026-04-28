export function FormField({ label, required, error, children, style: extraStyle }) {
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:8, marginBottom:10,
      ...extraStyle
    }}>
      <label style={{
        fontSize:12, color:'var(--ink-400)', textAlign:'right',
        minWidth:110, paddingTop:5, flexShrink:0
      }}>
        {label}{required && <span style={{ color:'var(--danger)', marginLeft:2 }}>*</span>}
      </label>
      <div style={{ flex:1 }}>
        {children}
        {error && <div style={{ fontSize:11, color:'var(--danger)', marginTop:2 }}>{error}</div>}
      </div>
    </div>
  )
}

export function FieldInput({ style: extraStyle, ...props }) {
  return (
    <input
      style={{ width:'100%', height:28, fontSize:13, ...extraStyle }}
      {...props}
    />
  )
}

export function FieldSelect({ children, style: extraStyle, ...props }) {
  return (
    <select style={{ width:'100%', height:28, fontSize:13, ...extraStyle }} {...props}>
      {children}
    </select>
  )
}
