import { player } from './jogador.js';
import { clamp } from './util.js';

/* ===================== DESEMPENHO ===================== */
// perfTier: 0 Excepcional, 1 Bom, 2 Médio, 3 Ruim
export function pesosPorFase(fase, shift=0){
  let p = (fase==="excelente" || fase==="boa") ? [35,40,20,5] : fase==="ruim" ? [10,20,40,30] : [20,30,35,15];
  if(shift){
    const d = shift*20;
    p = [p[0]+d, p[1]+d/2, p[2]-d/2, p[3]-d].map(x => Math.max(1,x));
    const s = p.reduce((a,b)=>a+b,0); p = p.map(x => x*100/s);
  }
  return p;
}
export function sortearPerfTier(fase, shift=0){
  const pesos = pesosPorFase(fase, shift);
  const r = Math.random()*100; let acc = 0;
  for(let i=0;i<4;i++){ acc += pesos[i]; if(r<=acc) return i; }
  return 3;
}

/* ===================== FASE RECENTE (principal determinante do mercado) ===================== */
// Produção esperada por jogo de um titular regular, por posição. Posições defensivas quase não dependem de
// gols/assistências: para elas a avaliação usa sobretudo a participação e o rendimento geral da temporada.
export const PROD_ESPERADA = {ATA:{g:.45,a:.15},PE:{g:.30,a:.22},PD:{g:.30,a:.22},MEI:{g:.22,a:.28},ME:{g:.12,a:.18},MD:{g:.12,a:.18},
  MC:{g:.10,a:.16},VOL:{g:.05,a:.08},LE:{g:.05,a:.13},LD:{g:.05,a:.13},ZAG:{g:.06,a:.03},GOL:{g:0,a:0}};
export const PESO_OFENSIVO = {ATA:1,PE:1,PD:1,MEI:.85,ME:.6,MD:.6,MC:.5,VOL:.3,LE:.3,LD:.3,ZAG:.1,GOL:0};
export const NOME_FASE = {excelente:"Excelente", boa:"Boa", normal:"Regular", ruim:"Ruim"};

// Avalia UMA temporada: P = participação (minutos em campo), Q = rendimento relativo à posição.
export function avaliarTemporada(s){
  // Tolerante a registros incompletos (ex.: carreiras antigas): campos ausentes valem 0 / neutro.
  const j = s.games||0, P = clamp(s.share ?? 0.5, 0, 1), gols = s.goals||0, ast = s.assists||0, perf = s.perf ?? 2;
  const esp = PROD_ESPERADA[player.pos] || {g:.1, a:.1};
  const rel = j>0 ? (gols + 0.8*ast) / (j*Math.max(0.01, esp.g + 0.8*esp.a)) : 0;
  const w = PESO_OFENSIVO[player.pos] ?? 0.5;
  let Q = w*clamp(rel/1.5, 0, 1) + (1-w)*[1, 0.62, 0.38, 0.08][perf];
  Q = (Q*j + 0.45*8) / (j+8);                 // poucas partidas puxam a estimativa para o neutro (3 jogos ≠ 30 jogos)
  return {P, Q, S:0.45*P + 0.55*Q};
}
// Única regra de classificação da fase (usada pelo mercado e pela interface). Vale a temporada mais recente:
// um grande ano antigo NÃO compensa uma fase atual ruim. O histórico segue salvo e influencia só a reputação.
export function detalharFase(){
  const h = player.history;
  if(!h.length) return {fase:"normal", P:.5, Q:.5, S:.5};
  const ult = h[h.length-1];
  if(ult.nota != null){
    // v2.1: a nota da temporada (0–100) já combina atuação, minutos, estatística por posição e contexto.
    let fase = ult.nota>=75 ? "excelente" : ult.nota>=60 ? "boa" : ult.nota>=46 ? "normal" : "ruim";
    if(ult.share<0.3 && ult.nota<55) fase = "ruim";            // perdeu espaço no elenco
    return {fase, P:ult.share, Q:ult.nota/100, S:ult.nota/100, nota:ult.nota};
  }
  const {P, Q, S} = avaliarTemporada(ult);
  let fase = "normal";
  if(S<0.32 || (P<0.3 && Q<0.45) || Q<0.2) fase = "ruim";
  else if(S>=0.72 && P>=0.6 && Q>=0.65) fase = "excelente";
  else if(S>=0.52 && P>=0.4 && Q>=0.45) fase = "boa";
  return {fase, P, Q, S};
}
export const classificarFase = () => detalharFase().fase;
export function resumoFase(){
  const s = player.history[player.history.length-1];
  const pl = (n,a,b) => `${n} ${n===1?a:b}`;
  return s ? `${pl(s.games,"jogo","jogos")}, ${pl(s.goals,"gol","gols")} e ${pl(s.assists,"assistência","assistências")}` : "";
}
