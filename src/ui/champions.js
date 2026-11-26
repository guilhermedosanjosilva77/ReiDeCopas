import { CLUBES_POR_NOME } from '../engine/clubes.js';
import { crest, esc, trophyUCL } from './visual.js';

/* ===================== CHAMPIONS LEAGUE NA ABA LIGA ===================== */
export const clube = n => CLUBES_POR_NOME[n] || {name:n};
export const nomeC = (n, meu) => `<span class="ucl-t ${n===meu?"mine":""}">${crest(clube(n),16)} ${esc(n)}</span>`;

export function confrontoHTML(c, meu){
  const v = n => c.venc===n ? "venc" : "";
  return `<div class="ucl-tie ${c.a===meu||c.b===meu?"meu":""}">
    <div class="${v(c.a)}">${nomeC(c.a, meu)}<b>${c.agg[0]}</b></div>
    <div class="${v(c.b)}">${nomeC(c.b, meu)}<b>${c.agg[1]}</b></div>
    <small>ida ${c.ida.ga}–${c.ida.gb} · volta ${c.volta.ga}–${c.volta.gb}${c.pen?" · pênaltis":""}</small></div>`;
}

export function championsHTML(u){
  if(!u) return "";
  const meu = u.meu, f = u.mata[u.mata.length-1].final;
  const zona = p => p<=8 ? "z-ace" : p<=24 ? "z-play" : "z-reb";
  const tab = u.tabela.map(t => `<tr class="${zona(t.pos)} ${t.nome===meu?"mine":""}"><td>${t.pos}</td><td class="lc">${crest(clube(t.nome),16)} ${esc(t.nome)}</td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.sg>0?"+":""}${t.sg}</td><td><b>${t.pts}</b></td></tr>`).join("");
  return `<div class="ucl-box">
    <div class="ucl-head">${trophyUCL(38)}<div><div class="lbl">UEFA Champions League ${u.ano}</div>
      <div class="ucl-res">${esc(u.faseRotulo)}</div>
      <div class="small muted">${u.posLiga}º na fase de liga · você: ${u.jogador.jogos} ${u.jogador.jogos===1?"jogo":"jogos"}, ${u.jogador.gols} ${u.jogador.gols===1?"gol":"gols"}, ${u.jogador.ast} ${u.jogador.ast===1?"assistência":"assistências"}</div></div></div>
    <div class="ucl-final"><span class="lbl">Final</span>${nomeC(f.a, meu)} <b>${f.ga} × ${f.gb}</b> ${nomeC(f.b, meu)}${f.pen?` <small class="muted">(pênaltis ${f.pen.a}–${f.pen.b})</small>`:f.prorrog?` <small class="muted">(prorrogação)</small>`:""}
      <div class="small">Campeão: <b>${esc(u.campeao)}</b></div></div>
    ${u.mata.slice(0,-1).slice().reverse().map(r => `<details class="outros" ${r.confrontos.some(c=>c.a===meu||c.b===meu)?"open":""}><summary>${r.nome}</summary><div class="ucl-ties">${r.confrontos.map(c=>confrontoHTML(c,meu)).join("")}</div></details>`).join("")}
    <details class="outros"><summary>Fase de liga (36 clubes)</summary>
      <table class="tt liga"><thead><tr><th></th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${tab}</tbody></table>
      <p class="small muted legend"><span class="sw z-ace"></span> oitavas · <span class="sw z-play"></span> playoffs · <span class="sw z-reb"></span> eliminados</p></details>
  </div>`;
}
