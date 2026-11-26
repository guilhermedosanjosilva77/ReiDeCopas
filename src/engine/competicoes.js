import { SELECOES, membros } from '../data/selecoes.js';
import { sigmoid } from './util.js';

/* ===================== CALENDÁRIO INTERNACIONAL (configurável) ===================== */
// Cada competição tem: ano inicial + intervalo (e/ou anos fixos). Os anos são REFERÊNCIAS: quando os
// calendários oficiais mudarem, basta ajustar "inicio", "intervalo" ou "fixos" abaixo.
//   fixos: edições pontuais; rotulo: texto de exibição da edição (ex.: "2025/26").
export function escolherTop(nomes, n, forcar=[], sigma=6){
  const forc = forcar.filter(x => nomes.includes(x));
  const resto = nomes.filter(x => !forc.includes(x))
    .map(x => ({x, s:SELECOES[x].r + (Math.random()+Math.random()+Math.random()-1.5)*sigma*1.6}))
    .sort((a,b)=>b.s-a.s).map(o=>o.x);
  return [...forc, ...resto].slice(0,n);
}
export const COMPETICOES = [
 {id:"mundo", nome:"Copa do Mundo FIFA", abrev:"CM", tipo:"mundo", inicio:2026, intervalo:4,
  formato:{times:48,grupos:12,classif:2,terceiros:8},
  pClassif:(n,c,r)=>sigmoid((r-70)/5),
  participantes:minha=>{
    const slots = {UEFA:16,CONMEBOL:6,CAF:9,AFC:8,CONCACAF:6,OFC:1}; const sel = [];
    Object.entries(slots).forEach(([c,k]) => sel.push(...escolherTop(membros(c), k, SELECOES[minha].c===c?[minha]:[], 6)));
    const resto = Object.keys(SELECOES).filter(x => !sel.includes(x));
    sel.push(...escolherTop(resto, 48-sel.length, [], 7));
    return sel;
  }},
 {id:"americas", nome:"Copa América", abrev:"CA", tipo:"continental", inicio:2028, intervalo:4, confs:["CONMEBOL"],
  formato:{times:16,grupos:4,classif:2,terceiros:0},
  pClassif:(n,c,r)=> c==="CONMEBOL" ? 1 : c==="CONCACAF" ? (r>=72?0.65:0.3) : 0,
  participantes:minha=>[...membros("CONMEBOL"), ...escolherTop(membros("CONCACAF"), 6, SELECOES[minha].c==="CONCACAF"?[minha]:[], 6)]},
 {id:"euro", nome:"Eurocopa", abrev:"EC", tipo:"continental", inicio:2028, intervalo:4, confs:["UEFA"],
  formato:{times:24,grupos:6,classif:2,terceiros:4},
  pClassif:(n,c,r)=> c==="UEFA" ? sigmoid((r-64)/4) : 0,
  participantes:minha=>escolherTop(membros("UEFA"), 24, [minha], 6)},
 {id:"afcon", nome:"Copa Africana de Nações", abrev:"CAN", tipo:"continental", fixos:[2026,2027], inicio:2031, intervalo:4, confs:["CAF"],
  rotulo:y=> y===2026 ? "2025/26" : String(y),
  formato:{times:24,grupos:6,classif:2,terceiros:4},
  pClassif:(n,c,r)=> c==="CAF" ? sigmoid((r-62)/5) : 0,
  participantes:minha=>escolherTop(membros("CAF"), 24, [minha], 6)},
 // Copa Ouro: somente seleções da CONCACAF (América do Norte, Central e Caribe) — sem convidados de outras confederações.
 {id:"ouro", nome:"Copa Ouro CONCACAF", abrev:"CO", tipo:"continental", inicio:2027, intervalo:2, confs:["CONCACAF"],
  formato:{times:16,grupos:4,classif:2,terceiros:0},
  pClassif:(n,c,r)=> c==="CONCACAF" ? 1 : 0,
  participantes:minha=>escolherTop(membros("CONCACAF"), 16, [minha], 6)},
 {id:"asia", nome:"Copa da Ásia AFC", abrev:"CAS", tipo:"continental", inicio:2027, intervalo:4, confs:["AFC"],
  formato:{times:24,grupos:6,classif:2,terceiros:4},
  pClassif:(n,c,r)=> c==="AFC" ? sigmoid((r-56)/5) : 0,
  participantes:minha=>escolherTop(membros("AFC"), 24, [minha], 6)},
 {id:"ofc", nome:"Copa das Nações da OFC", abrev:"OFC", tipo:"continental", inicio:2028, intervalo:4, confs:["OFC"],
  formato:{times:8,grupos:2,classif:2,terceiros:0},
  pClassif:(n,c,r)=> c==="OFC" ? 1 : 0,
  participantes:minha=>membros("OFC")},
 {id:"olimpiadas", nome:"Jogos Olímpicos — Futebol Masculino", abrev:"JO", tipo:"olimpico", inicio:2028, intervalo:4, sub23:true,
  formato:{times:16,grupos:4,classif:2,terceiros:0},
  pClassif:(n,c,r)=> sigmoid((r-76)/5),
  participantes:minha=>escolherTop(Object.keys(SELECOES), 16, [minha], 8)}
];
export const anoDaEdicao = (comp,y) => (comp.fixos||[]).includes(y) || (y>=comp.inicio && (y-comp.inicio)%comp.intervalo===0);
export const rotuloEdicao = (comp,y) => comp.rotulo ? comp.rotulo(y) : String(y);
