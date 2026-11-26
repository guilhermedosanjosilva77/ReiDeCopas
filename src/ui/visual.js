import { NAT_INFO } from '../data/base.js';
import { CLUB_COLORS, LOGO_ALIAS } from '../data/clubes.js';
import { CORES_ESCUDO } from '../data/coresEscudos.js';
import { SELECOES } from '../data/selecoes.js';
import { CLUBES_POR_NOME } from '../engine/clubes.js';

/* ===================== HELPERS ===================== */
export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function hexToRgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
export function rgba(h,a){ const [r,g,b]=hexToRgb(h); return `rgba(${r},${g},${b},${a})`; }
export function textOn(h){ const [r,g,b]=hexToRgb(h); return (0.299*r+0.587*g+0.114*b)>160 ? '#111' : '#fff'; }
export function hslHex(h,s,l){ s/=100; l/=100; const k=n=>(n+h/30)%12; const a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); const x=v=>Math.round(255*v).toString(16).padStart(2,'0');
  return '#'+x(f(0))+x(f(8))+x(f(4)); }
export function clubColor(name){ if(CLUB_COLORS[name]) return CLUB_COLORS[name];
  const doEscudo = CORES_ESCUDO[slugDoClube(name)]; if(doEscudo) return doEscudo;      // cor extraída do escudo
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))%360; return hslHex(h,50,42); }

export function ovrTier(o){ return o>=90?'t-diamond':o>=80?'t-gold':o>=70?'t-steel':'t-bronze'; }
export function fmtValor(v){ return v<1 ? '€'+Math.round(v*1000)+'K' : '€'+(v>=10?Math.round(v):v.toFixed(1))+'M'; }

export function flagHTML(nat,w=18){
  const i = NAT_INFO[nat]; if(!i) return '';
  return `<img class="flag" src="https://flagcdn.com/w80/${i.iso}.png" alt="${i.code}" style="width:${w}px" onerror="this.style.display='none'">`;
}

// Emblema do clube: tenta pasta images/, depois o escudo embutido, depois a web; por fim, as iniciais.
export function crest(club,size=22){
  const col = clubColor(club.name);
  const ini = club.name.substring(0,2).toUpperCase();
  const fb = `<span class="crest-fb" style="width:${size}px;height:${size}px;font-size:${Math.max(8,Math.round(size*.38))}px;background:${col};color:${textOn(col)}">${ini}</span>`;
  return imgLogo(club,'crest-img',`width:${size}px;height:${size}px`,fb);
}

export const COR_TROFEU = {liga:"#f5c542", liga2:"#b9a46a", copa:"#cfd3da", champions:"#b8ccff", mundo:"#ffd84d", continental:"#7fc4ff", olimpico:"#e0a35a"};
export function trophySVG(color,size=30){
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="${color}"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/><rect x="11" y="13" width="2" height="4" fill="${color}"/><rect x="8" y="17" width="8" height="3" rx="1" fill="${color}"/></svg>`;
}
// Taça "de orelhas grandes" da Champions League (desenho próprio, estilizado)
export function trophyUCL(size=30, color="#b8ccff"){
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="M8.2 3.5h7.6v5a3.8 3.8 0 0 1-7.6 0z" fill="${color}"/><path d="M8.3 4.6C3.2 2.6 2.4 11.4 9 11.2M15.7 4.6c5.1-2 5.9 6.8-.7 6.6" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round"/><path d="M11 12.3h2l.4 4.4h-2.8z" fill="${color}"/><rect x="7.3" y="16.7" width="9.4" height="3.6" rx="1" fill="${color}"/><rect x="9" y="17.9" width="6" height="1.2" rx=".5" fill="#0e0e10" opacity=".35"/></svg>`;
}
export const iconeTrofeu = (kind, size) => kind==="champions" ? trophyUCL(size) : trophySVG(COR_TROFEU[kind], size);
export function trofeusHTML(lista,size=34){
  const g = {};
  lista.forEach(t=>{ const k=t.kind+'|'+t.titulo; (g[k]=g[k]||{kind:t.kind,titulo:t.titulo,items:[]}).items.push(t); });
  return Object.values(g).map(x =>
    `<span class="trophy" title="${esc(x.titulo)}: ${esc(x.items.map(i=>i.year+' ('+i.club+')').join(', '))}">${iconeTrofeu(x.kind,size)}${x.items.length>1?`<span class="cnt">×${x.items.length}</span>`:''}</span>`
  ).join('');
}


/* ===================== LOGOS DOS CLUBES ===================== */
// Ordem de tentativa para cada escudo (o primeiro que carregar vence):
//   1) pasta  images/<slug>.football-logos.cc.png   (nome original do site — é só copiar os arquivos pra lá)
//   2) pasta  images/<slug>.png
//   3) escudo embutido no build (src/assets/escudos/*.png — o Vite converte em dados dentro do HTML)
//   4) endereço da internet cadastrado no clube (data/logosWeb.js)
//   5) iniciais do clube
// O "slug" vem do nome: "São Paulo" -> "sao-paulo", "Newell's Old Boys" -> "newells-old-boys".
// Se o arquivo tiver outro nome, informe em LOGO_ALIAS (data/clubes.js).
export const EMBUTIDOS = import.meta.glob('../assets/escudos/*.png', {eager:true, query:'?url', import:'default'});
export const LOGOS_LOCAIS = {};
for(const [arq, url] of Object.entries(EMBUTIDOS)){
  LOGOS_LOCAIS[arq.split('/').pop().replace(/\.football-logos\.cc\.png$|\.png$/,'')] = url;
}
export const slugify = s => s.replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
export const slugDoClube = nome => LOGO_ALIAS[nome] || (CLUBES_POR_NOME[nome] && CLUBES_POR_NOME[nome].slug) || slugify(nome);

export const IMG_PASSO = {};    // slug -> primeira fonte que ainda não falhou (evita repetir tentativas à toa)
export function fontesLogo(club){
  const slug = slugDoClube(club.name);
  const f = [`images/${slug}.football-logos.cc.png`, `images/${slug}.png`];
  if(LOGOS_LOCAIS[slug]) f.push(LOGOS_LOCAIS[slug]);
  if(club.logo && /^https?:/.test(club.logo)) f.push(club.logo);
  return f;
}
// <img> com cadeia de fallback; se todas as fontes falharem, entra o HTML "fb" (iniciais) no mesmo lugar.
export function imgLogo(club, cls, style, fb){
  const fontes = fontesLogo(club), slug = slugDoClube(club.name);
  const p = IMG_PASSO[slug] || 0;
  if(p >= fontes.length) return fb;
  return `<img class="${cls}" alt="" src="${fontes[p]}" style="${style}" data-club="${esc(club.name)}" data-passo="${p}" data-fb='${fb.replace(/'/g,"&#39;")}' onerror="reiLogoFalha(this)">`;
}
export function logoFalha(img){
  const club = CLUBES_POR_NOME[img.dataset.club];
  const fontes = club ? fontesLogo(club) : [];
  const prox = (parseInt(img.dataset.passo) || 0) + 1;
  if(club){ const slug = slugDoClube(club.name); IMG_PASSO[slug] = Math.max(IMG_PASSO[slug] || 0, prox); }
  if(prox < fontes.length){ img.dataset.passo = prox; img.src = fontes[prox]; }
  else { img.outerHTML = img.dataset.fb; }
}

export function flagSel(nome, w=18){
  const s = SELECOES[nome]; if(!s) return '';
  return `<img class="flag" src="https://flagcdn.com/w80/${s.iso}.png" alt="" style="width:${w}px" onerror="this.style.display='none'">`;
}

// O atributo onerror do <img> precisa achar a função no escopo global.
if(typeof window !== 'undefined') window.reiLogoFalha = logoFalha;
