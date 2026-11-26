import { ATACANTES } from '../data/base.js';
import { LIGAS, PAISES } from '../data/clubes.js';
import { consequenciasChampions, disputaChampions, simularChampions } from './champions.js';
import { entradaDe, nivelAtual, shareMinutos, sincronizarClubeDoJogador } from './clubes.js';
import { atualizarMoral, classeNota, evolucaoOVR, faseDaNota, minutosPorJogo, notaDaTemporada, papelNoElenco, perfDaNota, perspectiva, potencialEstimado, revisarPotencial, sortearAtuacao, sortearLesao } from './desenvolvimento.js';
import { PROD_ESPERADA, classificarFase } from './fase.js';
import { atualizarValor, player } from './jogador.js';
import { aplicarMovimentos, simularLigas, situacaoDoClube } from './liga.js';
import { PESO_AST, PESO_GOL, simularSelecaoRegular, simularTorneiosDoAno } from './selecao.js';
import { clamp, poisson } from './util.js';

/* ===================== SIMULAÇÃO DA TEMPORADA ===================== */
// Ordem: atuação → minutos/lesão → estatísticas → liga → nota → seleção → evolução (OVR, potencial,
// físico, moral) → reputação e valor → relatório. Cada temporada influencia a seguinte.
export function simularTemporada(){
  const ageAntes = player.age, ovrAntes = player.ovr, clubAtual = player.club, ligaAtual = player.league;
  const catAtual = player.category, tierAtual = player.tier;
  const ef = player.efeitos || {};
  const nivel = nivelAtual();
  const entrada = entradaDe(clubAtual.name);
  const isAttacker = ATACANTES.includes(player.pos);
  const repAntes = player.rep, valorAntes = player.value;

  // Ritmo: quem voltou de lesão grave precisa readaptar-se (Parte 5)
  const ult = player.history[player.history.length-1];
  const voltaDeLesao = ult && ult.lesao && ult.lesao.tipo==="grave";
  const ritmo = voltaDeLesao ? -3 : 0;

  // 1) Atuação individual (desempenho "real" da temporada, antes de qualquer número)
  const atuacao = sortearAtuacao({ovr:ovrAntes, nivel, fase:player.fase, moral:player.moral,
                                  forma:clamp(ef.forma||0, -1, 1), ritmo, consistencia:player.consistencia});

  // 2) Minutos: quem joga bem ganha espaço; quem volta de lesão perde
  let share = shareMinutos(ovrAntes, nivel, ageAntes, (ef.minutos||0) + (atuacao-56)/110 - (voltaDeLesao ? 0.08 : 0));
  const disponiveis = 30 + Math.floor(Math.random()*9);
  const lesao = sortearLesao({age:ageAntes, share, ano:player.year});
  let games = Math.round(disponiveis*share*(ef.jogosMult||1));
  if(lesao) games -= Math.min(games, Math.round(lesao.jogos*share + (lesao.tipo==="grave" ? 2 : 0)));
  games = Math.max(lesao && lesao.tipo==="grave" ? 0 : 1, games);
  share = clamp(games/disponiveis, 0, 1);
  const atu = lesao && lesao.tipo!=="pontual" ? atuacao - (lesao.tipo==="grave" ? 4 : 2) : atuacao;

  // 3) Estatísticas ajustadas à posição (produção esperada × qualidade da atuação)
  const esp = PROD_ESPERADA[player.pos] || {g:.1, a:.1};
  const q = Math.exp((atu-58)/30), gm = ef.golsMult || 1;
  const goals = poisson(games*esp.g*q*gm);
  const assists = poisson(games*esp.a*q*(1+(gm-1)*0.5));

  // 4) Liga: o jogador influencia o próprio clube conforme minutos e atuação
  const ajusteClube = entrada
    ? clamp(share*((ovrAntes-(entrada.forca+entrada.deriva))*0.12 + (atu-56)/7) + ((ef.titulo||1)-1)*8, -4, 6) : 0;
  // Champions League: vaga conquistada na liga da temporada anterior (antes de simular a liga deste ano)
  let ucl = null;
  if(PAISES[ligaAtual] && !PAISES[ligaAtual].semUEFA && disputaChampions(clubAtual.name)){
    const fq = clamp(0.5 + (atu-50)/30, 0.4, 1.8);
    ucl = simularChampions(player.year, {meu:clubAtual.name, ajuste:ajusteClube*0.5,
      jog:{pJogar:clamp(share*1.05, 0.08, 0.97), pGol:PESO_GOL[player.pos]*fq, pAst:PESO_AST[player.pos]*fq}});
  }
  const cU = ucl ? consequenciasChampions(ucl) : {rep:0, mult:1, interesse:0, nota:0};
  const ligas = simularLigas(player.year, {[clubAtual.name]: ajusteClube});
  const naLiga = situacaoDoClube(ligas, clubAtual.name);
  aplicarMovimentos(ligas);

  const catMult = catAtual==="elite" ? 1 : catAtual==="serieA" ? 0.45 : 0.15;
  const tierMult = tierAtual===1 ? 1 : 0.7;
  const trofeus = [];
  if(games>=12 && naLiga && naLiga.pos===1) trofeus.push(naLiga.div===1 ? "liga" : "liga2");
  const perfAtu = perfDaNota(atu);
  if(games>=12 && Math.random() < 0.14*catMult*tierMult*[1.3,1,0.5,0.1][perfAtu]*(ef.titulo||1)) trofeus.push("copa");
  if(ucl && ucl.titulo && ucl.jogador.jogos>=3) trofeus.push("champions");

  // 5) Nota da temporada (0–100) e faixa de desempenho
  const nota = Math.min(99, Math.round(notaDaTemporada({atuacao:atu, share, games, goals, assists, nivel, titulos:trofeus.length>0, pos:player.pos}) + cU.nota));
  const perf = perfDaNota(nota);

  // Prêmios individuais: dependem da nota, não do OVR
  const ligaNome = LIGAS[ligaAtual] || ligaAtual;
  const premios = [];
  if(games>=22){
    if(isAttacker && goals>=20 && nota>=72 && Math.random()<0.55) premios.push({nome:`Artilheiro · ${ligaNome}`, icon:"👟"});
    if(nota>=82 && Math.random()<0.5) premios.push({nome:`Melhor Jogador · ${ligaNome}`, icon:"⭐"});
    const ouroUCL = trofeus.includes("champions");
    if(nota>=(ouroUCL?85:88) && ovrAntes>=85 && (tierAtual===1 || ouroUCL) && catAtual==="elite" && Math.random()<(ouroUCL?0.55:0.4)) premios.push({nome:"Bola de Ouro", icon:"🥇"});
  }

  // 6) Seleção: desempenho recente, nível do clube e histórico (não só OVR)
  const ctxSel = {nota, nivel};
  const selReg = simularSelecaoRegular(perf, isAttacker, ovrAntes, ageAntes, ef, ctxSel);
  const torneios = simularTorneiosDoAno(perf, ovrAntes, ageAntes, ef, player.year, ctxSel);
  const conseq = torneios.filter(t=>t.status==="jogou").map(t => t.conseq);
  const somaC = k => conseq.reduce((s,c)=>s+c[k],0);
  const convocado = selReg.convocado || torneios.some(t => t.status==="jogou");
  if(convocado) player.convocacoes++;

  trofeus.forEach(k => player.titulosConquistados.push({year:player.year, kind:k, club:clubAtual.name, titulo:nomeTrofeu(k, ligaAtual)}));
  torneios.filter(t=>t.status==="jogou" && t.titulo).forEach(t => player.titulosConquistados.push({
    year:player.year, kind:t.tipo, club:`Seleção ${player.nat}`, titulo:t.nome}));
  premios.forEach(p => player.premios.push({year:player.year, nome:p.nome, icon:p.icon}));

  // 7) Evolução do OVR (idade, potencial, nota, minutos, ambiente, lesões)
  const dOvr = evolucaoOVR({age:ageAntes, ovr:ovrAntes, pos:player.pos, nota, share, nivel, categoria:catAtual, lesao,
                            extra:(ef.ovr||0) + somaC("bonusOvr")});
  player.ovr = clamp(ovrAntes + dOvr, 40, 99);
  if(lesao) player.lesoes.push({ano:player.year, tipo:lesao.tipo, nome:lesao.nome, jogos:lesao.jogos});

  // 8) Reputação: construída por desempenho, títulos, prêmios e seleção (não substitui o momento atual)
  const visib = catAtual==="elite" ? 1.3 : catAtual==="serieA" ? 1 : 0.75;
  let dRep = nota>=55 ? (nota-55)/4.5*visib*(tierAtual===1?1.15:1) : (nota-55)/5;
  dRep += (trofeus.includes("liga")?3:0) + (trofeus.includes("liga2")?1:0) + (trofeus.includes("copa")?2:0)
        + premios.length*2 + somaC("rep") + (convocado ? 1 : 0) + cU.rep;
  if(naLiga && naLiga.movimento==="rebaixado" && games>=12) dRep -= 2;
  if(ageAntes>=33 && share<0.4) dRep -= 2;                      // reputação também se desgasta sem jogar
  player.rep = clamp(Math.round(player.rep + dRep), 10, 100);

  // 9) Forma e valor de mercado
  const scoreForma = clamp((nota-20)/70 + somaC("forma"), 0, 1);
  player.forma.push(scoreForma);
  atualizarValor(conseq.reduce((m,c)=>m*c.mult, 1) * cU.mult);
  player.peakOvr = Math.max(player.peakOvr, player.ovr);
  player.peakValue = Math.max(player.peakValue, player.value);
  player.fase = faseDaNota(nota);

  // 10) Registro da temporada (estatísticas do CLUBE separadas das da seleção)
  // Jogos do clube = liga + Champions League (a nota e a fase vêm da temporada inteira, puxada pela liga)
  const uJ = ucl ? ucl.jogador : {jogos:0, gols:0, ast:0};
  const season = {age:ageAntes, year:player.year, clubRef:clubAtual, league:ligaAtual, category:catAtual,
    games:games+uJ.jogos, goals:goals+uJ.gols, assists:assists+uJ.ast, jogosLiga:games, golsLiga:goals, astLiga:assists, ucl, ovrBefore:ovrAntes, ovr:player.ovr, ovrChange:player.ovr-ovrAntes,
    trofeus, bad:nota<46, perf, share, sel:selReg, torneios, liga:naLiga,
    nota, notaClasse:classeNota(nota), nivel, atuacao:Math.round(atu), papel:papelNoElenco(share),
    minutos: games*minutosPorJogo(share), lesao, premios:premios.map(p=>p.nome), convocado,
    emprestimo: player.emprestimo ? player.emprestimo.dono.name : null,
    repAntes, repDepois:player.rep, valorAntes, valorDepois:player.value};
  player.history.push(season);
  season.marcos = revisarPotencial(season);
  season.marcos.forEach(m => player.marcos.push({ano:player.year, ...m}));
  atualizarMoral(season);
  season.faseRecente = classificarFase();
  season.potEstimado = potencialEstimado().texto;
  season.perspectiva = perspectiva(season);

  const tg = torneios.filter(t=>t.status==="jogou");
  const tor = tg.reduce((a,t)=>({g:a.g+t.jogador.jogos, gl:a.gl+t.jogador.gols, as:a.as+t.jogador.ast}), {g:0,gl:0,as:0});
  player.stats.games   += season.games + selReg.games + tor.g;
  player.stats.goals   += season.goals + selReg.goals + tor.gl;
  player.stats.assists += season.assists + selReg.assists + tor.as;
  player.selReg.games += selReg.games; player.selReg.goals += selReg.goals; player.selReg.assists += selReg.assists;
  player.selTor.games += tor.g; player.selTor.goals += tor.gl; player.selTor.assists += tor.as;
  player.sel.games += selReg.games + tor.g; player.sel.goals += selReg.goals + tor.gl; player.sel.assists += selReg.assists + tor.as;
  player.torneios.push(...torneios);

  // Desfecho das decisões tomadas no fim da temporada anterior
  player.eventos.log.forEach(e => { if(e.desfecho===null && e.ano < season.year){
    e.desfecho = `${season.year}: ${games} jogos, ${goals} gols, ${assists} ast no ${clubAtual.name} · nota ${nota} · OVR ${ovrAntes}→${player.ovr}` + (trofeus.length?" · 🏆":"");
  }});

  player.efeitos = {interesse: Math.min(0.5, somaC("interesse") + cU.interesse)};
  if(player.mercadoDistante>0) player.mercadoDistante--;
  sincronizarClubeDoJogador();
  player.age++; player.year++;
  return season;
}

// Nome de exibição de um troféu de clube
export function nomeTrofeu(k, liga){
  const P = PAISES[liga];
  if(k==="liga")  return P ? P.titulos[0] : "Campeonato Nacional";
  if(k==="liga2") return P ? P.titulos[1] : "2ª divisão";
  if(k==="champions") return "UEFA Champions League";
  return (P && P.copa) || "Copa Nacional";
}
