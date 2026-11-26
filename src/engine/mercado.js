import { POSICOES } from '../data/base.js';
import { CATALOGO, nivelAtual, shareMinutos, sincronizarClubeDoJogador } from './clubes.js';
import { classificarFase, resumoFase } from './fase.js';
import { player } from './jogador.js';
import { clamp, pick, sortearPonderado } from './util.js';
import { clube } from '../ui/champions.js';

/* ===================== MERCADO DE TRANSFERÊNCIAS ===================== */
export const ORCAMENTO = {elite:300, serieA:70, serieB:12};   // capacidade financeira de referência (€ milhões)
// Quanto a fase desloca o nível dos clubes interessados, em relação ao clube atual, e a largura do interesse.
export const DELTA_FASE = {excelente:5, boa:2, normal:-5, ruim:-12};
export const LARG_FASE  = {excelente:9, boa:8, normal:7, ruim:6};
// podeFicar: false quando o clube não conta mais com o jogador (sem a opção de permanecer).
// situacao: "normal" | "forcado" (precisa sair) | "fimEmprestimo" (volta ao clube de origem ou fica em definitivo)
export const ultimoMercado = {fase:"normal", resumo:"", motivoFicar:"", podeFicar:true, situacao:"normal", textoFicar:"Ficar no"};
export const orcamentoOk = c => player.value <= ORCAMENTO[c.category]*(c.tier===2?0.6:1)*(c.league==="Arábia Saudita"?2.5:1)*0.5;

export function contextoMercado(){
  const h = player.history, ult = h[h.length-1] || null, pen = h[h.length-2] || null;
  const fase = classificarFase();
  const estagio = (player.age>=31 || (player.age>=28 && fase==="ruim")) ? "queda"
                : (player.age<=23 || player.ovr<70) ? "dev" : "pico";
  // Nível-alvo dos clubes: ancorado no clube atual e na FASE; o OVR (com potencial/idade) entra só como complemento.
  const ovrRef = player.ovr + (player.age<=21 ? 3 : player.age<=23 ? 1.5 : 0) - (player.age>=31 ? (player.age-30)*1.2 : 0);
  let alvo = nivelAtual()*0.65 + ovrRef*0.35 + DELTA_FASE[fase] + (player.rep-50)/40;
  // Memória curta (Parte 4.1): duas temporadas seguidas no mesmo sentido reforçam o sinal
  if(ult && pen && ult.nota!=null && pen.nota!=null){
    if(ult.nota>=72 && pen.nota>=72) alvo += 2;
    if(ult.nota<46 && pen.nota<46) alvo -= 3;
  }
  if(player.age>=32) alvo -= (player.age-31)*1.0;                 // veterano: interesse de clubes menores
  alvo += (Math.random()+Math.random()+Math.random()-1.5)*2.5;  // pequena variação por janela
  // Situações fora do padrão (raras e sempre com justificativa)
  const bom = fase==="excelente" || fase==="boa", fraco = fase==="normal" || fase==="ruim";
  const prodigio  = !!ult && player.age<=21 && player.ovr>=68 && ult.games>=12 && bom && (ult.nota>=78 || ult.goals>=15);
  const potencial = player.age<=21 && player.ovr>=72 && fraco && player.potencial>=84;
  const historico = player.rep>=78 && player.age>=27 && fraco;
  const forcado = precisaSair();
  return {estagio, fase, alvo, prodigio, potencial, historico, ult, forcado};
}

// Mau desempenho em clube GRANDE: o clube não conta mais com o jogador — precisa sair para um clube menor.
export function precisaSair(){
  const ult = player.history[player.history.length-1];
  if(!ult || player.category!=="elite" || player.emprestimo || player.age<=18) return false;   // até 18: ainda é base
  const fase = classificarFase();
  return fase==="ruim" || (fase==="normal" && ult.share<0.35 && player.age>=19);
}

export function pesoInteresse(c, ctx, modo){
  let centro = ctx.alvo;
  if(modo==="minutos") centro = Math.min(ctx.alvo, nivelAtual()-4);
  let w = Math.exp(-Math.pow((c.nivel-centro)/LARG_FASE[ctx.fase], 2));
  // Possibilidade realista de jogar: pesa muito para quem está em fase fraca ou procura minutos
  const sh = shareMinutos(player.ovr, c.nivel, player.age, 0, false);
  if(modo==="minutos") w *= clamp(sh*1.6, 0.1, 1.4);
  else if(ctx.fase==="ruim") w *= sh<0.35 ? 0.25 : clamp(0.5+sh, 0.5, 1.4);
  else if(ctx.fase==="normal") w *= clamp(0.6+sh*0.8, 0.6, 1.3);
  if(!orcamentoOk(c)) w *= 0.15;
  if(player.mercadoDistante>0 && c.tier===1 && c.league!==player.league) w *= 0.5;
  const ef = player.efeitos.interesse || 0;
  if(c.nivel > nivelAtual()) w *= Math.max(0.2, 1+ef);
  return w * c.necessidade;                          // necessidade de reforço para a posição neste momento
}

export function motivoOferta(o, ctx){
  if(o.excecao) return o.excecao;
  const sh = shareMinutos(player.ovr, o.nivel, player.age, 0, false), bom = ctx.fase==="excelente" || ctx.fase==="boa";
  if(bom && o.nivel > nivelAtual()+3) return "Reconhece o seu bom momento";
  if(!bom && sh>=0.7) return "Oferece mais minutos em campo";
  if(o.precisa) return `Procura reforço para a posição de ${POSICOES[player.pos]}`;
  if(bom) return "Quer contar com você como peça importante";
  return "Interesse pelo seu perfil";
}
export function motivoFicar(ctx){
  const sh = shareMinutos(player.ovr, nivelAtual(), player.age, 0, false);
  if(ctx.fase==="excelente" || ctx.fase==="boa") return sh>=0.5 ? "Você é peça importante aqui" : "O momento é bom, mas o espaço ainda é limitado";
  if(sh<0.35) return "Poucas chances de jogar por aqui";
  return ctx.fase==="ruim" ? "Fase fraca: recuperar espaço aqui é o caminho mais difícil" : "Dá para seguir e brigar por mais minutos";
}

// Degraus plausíveis (Parte 4.3): sem saltos de clube pequeno direto para gigante, salvo exceção justificada.
export const SALTO_MAX = 15;

export function calcularOfertas(modo=null){
  const ctx = contextoMercado();
  const fimEmprestimo = !!player.emprestimo;
  Object.assign(ultimoMercado, {fase:ctx.fase, resumo:resumoFase(), motivoFicar:motivoFicar(ctx),
    podeFicar:true, situacao:"normal", textoFicar:"Ficar no"});
  if(ctx.forcado){
    Object.assign(ultimoMercado, {podeFicar:false, situacao:"forcado",
      motivoFicar: player.age<=22 ? "O clube quer que você ganhe minutos longe daqui" : "O clube não conta mais com você"});
    if(!modo) modo = "minutos";
  }
  if(fimEmprestimo){
    Object.assign(ultimoMercado, {situacao:"fimEmprestimo", textoFicar:"Voltar ao",
      motivoFicar:`Fim do empréstimo: o contrato com o ${player.emprestimo.dono.name} continua`});
  }
  const dono = fimEmprestimo ? player.emprestimo.dono.name : null;
  const base = CATALOGO.filter(c => c.club.name !== player.club.name && c.club.name !== dono).map(c => {
    const x = {...c, necessidade:0.65 + Math.random()*0.7};
    x.precisa = x.necessidade > 1.2; x.w = pesoInteresse(x, ctx, modo);
    return x;
  });
  player.efeitos.interesse = 0;                       // consumido nesta janela
  // Mercado quieto: com fase fraca é mais comum não aparecer ninguém (exceto quando o jogador precisa sair)
  const pAny = clamp({excelente:0.95, boa:0.88, normal:0.78, ruim:0.62}[ctx.fase] + (player.ovr-70)*0.004, 0.5, 0.97);
  if(!modo && !fimEmprestimo && Math.random() > pAny) return [];

  // Quem precisa sair de um clube grande só recebe propostas de clubes menores (outro escalão)
  const elegivel = c => !ctx.forcado || (c.category!=="elite" && c.nivel < nivelAtual()-4);
  const pool = base.filter(elegivel);
  const mesmoPais = pool.filter(c => c.league===player.league);
  const outros = pool.filter(c => c.league!==player.league).map(c => ({...c, w:c.w*(c.tier===player.tier?1:0.6)}));
  let out;
  if(modo) out = sortearPonderado([...mesmoPais,...outros], c=>c.w, 3);
  else if(ctx.estagio==="dev") out = [...sortearPonderado(mesmoPais, c=>c.w, 2), ...sortearPonderado(outros, c=>c.w, 1)];
  else {
    out = sortearPonderado(pool, c=>c.w, 3);
    const mp = out.filter(c=>c.league===player.league);
    if(mp.length>2){ const extra = sortearPonderado(outros.filter(c=>!out.includes(c)), c=>c.w, 1); if(extra.length) out = [...mp.slice(0,2), ...out.filter(c=>c.league!==player.league), ...extra].slice(0,3); }
  }
  // Só entra o que é plausível: preferimos menos propostas a preencher a janela com clubes incompatíveis.
  out = out.filter(o => o.w >= 0.12 && o.nivel <= nivelAtual() + SALTO_MAX);
  if(ctx.fase==="ruim" || ctx.fase==="normal") out = out.filter(o => o.nivel <= ctx.alvo+9);
  if(ctx.forcado && !out.length){                         // precisa sair: garante ao menos duas saídas realistas
    out = sortearPonderado(pool.filter(c => c.category==="serieB" || c.nivel <= nivelAtual()-10), c=>Math.max(0.05,c.w), 2);
  }

  // Exceção rara e justificada (no máximo uma por janela). Nunca para quem foi dispensado por mau desempenho.
  let exc = null;
  if(!ctx.forcado){
    if(ctx.prodigio && Math.random()<0.5) exc = {cat:"elite", tier1:player.category!=="serieB", motivo:"Reconhece sua grande temporada e o seu potencial"};
    else if(ctx.potencial && Math.random()<0.15) exc = {cat:"elite", tier1:true, motivo:"Aposta no seu potencial excepcional, mesmo com poucas oportunidades"};
    else if(ctx.historico && Math.random()<0.08) exc = {cat:"elite", tier1:true, motivo:"Aposta no seu histórico de alto nível e na experiência"};
  }
  if(exc && !modo){
    const cand = sortearPonderado(CATALOGO.filter(c => c.club.name!==player.club.name && c.club.name!==dono && c.category===exc.cat
      && (exc.tier1 ? c.tier===1 : c.tier===2) && orcamentoOk(c)), ()=>1, 1)[0];
    if(cand){ out = out.filter(o=>!o.excecao).slice(0,2); out.push({...cand, w:1, necessidade:1, excecao:exc.motivo}); }
  }
  let ofertas = out.map(o => ({
    club:o.club, league:o.league, tier:o.tier, category:o.category, nivel:o.nivel, div:o.div,
    salto: !!o.excecao && o.nivel>nivelAtual(),
    shareEsp: shareMinutos(player.ovr, o.nivel, player.age, 0, false),
    motivo: motivoOferta(o, ctx), tipo:"definitivo"
  }));
  // Empréstimos (Parte 4.4): jovem dispensado de clube grande sai emprestado para ganhar minutos
  if(ctx.forcado && player.age<=22){
    ofertas.forEach((o,i) => { if(i<2 && o.shareEsp>=0.45){ o.tipo = "emprestimo"; o.motivo = "Empréstimo de uma temporada para ganhar minutos"; } });
  }
  // Jovem da base de clube grande com pouco espaço: o clube sugere empréstimo, mas ele pode ficar
  else if(!ctx.forcado && player.category==="elite" && player.age<=20 && ctx.ult && ctx.ult.share<0.35 && Math.random()<0.7){
    const cand = sortearPonderado(CATALOGO.filter(c => c.league===player.league && c.category!=="elite" && c.club.name!==player.club.name
      && shareMinutos(player.ovr, c.nivel, player.age, 0, false)>=0.5), ()=>1, 1)[0];
    if(cand) ofertas = [{club:cand.club, league:cand.league, tier:cand.tier, category:cand.category, nivel:cand.nivel, div:cand.div, salto:false,
      shareEsp:shareMinutos(player.ovr, cand.nivel, player.age, 0, false), motivo:"O clube sugere um empréstimo para você ganhar minutos", tipo:"emprestimo"},
      ...ofertas.filter(o => o.club.name!==cand.club.name).slice(0,2)];
  }
  // Fim de empréstimo: o clube onde jogou pode querer ficar em definitivo
  if(fimEmprestimo && ctx.fase!=="ruim" && Math.random()<0.75){
    const e = CATALOGO.find(c => c.club.name===player.club.name);
    if(e) ofertas = [{club:e.club, league:e.league, tier:e.tier, category:e.category, nivel:e.nivel, div:e.div, salto:false,
      shareEsp: shareMinutos(player.ovr, e.nivel, player.age, 0, false), motivo:"Quer contratar você em definitivo", tipo:"definitivo"},
      ...ofertas.slice(0,2)];
  }
  if(fimEmprestimo && !ofertas.length) ficarNoClube();     // ninguém quis: volta automaticamente ao clube de origem
  return ofertas;
}
// Decisão automática (modo rápido): compara as propostas com a opção de ficar/voltar.
export function melhorOferta(offers){
  if(!offers.length) return null;
  const nivelFicar = player.emprestimo ? (CATALOGO.find(c=>c.club.name===player.emprestimo.dono.name)||{nivel:nivelAtual()}).nivel : nivelAtual();
  const atual = shareMinutos(player.ovr, nivelFicar, player.age, 0, false)*30 + nivelFicar*0.6;
  const score = o => o.shareEsp*30 + o.nivel*0.6 + (player.age>29 && o.tier===2 ? 5 : 0) + (o.tipo==="emprestimo" ? 2 : 0);
  const melhor = offers.slice().sort((a,b)=>score(b)-score(a))[0];
  if(!ultimoMercado.podeFicar) return melhor;            // dispensado: precisa escolher uma das propostas
  return score(melhor) > atual + 2 ? melhor : null;
}
// Mudança de clube. Empréstimo guarda o clube de origem; contratação definitiva encerra o vínculo anterior.
export function aplicarTransferencia(o){
  if(o.tipo==="emprestimo") player.emprestimo = {dono: player.club, ano: player.year};
  else player.emprestimo = null;
  player.club = o.club; player.league = o.league; player.tier = o.tier; player.category = o.category;
  player.moral = Math.min(95, player.moral + 4);         // recomeço renova a confiança
  sincronizarClubeDoJogador();
}
// "Ficar": permanece no clube ou, no fim de um empréstimo, volta ao clube de origem.
export function ficarNoClube(){
  if(!player.emprestimo) return;
  const dono = CATALOGO.find(c => c.club.name===player.emprestimo.dono.name);
  player.emprestimo = null;
  if(dono){ player.club = dono.club; player.league = dono.league; player.tier = dono.tier; player.category = dono.category; }
  sincronizarClubeDoJogador();
}
// Clube exibido na opção de ficar (o de origem, no fim de um empréstimo)
export function clubeDoFicar(){
  if(!player.emprestimo) return CATALOGO.find(c => c.club.name===player.club.name) || {club:player.club, league:player.league, div:player.div, category:player.category, nivel:nivelAtual()};
  return CATALOGO.find(c => c.club.name===player.emprestimo.dono.name);
}
export function sortearClube(filtro){
  const c = CATALOGO.filter(x => x.club.name!==player.club.name && filtro(x));
  return c.length ? pick(c) : null;
}
