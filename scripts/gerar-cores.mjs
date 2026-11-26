// Gera src/data/coresEscudos.js com a cor predominante de cada escudo (src/assets/escudos).
// Rode depois de adicionar escudos novos:  node scripts/gerar-cores.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const dir = new URL('../src/assets/escudos/', import.meta.url);
const hex = (r,g,b) => '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
function corPredominante(png){
  const bins = new Map(); let total = 0;
  for(let i=0;i<png.data.length;i+=4){
    const [r,g,b,a] = png.data.slice(i,i+4);
    if(a < 200) continue; total++;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), v = max/255, s = max ? (max-min)/max : 0;
    if(s < 0.28 || v < 0.22) continue;                        // ignora branco, preto e cinza
    let h = max===min ? 0 : max===r ? ((g-b)/(max-min))%6 : max===g ? (b-r)/(max-min)+2 : (r-g)/(max-min)+4;
    const k = Math.round(((h*60)+360)%360/15);
    const x = bins.get(k) || {n:0, r:0, g:0, b:0, w:0};
    const w = s*v; x.n++; x.w += w; x.r += r*w; x.g += g*w; x.b += b*w; bins.set(k, x);
  }
  const best = [...bins.values()].sort((a,b) => b.w-a.w)[0];
  if(!best || best.n < total*0.06) return "#d9d9de";          // escudo preto e branco
  return hex(best.r/best.w, best.g/best.w, best.b/best.w);
}
const out = {};
for(const f of readdirSync(dir).sort()){
  if(!f.endsWith('.png')) continue;
  out[f.replace(/\.football-logos\.cc\.png$|\.png$/,'')] = corPredominante(PNG.sync.read(readFileSync(new URL(f, dir))));
}
writeFileSync(new URL('../src/data/coresEscudos.js', import.meta.url),
  '// Gerado por scripts/gerar-cores.mjs — cor predominante de cada escudo (usada quando o clube não tem cor em CLUB_COLORS).\n' +
  'export const CORES_ESCUDO = ' + JSON.stringify(out, null, 0).replace(/,"/g, ',\n "') + ';\n');
console.log(Object.keys(out).length, 'cores geradas');
