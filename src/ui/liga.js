import { PAISES } from '../data/clubes.js';
import { CLUBES_POR_NOME } from '../engine/clubes.js';
import { player } from '../engine/jogador.js';
import { ultimasLigas } from '../engine/liga.js';
import { championsHTML } from './champions.js';
import { crest, esc, flagHTML } from './visual.js';

/* ===================== ABA LIGA ===================== */
// Classificação final da última temporada no país do clube atual, com as zonas de acesso e rebaixamento.

export function tabelaLigaHTML(d, r, meu){
  const n = d.tabela.length, k = r.k;
  const zona = t => d.div===1 ? (k && t.pos>n-k ? "z-reb" : t.pos===1 ? "z-camp" : "")
                              : (k && t.pos<=k ? "z-ace" : "");
  return `<table class="tt liga"><thead><tr><th></th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${
    d.tabela.map(t => {
      const c = CLUBES_POR_NOME[t.nome] || {name:t.nome};
      return `<tr class="${zona(t)} ${t.nome===meu?"mine":""}"><td>${t.pos}</td><td class="lc">${crest(c,16)} ${esc(t.nome)}</td><td>${t.j}</td><td>${t.v}</td><td>${t.empates}</td><td>${t.d}</td><td>${t.sg>0?"+":""}${t.sg}</td><td><b>${t.pts}</b></td></tr>`;
    }).join("")}</tbody></table>`;
}

export const listaClubes = nomes => nomes.map(n => `<span class="mv-club">${crest(CLUBES_POR_NOME[n] || {name:n},18)} ${esc(n)}</span>`).join("");

export function ligaHTML(){
  const ult = player.history[player.history.length-1];
  const pais = ult ? ult.league : player.league;
  const r = ultimasLigas[pais];
  if(!r) return `<div class="evt-empty">A classificação aparece depois da primeira temporada.</div>`;
  const meu = ult ? ult.clubRef.name : player.club.name;
  const divMinha = ult && ult.liga ? ult.liga.div : 1;
  const outra = r.divs.find(d => d.div!==divMinha), minha = r.divs.find(d => d.div===divMinha);
  const P = PAISES[pais];
  const mov = r.k
    ? `<div class="mv-box"><div><div class="lbl down-t">Rebaixados para a ${esc(r.divs[1].nome)}</div>${listaClubes(r.caem)}</div>
       <div><div class="lbl up-t">Promovidos para a ${esc(r.divs[0].nome)}</div>${listaClubes(r.sobem)}</div></div>`
    : `<p class="small muted">A ${esc(P.liga)} é uma liga fechada: não há acesso nem rebaixamento.</p>`;
  return `<div class="liga-head">${flagHTML(pais,20)} <b>${esc(minha.nome)}</b> <span class="muted">${r.ano}</span></div>
    ${mov}
    ${tabelaLigaHTML(minha, r, meu)}
    <p class="small muted legend">${r.k ? (divMinha===1 ? `<span class="sw z-reb"></span> zona de rebaixamento (${r.k})` : `<span class="sw z-ace"></span> zona de acesso (${r.k})`) : ""}</p>
    <details class="outros"><summary>Ver a ${esc(outra.nome)}</summary>${tabelaLigaHTML(outra, r, meu)}</details>
    ${ult && ult.ucl && ult.ucl.fase ? championsHTML(ult.ucl) : ""}`;
}
