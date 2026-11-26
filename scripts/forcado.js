import { NACOES, POSICOES } from '../src/data/base.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, sortearPrimeiroClube, jogarCarreiraAutomatica } from '../src/engine/carreira.js';
let casos=0, ficouGrande=0, emprest=0, voltaMelhor=0, mesmo=0;
for(let i=0;i<3000;i++){
  iniciarCarreira({name:'x', pos:Object.keys(POSICOES)[i%12], nat:NACOES[i%NACOES.length], start:i%2?'pro':'base'});
  sortearPrimeiroClube(); jogarCarreiraAutomatica();
  const h=player.history;
  for(let k=0;k<h.length-1;k++){
    const s=h[k], n=h[k+1];
    const ruim = s.category==='elite' && !s.emprestimo && (s.nota<46 || (s.share<0.3&&s.nota<55) || (s.nota<60 && s.share<0.35 && s.age>=19));
    if(!ruim) continue;
    if(s.liga && s.liga.movimento==='rebaixado') continue;
    if(s.age<=17) continue;   // até 18 anos ainda é base: pode ficar
    casos++; if(n.category==='elite') ficouGrande++; if(n.clubRef.name===s.clubRef.name) mesmo++; if(n.emprestimo) emprest++;
    const n2=h[k+2]; if(n2 && n.nota>s.nota+10) voltaMelhor++;
  }
}
console.log({casos, 'jogou em grande na temporada seguinte':ficouGrande, 'mesmo clube':mesmo, 'saiu emprestado':emprest, 'nota melhorou >10 no clube menor':voltaMelhor});
