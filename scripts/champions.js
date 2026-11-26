// Campeões da Champions em N edições simuladas: npx vite-node scripts/champions.js
import { montarCatalogo } from '../src/engine/clubes.js';
import { simularLigas, aplicarMovimentos, limparLigas } from '../src/engine/liga.js';
import { simularChampions, classificadosChampions } from '../src/engine/champions.js';
const camp = {}, pais = {}; let n = 0;
for(let r=0;r<15;r++){ montarCatalogo(); limparLigas();
  for(let a=2024;a<2044;a++){
    const meu = classificadosChampions()[0].nome;
    const u = simularChampions(a, {meu, ajuste:0, jog:{pJogar:0,pGol:0,pAst:0}});
    const t = classificadosChampions().find(x=>x.nome===u.campeao) || {pais:'?'};
    camp[u.campeao] = (camp[u.campeao]||0)+1; pais[t.pais] = (pais[t.pais]||0)+1; n++;
    aplicarMovimentos(simularLigas(a));
  }}
const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`${k} ${(100*v/n).toFixed(0)}%`).join(', ');
console.log(n,'edições'); console.log('Clubes:', top(camp)); console.log('Países:', top(pais));
