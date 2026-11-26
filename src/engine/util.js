/* ===================== UTILIDADES ===================== */
export const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
export const pick = a => a[Math.floor(Math.random()*a.length)];
export const sigmoid = x => 1/(1+Math.exp(-x));
export const arred = x => Math.floor(x + Math.random());
export function poisson(l){ const L=Math.exp(-l); let k=0,p=1; do{ k++; p*=Math.random(); }while(p>L); return k-1; }
export function embaralhar(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
// Sorteio ponderado sem reposição
export function sortearPonderado(itens, fnPeso, n){
  const pool = itens.map(x => ({x, w:Math.max(0,fnPeso(x))})); const out = [];
  while(out.length<n && pool.some(o=>o.w>0)){
    const tot = pool.reduce((s,o)=>s+o.w,0); let r = Math.random()*tot, i = 0;
    for(; i<pool.length; i++){ r -= pool[i].w; if(r<=0) break; }
    i = Math.min(i,pool.length-1);
    out.push(pool[i].x); pool.splice(i,1);
  }
  return out;
}
