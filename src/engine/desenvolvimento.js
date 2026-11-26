import { PESO_OFENSIVO, PROD_ESPERADA } from './fase.js';
import { player } from './jogador.js';
import { clamp, pick } from './util.js';

/* =====================================================================
   DESENVOLVIMENTO DO JOGADOR (referência: copero_referencia_simulacao_realista.md)
   ---------------------------------------------------------------------
   Variáveis independentes (Parte 2.1): OVR, potencial, forma, consistência, condição física,
   reputação, valor, moral, importância no elenco e histórico (lesões, temporadas, conquistas).
   Princípios: potencial não é destino; OVR não é desempenho; juventude não garante evolução e
   idade não derruba ninguém automaticamente.
   ===================================================================== */

export const gauss = () => { let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
// arredondamento estocástico: 1,3 vira 1 (70%) ou 2 (30%) — evita degraus artificiais
export const arredEst = x => Math.floor(x) + (Math.random() < x-Math.floor(x) ? 1 : 0);

/* ---------- Atributos de nascença (sorteados no início da carreira) ---------- */
export function gerarAtributos(start){
  // Potencial: a maioria fica entre 70 e 84; 90+ é exceção (~2%). Quem começa como profissional aos 21
  // já mostrou parte do caminho, então a faixa parte do OVR atual.
  const pot = start==="pro"
    ? clamp(Math.round(76 + gauss()*5.5), 68, 95)
    : clamp(Math.round(77 + gauss()*6.5), 64, 95);
  return {
    potencial: pot, potencialInicial: pot,
    olheiro: Math.round(gauss()*2),                       // viés da percepção dos olheiros (o potencial real fica oculto)
    consistencia: clamp(Math.round(60 + gauss()*14), 25, 92),
    propensao: clamp(0.02 + Math.abs(gauss())*0.035, 0, 0.14),   // tendência a lesões
    fisico: 100, moral: 65
  };
}

/* ---------- Curva de idade por posição (Parte 3.1) ---------- */
// pico: até quando ainda se ganha um pouco; queda: intensidade do declínio depois do pico.
// Goleiros e zagueiros duram mais; quem depende de velocidade sente antes.
export const PERFIL_IDADE = {
  GOL:{pico:31,queda:.55}, ZAG:{pico:30,queda:.7}, VOL:{pico:29,queda:.8}, MC:{pico:29,queda:.8},
  MEI:{pico:28,queda:.9}, ATA:{pico:28,queda:1}, ME:{pico:27,queda:1.1}, MD:{pico:27,queda:1.1},
  LE:{pico:27,queda:1.15}, LD:{pico:27,queda:1.15}, PE:{pico:27,queda:1.2}, PD:{pico:27,queda:1.2}
};
export function tendenciaIdade(age, pos){
  const p = PERFIL_IDADE[pos] || PERFIL_IDADE.MC;
  if(age<=17) return 2.4;
  if(age<=20) return 2.1;
  if(age<=23) return 1.6;
  if(age<=26) return 1.0;
  if(age<=p.pico) return 0.4;
  const anos = age - p.pico;
  return -Math.min(4.5, (0.35 + 0.35*anos)*p.queda);
}
export const FAIXA_ETARIA = a => a<=17?"Formação" : a<=20?"Adaptação" : a<=23?"Consolidação" : a<=26?"Maturidade"
  : a<=29?"Auge provável" : a<=32?"Manutenção" : a<=35?"Veterano" : a<=38?"Final de carreira" : "Longevidade excepcional";

/* ---------- Situação no elenco ---------- */
export const papelNoElenco = share => share>=0.7 ? "Titular" : share>=0.45 ? "Rotação" : share>=0.2 ? "Reserva" : "Fora dos planos";
export const minutosPorJogo = share => share>=0.7 ? 84 : share>=0.45 ? 64 : share>=0.2 ? 38 : 24;

/* ---------- Atuação (desempenho individual "latente") ---------- */
// Depende do OVR em relação ao nível do clube, do momento, da moral, dos efeitos de eventos e da consistência.
export const MOMENTO = {excelente:3, boa:1.5, normal:0, ruim:-3};
export function sortearAtuacao({ovr, nivel, fase, moral, forma=0, ritmo=0, consistencia}){
  const sd = 6 + (100-consistencia)*0.13;           // consistência 85 → ±8 · consistência 35 → ±14,5
  // Dominar uma liga fraca rende boas notas, mas com retorno decrescente (o ganho relativo satura).
  const rel = ovr-nivel, relEf = rel>0 ? 12*(1-Math.exp(-rel/12)) : Math.max(-22, rel*0.9);
  const media = 53 + relEf + (MOMENTO[fase]||0) + (moral-60)*0.06 + forma*16 + ritmo;
  return clamp(media + gauss()*sd, 12, 99);
}

/* ---------- Nota da temporada (Partes 2.2 e 2.3) ---------- */
// Pesos de referência: desempenho individual 25% + regularidade 20% (atuação), minutos 15%,
// estatística 15% (ajustada à posição), nível da competição 10%, importância no elenco 10%, títulos 5%.
export function notaDaTemporada({atuacao, share, games, goals, assists, nivel, titulos, pos}){
  const esp = PROD_ESPERADA[pos] || {g:.1, a:.1};
  const rel = games>0 ? (goals + 0.8*assists) / (games*Math.max(0.01, esp.g + 0.8*esp.a)) : 0;
  const estat = clamp(50 + (rel-1)*35, 0, 100);
  const w = PESO_OFENSIVO[pos] ?? 0.5;                          // zagueiro e goleiro quase não dependem de gols
  const comp = clamp(50 + (nivel-66)*1.8, 20, 90);
  const imp = share>=0.7 ? 85 : share>=0.45 ? 65 : share>=0.2 ? 40 : 20;
  let nota = 0.45*atuacao + 0.15*(share*100) + 0.15*(w*estat + (1-w)*atuacao) + 0.10*comp + 0.10*imp + 0.05*(titulos?100:50);
  nota = 52 + (nota-55)*1.3;                                   // escala calibrada: 90+ raro, 50–65 o mais comum
  if(games < 15){ const w = games/15; nota = nota*w + 46*(1-w); }   // poucas partidas: avaliação puxada para o meio
  if(share<0.15) nota = Math.min(nota, 38);                    // quase não jogou: perda de espaço
  return Math.round(clamp(nota, 8, 99));
}
export const CLASSE_NOTA = [
  [90,"Histórica"],[80,"Excelente"],[70,"Muito boa"],[60,"Boa"],[50,"Regular"],[40,"Fraca"],[30,"Muito fraca"],[0,"Crítica"]
];
export const classeNota = n => CLASSE_NOTA.find(([m]) => n>=m)[1];
export const corNota = n => n>=80?"#7fe0a8" : n>=70?"#a8e0c0" : n>=60?"#cfe6a0" : n>=50?"#f5c542" : n>=40?"#f5a142" : "#ff8a95";
// Faixa de desempenho usada pelos sistemas antigos (gols, prêmios, eventos): 0 excepcional … 3 ruim
export const perfDaNota = n => n>=78 ? 0 : n>=62 ? 1 : n>=46 ? 2 : 3;
export const faseDaNota = n => n>=75 ? "excelente" : n>=60 ? "boa" : n>=46 ? "normal" : "ruim";

/* ---------- Lesões (Parte 5) ---------- */
// Pontual: poucas partidas. Relevante: semanas/meses e perda de ritmo. Grave: parte da temporada, pode custar
// OVR e potencial. Probabilidade cresce com idade, histórico recente, desgaste e condição física.
export function sortearLesao({age, share, ano}){
  const recentes = player.lesoes.filter(l => l.ano >= ano-2);
  const graveRecente = recentes.some(l => l.tipo==="grave");
  const p = 0.08 + player.propensao + Math.max(0, age-29)*0.012 + (graveRecente ? 0.08 : recentes.length ? 0.03 : 0)
          + (100-player.fisico)*0.002 + (share>0.8 ? 0.03 : 0);
  if(Math.random() >= p) return null;
  const pGrave = 0.09 + (graveRecente ? 0.08 : 0) + (age>32 ? 0.04 : 0);
  const r = Math.random();
  if(r < pGrave) return {tipo:"grave", jogos:18 + Math.floor(Math.random()*17), recorrente:graveRecente,
    nome: pick(["Ruptura do ligamento cruzado","Fratura","Lesão grave no tendão","Lesão muscular grave"])};
  if(r < pGrave+0.38) return {tipo:"relevante", jogos:6 + Math.floor(Math.random()*9), recorrente:recentes.length>0,
    nome: pick(["Lesão muscular na coxa","Entorse de tornozelo","Lesão no joelho","Lesão na panturrilha"])};
  return {tipo:"pontual", jogos:2 + Math.floor(Math.random()*4), recorrente:false,
    nome: pick(["Desconforto muscular","Pancada","Contusão leve"])};
}

/* ---------- Evolução do OVR (Partes 3.2 e 3.3) ---------- */
// Normal 0–2/temporada; muito boa 2–3; excepcional 4–5; acima de 5 é raríssimo. Estagnar é possível.
export function evolucaoOVR({age, ovr, pos, nota, share, nivel, categoria, lesao, extra=0}){
  const room = player.potencial - ovr;
  let tend = tendenciaIdade(age, pos);
  if(tend > 0){
    tend *= clamp(room/8, 0, 1.25);                      // perto do teto o crescimento some
    tend *= clamp(0.5 + (nota-40)/40, 0.3, 1.3);         // temporadas ruins travam o desenvolvimento
    if(age<=23) tend *= share<0.25 ? 0.4 : share<0.45 ? 0.7 : share>=0.75 ? 1.15 : 1;   // minutos importam
    if(age<=21) tend += clamp((nivel-66)*0.03, -0.3, 0.5);                          // estrutura de treino
  } else {
    tend *= 1 + (100-player.fisico)*0.01;               // condição física acelera o declínio
  }
  let desemp = (nota-58)/10 * 0.8;                       // boa temporada ajuda, má temporada custa
  if(desemp > 0) desemp *= clamp(room/5, 0.2, 1);        // perto/acima do teto a boa fase rende pouco OVR
  if(desemp > 0 && nivel < ovr-10) desemp *= 0.6;        // destacar-se num nível muito abaixo ensina menos
  let d = tend + desemp + extra + gauss()*0.9;
  if(lesao) d -= lesao.tipo==="grave" ? 1 + Math.random()*2.2 : lesao.tipo==="relevante" ? 0.4 : 0;
  d = clamp(d, -7, 5);
  if(d >= 4.6 && Math.random() < 0.1) d += 1;           // salto acima de 5: extremamente raro
  return arredEst(d);
}

/* ---------- Revisão do potencial ---------- */
// O potencial muda com a trajetória: ascensão tardia, estagnação por falta de minutos e lesões graves.
export function revisarPotencial(season){
  const h = player.history, ant = h[h.length-2];
  const marcos = [];
  const age = season.age;
  // Superação do teto: só com nota muito alta num nível competitivo compatível com o próprio OVR
  const exigente = (season.nivel ?? 70) >= season.ovrBefore-6;
  if(season.nota>=80 && exigente && age<=29 && player.ovr >= player.potencial-2 && Math.random()<0.5){
    player.potencial += 1;
  }
  // Ascensão tardia (Vardy, Drogba, Kanté): duas temporadas muito acima do esperado, em qualquer divisão
  if(ant && age>=23 && age<=28 && ant.nota>=70 && season.nota>=70 && !player.marcos.some(m=>m.tipo==="tardia")
     && player.ovr >= player.potencial-3 && Math.random()<0.6){
    const g = 3 + Math.floor(Math.random()*4);
    player.potencial += g;
    marcos.push({tipo:"tardia", texto:"Ascensão tardia: duas temporadas seguidas muito acima do esperado mudaram a percepção sobre o seu teto."});
  }
  if(ant && age>=20 && age<=26 && ant.nota<48 && season.nota<48 && Math.random()<0.6){
    player.potencial -= 1;
    marcos.push({tipo:"queda", texto:"Duas temporadas fracas seguidas: a expectativa sobre o seu teto diminuiu."});
  }
  if(ant && age>=19 && age<=25 && ant.share<0.35 && season.share<0.35){
    player.potencial -= 1 + (Math.random()<0.4 ? 1 : 0);
    marcos.push({tipo:"estagnacao", texto:"Estagnação: duas temporadas com poucos minutos atrasaram o desenvolvimento."});
  }
  if(season.lesao && season.lesao.tipo==="grave"){
    player.potencial -= 1 + Math.floor(Math.random()*3);
    player.fisico = clamp(player.fisico - (8 + Math.random()*8), 40, 100);
    marcos.push({tipo:"lesao", texto:`Lesão grave (${season.lesao.nome.toLowerCase()}): ${season.lesao.jogos} jogos fora. O retorno ao mesmo nível não é garantido.`});
  }
  const penult = h[h.length-2];
  if(penult && penult.lesao && penult.lesao.tipo==="grave" && season.nota>=65){
    marcos.push({tipo:"recuperacao", texto:"Recuperação: depois da lesão grave, você voltou a jogar em bom nível."});
  }
  if(age>=30) player.fisico = clamp(player.fisico - (1.5 + Math.random()*2.5), 30, 100);
  if(age>=30 && season.ovrChange<=-3) marcos.push({tipo:"declinio", texto:"Declínio: a idade e a condição física começaram a pesar."});
  if(season.nota>=90) marcos.push({tipo:"historica", texto:"Temporada histórica."});
  player.potencial = clamp(player.potencial, 55, 99);
  return marcos;
}

/* ---------- Moral ---------- */
export function atualizarMoral(season){
  let d = (season.nota-55)*0.3 + (season.trofeus.length ? 5 : 0);
  if(season.share < 0.3) d -= 8;
  if(season.lesao && season.lesao.tipo==="grave") d -= 6;
  if(season.liga && season.liga.movimento==="rebaixado") d -= 6;
  player.moral = clamp(Math.round(player.moral + d*0.6 + (60-player.moral)*0.15), 15, 95);
}

/* ---------- Potencial percebido (o real fica oculto) ---------- */
export function potencialEstimado(){
  const a = player.age;
  const largura = a<=18 ? 6 : a<=21 ? 4 : a<=24 ? 3 : 2;
  const centro = Math.max(player.ovr, player.potencial + player.olheiro);
  const min = Math.max(player.ovr, centro - largura), max = Math.max(min, centro + largura);
  return {min, max, texto: a>=27 && player.ovr >= player.potencial-1 ? "No limite" : `${min}–${max}`};
}

/* ---------- Consistência observada (Parte 2.4) ---------- */
export function consistenciaObservada(){
  const n = player.history.slice(-5).map(s => s.nota).filter(x => x!=null);
  if(n.length < 3) return null;
  const m = n.reduce((a,b)=>a+b,0)/n.length;
  const dp = Math.sqrt(n.reduce((a,b)=>a+(b-m)**2,0)/n.length);
  return {dp, rotulo: dp<=6 ? "Muito regular" : dp<=11 ? "Regular" : dp<=17 ? "Oscilante" : "Muito oscilante"};
}

/* ---------- Perspectiva para a próxima temporada (Parte 10.2) ---------- */
export function perspectiva(season){
  const pot = potencialEstimado(), a = player.age;
  const partes = [];
  if(a<=23){
    if(season.share<0.35) partes.push("Precisa de minutos para continuar evoluindo");
    else if(player.ovr < pot.min) partes.push("Tem margem clara para evoluir");
    else partes.push("Desenvolvimento dentro do esperado");
  } else if(a<=29){
    if(player.ovr >= player.potencial-1) partes.push("Está perto do teto: o foco é manter o nível");
    else partes.push("Ainda há espaço para crescer com temporadas consistentes");
  } else {
    const PI = PERFIL_IDADE[player.pos] || PERFIL_IDADE.MC;
    partes.push(a < PI.pico+3 ? "Experiência compensa a idade por enquanto" : "A tendência natural é de queda gradual");
  }
  if(season.lesao && season.lesao.tipo==="grave") partes.push("o retorno após a lesão exige cautela");
  if(season.nota<46) partes.push("uma nova temporada fraca pode custar espaço e mercado");
  else if(season.nota>=75) partes.push("o bom momento atrai atenção do mercado");
  return partes.join("; ") + ".";
}
