// Métricas de equilíbrio: npx vite-node scripts/metricas.js
import { montarCatalogo, entradaDe } from '../src/engine/clubes.js';
import { simularLigas, aplicarMovimentos } from '../src/engine/liga.js';
import { NACOES, POSICOES } from '../src/data/base.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, sortearPrimeiroClube, jogarCarreiraAutomatica } from '../src/engine/carreira.js';

const campeoes = {}, quedas = {}; let anos = 0, voltaDireto = 0, subiram = 0, ptsCamp = [], ptsQueda = [];
for(let r=0;r<10;r++){
  montarCatalogo(); let ultSob = [];
  for(let a=2024;a<2044;a++){
    const res = simularLigas(a), br = res["Brasil"];
    const c = br.divs[0].tabela[0].nome; campeoes[c] = (campeoes[c]||0)+1;
    ptsCamp.push(br.divs[0].tabela[0].pts); ptsQueda.push(br.divs[0].tabela[16].pts);
    br.caem.forEach(n => { quedas[n]=(quedas[n]||0)+1; if(ultSob.includes(n)) voltaDireto++; });
    subiram += ultSob.length; ultSob = br.sobem.slice(); anos++;
    aplicarMovimentos(res);
  }
}
const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([n,v])=>`${n} ${(100*v/anos).toFixed(0)}%`).join(', ');
const med = a => a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
console.log(`Brasil, ${anos} temporadas`);
console.log('Títulos:', top(campeoes));
console.log('Mais rebaixados:', top(quedas));
console.log('Grandes rebaixados (por temporada):', (['Flamengo','Palmeiras','São Paulo','Corinthians'].reduce((s,n)=>s+(quedas[n]||0),0)/anos).toFixed(2));
console.log('Promovidos que caem no ano seguinte:', (100*voltaDireto/subiram).toFixed(0)+'%');
console.log('Pontos do campeão (mediana):', med(ptsCamp), '· pontos do 17º:', med(ptsQueda));

const por = {elite:[], serieA:[], serieB:[]};
for(let i=0;i<600;i++){
  iniciarCarreira({name:'x', pos:Object.keys(POSICOES)[i%12], nat:NACOES[i%NACOES.length], start:'base'});
  sortearPrimeiroClube(); const cat0 = player.category;
  jogarCarreiraAutomatica();
  const ligas = player.titulosConquistados.filter(t=>t.kind==='liga').length;
  const reb = player.history.filter(s=>s.liga && s.liga.movimento==='rebaixado').length;
  const ace = player.history.filter(s=>s.liga && s.liga.movimento==='acesso').length;
  const div2 = player.history.filter(s=>s.liga && s.liga.div===2).length;
  por[cat0].push({pico:player.peakOvr, ligas, reb, ace, div2});
}
for(const [c,a] of Object.entries(por)){
  const m = k => (a.reduce((s,x)=>s+x[k],0)/a.length).toFixed(2);
  console.log(`1º clube ${c} (n=${a.length}): OVR pico mediano ${med(a.map(x=>x.pico))} · títulos de liga ${m('ligas')} · rebaixamentos ${m('reb')} · acessos ${m('ace')} · temporadas na 2ª div ${m('div2')}`);
}
