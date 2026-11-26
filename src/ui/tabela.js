import { UCL } from '../data/europa.js';
import { player } from '../engine/jogador.js';
import { clube } from './champions.js';
import { ui } from './estado.js';
import { notaBadge } from './relatorio.js';
import { clubColor, crest, esc, flagHTML, iconeTrofeu, ovrTier, rgba, textOn, trofeusHTML } from './visual.js';

/* ===================== TABELA POR IDADE ===================== */
export function rowBg(col){ return `background:linear-gradient(90deg, ${rgba(col,.30)}, rgba(23,23,26,0) 78%), #17171a;`; }
export const num3 = (g,gl,a) => `<div class="num"><i>👕</i>${g}</div><div class="num"><i>⚽</i>${gl}</div><div class="num"><i>👟</i>${a}</div>`;
export const dim3 = () => `<div class="num dim">–</div><div class="num dim">–</div><div class="num dim">–</div>`;
export const selTitulos = () => player.titulosConquistados.filter(t => ["mundo","continental","olimpico"].includes(t.kind));

// Posição final na liga e acesso/rebaixamento da temporada
export function ligaChips(s){
  const l = s.liga; if(!l) return "";
  const pos = `<span class="pchip ${l.pos===1?"win":""}" title="${esc(l.divNome)}: ${l.pos}º de ${l.total}">${l.div===2?"B·":""}${l.pos}º</span>`;
  const mv = l.movimento==="rebaixado" ? `<span class="mvchip down" title="Rebaixado">▼<span class="mvt"> REB</span></span>`
           : l.movimento==="acesso" ? `<span class="mvchip up" title="Acesso">▲<span class="mvt"> ACESSO</span></span>` : "";
  return pos + mv;
}
export function rowHist(s, idx){
  const col = clubColor(s.clubRef.name);
  const extras = (s.lesao && s.lesao.tipo!=="pontual" ? `<span class="inj" title="${esc(s.lesao.nome)} · ${s.lesao.jogos} jogos fora">🩹</span>` : "")
               + (s.emprestimo ? `<span class="empchip" title="Emprestado pelo ${esc(s.emprestimo)}">EMP</span>` : "");
  const icons = s.trofeus.map(k => iconeTrofeu(k,15)).join("");
  const ucl = s.ucl && s.ucl.fase ? `<span class="tchip ucl ${s.ucl.titulo?"win":""}" title="Champions League ${s.ucl.ano} — ${esc(s.ucl.faseRotulo)}">UCL</span>` : "";
  const chips = s.torneios.filter(t=>t.status==="jogou").map(t => `<span class="tchip ${t.titulo?"win":""}" title="${esc(t.nome+" "+t.rotulo+" — "+t.faseRotulo)}">${t.abrev}</span>`).join("");
  return `<div class="trow clickable" data-idx="${idx}" title="Ver relatório da temporada" style="${rowBg(col)}">
    <div class="age-dot" style="background:${col};color:${textOn(col)}">${s.age}</div>
    <div class="club">${crest(s.clubRef,20)}<span class="cname">${esc(s.clubRef.name)}</span>${icons}${ucl}${chips}${s.bad?'<span class="down">↓</span>':""}${extras}${ligaChips(s)}</div>
    <div class="ovr-pill ${ovrTier(s.ovrBefore)}">${s.ovrBefore}</div>
    <div class="num">${notaBadge(s.nota)}</div>
    ${num3(s.games,s.goals,s.assists)}</div>`;
}
export function rowAtual(){
  if(ui.pendingOffers.length>0 || player.pendingEvent){
    return `<div class="trow current"><div class="age-dot" style="background:#2a2a30;color:#fff">${player.age}</div>
      <div class="club dim"><span class="qmark">?</span><span class="cname">${player.pendingEvent?"Decisão pendente…":"Escolhendo clube…"}</span></div>
      <div class="ovr-pill ${ovrTier(player.ovr)}">${player.ovr}</div><div class="num dim">–</div>${dim3()}</div>`;
  }
  const col = clubColor(player.club.name);
  return `<div class="trow current" style="${rowBg(col)}">
    <div class="age-dot" style="background:${col};color:${textOn(col)}">${player.age}</div>
    <div class="club">${crest(player.club,20)}<span class="cname">${esc(player.club.name)}</span></div>
    <div class="ovr-pill ${ovrTier(player.ovr)}">${player.ovr}</div><div class="num dim">–</div>${dim3()}</div>`;
}
export function rowSelecao(){
  return `<div class="trow sel">
    <div class="age-dot" style="background:#26262c">${flagHTML(player.nat,26)}</div>
    <div class="club"><span class="cname">${esc(player.nat)}</span>${trofeusHTML(selTitulos(),16)}</div>
    <div></div><div></div>${num3(player.sel.games,player.sel.goals,player.sel.assists)}</div>`;
}
export function renderTable(container, final){
  let html = `<div class="thead"><span>IDADE</span><span>CLUBE</span><span>OVR</span><span>NOTA</span><span>JOGOS</span><span>GOLS</span><span>AST</span></div>`;
  player.history.forEach((s,i) => html += rowHist(s,i));
  if(!final){
    if(player.age <= 39) html += rowAtual();
    for(let a=player.age+1; a<=39; a++) html += `<div class="trow future"><div class="age-dot">${a}</div></div>`;
  }
  html += rowSelecao();
  container.innerHTML = html;
}
