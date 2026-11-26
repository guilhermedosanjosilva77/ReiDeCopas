// Métricas de realismo (comparar com copero_referencia_simulacao_realista.md): npx vite-node scripts/realismo.js
import { NACOES, POSICOES } from '../src/data/base.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, sortearPrimeiroClube, jogarCarreiraAutomatica } from '../src/engine/carreira.js';
const N = +(process.argv[2]||600), start = process.argv[3]||'base';
const R = {picos:[], idadePico:[], aposent:[], notas:[], grave:0, tardia:0, frustrado:0, elite:0, temps:0, emprest:0, dOvr:[], semTitulo:0, clubes:[], porPos:{}};
for(let i=0;i<N;i++){
  const pos = Object.keys(POSICOES)[i%12];
  iniciarCarreira({name:'x', pos, nat:NACOES[i%NACOES.length], start});
  sortearPrimeiroClube(); jogarCarreiraAutomatica();
  const h = player.history;
  R.picos.push(player.peakOvr);
  const ip = h.reduce((b,s)=> s.ovr>b.ovr ? s : b, h[0]); R.idadePico.push(ip.age+1);
  R.aposent.push(player.age);
  h.forEach(s => { R.notas.push(s.nota); R.temps++; if(s.category==='elite') R.elite++; if(s.emprestimo) R.emprest++; R.dOvr.push(s.ovrChange); });
  if(player.lesoes.some(l=>l.tipo==='grave')) R.grave++;
  const o23 = (h.find(s=>s.age===23)||{}).ovr;
  if(o23 && ip.age+1>=28 && player.peakOvr-o23>=8) R.tardia++;
  if(player.potencialInicial - player.peakOvr >= 6) R.frustrado++;
  if(!player.titulosConquistados.length) R.semTitulo++;
  R.clubes.push(new Set(h.map(s=>s.clubRef.name)).size);
  (R.porPos[pos] = R.porPos[pos]||[]).push(player.age);
}
const srt = a => a.slice().sort((x,y)=>x-y), q = (a,p) => srt(a)[Math.floor(p*(a.length-1))], pct = (n,d=N) => (100*n/d).toFixed(0)+'%';
const frac = (a,f) => pct(a.filter(f).length, a.length);
console.log(`=== ${N} carreiras (início: ${start}) ===`);
console.log('OVR de pico   p10',q(R.picos,.1),'p25',q(R.picos,.25),'mediana',q(R.picos,.5),'p75',q(R.picos,.75),'p90',q(R.picos,.9),'| 90+',frac(R.picos,x=>x>=90),'| 85+',frac(R.picos,x=>x>=85),'| <75',frac(R.picos,x=>x<75));
console.log('Idade do pico mediana', q(R.idadePico,.5), '| pico ≥28 anos', frac(R.idadePico,x=>x>=28), '| pico ≤23', frac(R.idadePico,x=>x<=23));
console.log('Notas: histórica(90+)',frac(R.notas,x=>x>=90),'excelente(80-89)',frac(R.notas,x=>x>=80&&x<90),'muito boa',frac(R.notas,x=>x>=70&&x<80),'boa',frac(R.notas,x=>x>=60&&x<70),'regular',frac(R.notas,x=>x>=50&&x<60),'fraca ou pior',frac(R.notas,x=>x<50));
console.log('Variação de OVR/temporada: +4 ou mais',frac(R.dOvr,x=>x>=4),'| acima de +5',frac(R.dOvr,x=>x>5),'| 0 ou menos',frac(R.dOvr,x=>x<=0));
console.log('Carreiras com lesão grave',pct(R.grave),'| ascensão tardia',pct(R.tardia),'| potencial não alcançado (≥6 abaixo)',pct(R.frustrado),'| sem nenhum título',pct(R.semTitulo));
console.log('Temporadas em clube grande',pct(R.elite,R.temps),'| temporadas emprestado',pct(R.emprest,R.temps),'| clubes por carreira (mediana)',q(R.clubes,.5));
console.log('Idade de aposentadoria p10',q(R.aposent,.1),'mediana',q(R.aposent,.5),'p90',q(R.aposent,.9),'| GOL mediana',q(R.porPos.GOL,.5),'| PE mediana',q(R.porPos.PE,.5));
