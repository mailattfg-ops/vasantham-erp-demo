export function VasanthamLogo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:36, height:36, background:'var(--gold)',
        borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L17.5 6.5V13.5L10 18L2.5 13.5V6.5L10 2Z"
            stroke="#0F1117" strokeWidth="1.5" fill="none"/>
          <path d="M10 2V18M2.5 6.5L17.5 13.5M17.5 6.5L2.5 13.5"
            stroke="#0F1117" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="10" cy="10" r="2" fill="#0F1117"/>
        </svg>
      </div>
      <div>
        <div style={{
          fontFamily:'var(--font-display)', fontSize:16, fontWeight:700,
          color:'var(--gold)', lineHeight:1.1
        }}>Vasantham</div>
        <div style={{
          fontFamily:'var(--font-body)', fontSize:9, fontWeight:500,
          color:'rgba(201,149,42,0.55)', letterSpacing:'.1em',
          textTransform:'uppercase', marginTop:1
        }}>Textiles ERP</div>
      </div>
    </div>
  )
}
