import { player } from '../engine/jogador.js';
import { nomeTrofeu } from '../engine/temporada.js';
import { posTemporada } from './app.js';
import { clube } from './champions.js';
import { ui } from './estado.js';
import { stats3Final } from './final.js';
import { $, crest, esc, flagSel } from './visual.js';

/* ===================== HISTÓRICO INTERNACIONAL (abas e tela final) ===================== */
export const placar = m => `${flagSel(m.a,16)} ${esc(m.a)} <b>${m.ga} – ${m.gb}</b> ${esc(m.b)} ${flagSel(m.b,16)}${m.pen?` <span class="muted small">(${m.pen.a}–${m.pen.b} pên.)</span>`:m.prorrog?` <span class="muted small">(prorrog.)</span>`:""}`;
export const chipsJog = j => !j ? "" : !j.jogou ? `<span class="jchip off">Não jogou</span>` : `<span class="jchips"><span class="jchip">⚽ ${j.gols}</span><span class="jchip">🅰️ ${j.ast}</span></span>`;
export function minhasPartidas(t){
  const mine = m => m.a===t.nat || m.b===t.nat;
  const g = t.grupos[t.meuGrupo].partidas.filter(mine).map(m => ({...m, fase:`Grupo ${t.grupos[t.meuGrupo].nome} · rodada ${m.rodada}`}));
  const k = t.mata.flatMap(r => r.partidas.filter(mine).map(m => ({...m, fase:r.nome})));
  return [...g, ...k];
}
export function tabelaGrupoHTML(g, nat, qualif=true){
  return `<table class="tt"><thead><tr><th></th><th>Seleção</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${
    g.tabela.map(r => `<tr class="${r.nome===nat?"mine":""} ${r.classificado?"q":""}"><td>${r.pos}</td><td>${flagSel(r.nome,16)} ${esc(r.nome)}</td><td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.d}</td><td>${r.sg>0?"+":""}${r.sg}</td><td><b>${r.pts}</b></td></tr>`).join("")}</tbody></table>`;
}
export function itemTorneioHTML(t){
  const cab = `<span class="tn">${flagSel(t.nat,18)} <b>${esc(t.nome)}</b> <span class="muted">${t.rotulo}</span></span>`;
  if(t.status==="nao_classificada") return `<div class="tor-item flat">${cab}<span class="jchip off">Seleção não se classificou</span></div>`;
  if(t.status==="nao_convocado") return `<div class="tor-item flat">${cab}<span class="jchip off">Não foi convocado</span></div>`;
  return `<details class="tor-item"><summary>${cab}<span class="fase ${t.titulo?"win":""}">${t.titulo?"🏆 ":""}${esc(t.faseRotulo)}</span>
      <span class="muted small">${t.jogador.jogos} J · ${t.jogador.gols} G · ${t.jogador.ast} A</span></summary>
    <div class="tor-det">${tabelaGrupoHTML(t.grupos[t.meuGrupo], t.nat)}
      <div class="lbl" style="margin:10px 0 6px">Seus jogos no torneio</div>
      ${minhasPartidas(t).map(m => `<div class="mrow mine"><span class="muted small">${esc(m.fase)}</span><span>${placar(m)}</span>${chipsJog(m.jog)}</div>`).join("")}
      <div class="small muted" style="margin-top:8px">Campeã: ${flagSel(t.campeao,14)} ${esc(t.campeao)} · Vice: ${esc(t.vice)}</div></div></details>`;
}
export function selecaoHTML(){
  const R = player.selReg, T = player.selTor, S = player.sel;
  const box = (tit,x) => `<div class="selbox"><span class="lbl">${tit}</span><div><b>${x.games}</b><small>J</small> <b>${x.goals}</b><small>G</small> <b>${x.assists}</b><small>A</small></div></div>`;
  return `<div class="selboxes">${box("Total pela seleção",S)}${box("Torneios finais",T)}${box("Amistosos e partidas oficiais",R)}</div>
    <div class="lbl" style="margin:16px 0 8px">Histórico internacional</div>
    ${player.torneios.length ? player.torneios.map(itemTorneioHTML).join("") : `<div class="evt-empty">Nenhuma competição de seleções disputada ainda. As edições aparecem conforme o calendário internacional e a sua convocação.</div>`}`;
}

/* ===================== TELA DE TORNEIO (itens 3.2 a 3.5) ===================== */
export function mostrarTorneio(t, season){
  ui.torUI = {t, fase:"grupos", season};
  $("screen-season").classList.add("hidden");
  $("screen-torneio").classList.remove("hidden");
  renderTorneio();
  window.scrollTo({top:0});
}
export function htmlGrupos(t){
  const g = t.grupos[t.meuGrupo], eu = g.tabela.find(r=>r.nome===t.nat);
  const rod = [1,2,3].map(r => `<div class="lbl" style="margin:12px 0 6px">Rodada ${r}</div>` + g.partidas.filter(m=>m.rodada===r).map(m => {
    const mine = m.a===t.nat || m.b===t.nat;
    return `<div class="mrow ${mine?"mine":""}"><span>${placar(m)}</span>${mine?chipsJog(m.jog):""}</div>`;
  }).join("")).join("");
  const outros = t.grupos.filter((_,i)=>i!==t.meuGrupo).map(o => `<div class="og"><div class="lbl">Grupo ${o.nome}</div>${tabelaGrupoHTML(o, t.nat)}</div>`).join("");
  return `<div class="tor-two"><div><div class="lbl" style="margin-bottom:6px">Grupo ${g.nome} — classificação</div>${tabelaGrupoHTML(g,t.nat)}
      <p class="small ${eu.classificado?"ok":"bad"}">${eu.classificado ? `✔ ${esc(t.nat)} terminou em ${eu.pos}º lugar e avançou para o mata-mata.` : `✖ ${esc(t.nat)} terminou em ${eu.pos}º lugar e foi eliminada na fase de grupos.`}</p></div>
    <div><div class="lbl" style="margin-bottom:2px">Partidas</div>${rod}</div></div>
    ${t.grupos.length>1?`<details class="outros"><summary>Ver os outros ${t.grupos.length-1} grupos</summary><div class="og-grid">${outros}</div></details>`:""}`;
}
export function htmlMata(t){
  return t.mata.map(r => `<div class="lbl" style="margin:14px 0 6px">${esc(r.nome)}</div>` + r.partidas.map(m => {
    const mine = m.a===t.nat || m.b===t.nat;
    return `<div class="mrow ${mine?"mine":""}"><span>${placar(m)}</span>${mine?chipsJog(m.jog):""}</div>`;
  }).join("")).join("") + `<p class="small" style="margin-top:14px">🏆 Campeã: ${flagSel(t.campeao,16)} <b>${esc(t.campeao)}</b></p>`;
}
export function htmlResumo(t, s){
  const c = t.conseq, tor = t.jogador;
  const efeitos = [];
  if(c.rep>0) efeitos.push(`Reputação +${c.rep}`);
  if(c.mult>1.05) efeitos.push("Valor de mercado em alta");
  if(c.interesse>=0.1) efeitos.push("Clubes maiores passam a observá-lo");
  if(c.bonusOvr) efeitos.push("OVR +1 pelo grande torneio");
  if(!efeitos.length) efeitos.push("Sem impacto relevante na carreira");
  const clubeTit = s.trofeus.map(k => nomeTrofeu(k, s.league));
  return `<div class="sum-grid">
    <div class="sumcard"><div class="lbl">Temporada ${s.year} pelo clube</div>
      <div class="sum-club">${crest(s.clubRef,44)}<b>${esc(s.clubRef.name)}</b></div>
      <div class="stats3 boxed">${stats3Final(s.games,s.goals,s.assists)}</div>
      <div class="small muted" style="margin-top:8px">${clubeTit.length ? "🏆 "+esc(clubeTit.join(" · ")) : "Sem títulos de clube nesta temporada"}</div></div>
    <div class="sumcard gold"><div class="lbl gold">${esc(t.nome)} ${t.rotulo}</div>
      <div class="sum-club">${flagSel(t.nat,40)}<b>${esc(t.nat)}</b></div>
      <div class="stats3 boxed">${stats3Final(tor.jogos,tor.gols,tor.ast)}</div>
      <div class="fase-big ${t.titulo?"win":""}">${t.titulo?"🏆 ":""}${esc(t.faseRotulo)}</div></div></div>
    <p class="small" style="margin-top:14px"><span class="muted">Consequências:</span> ${efeitos.join(" · ")}</p>
    <p class="small muted">As estatísticas do torneio ficam registradas no histórico da seleção e não se misturam às do clube nesta temporada.</p>`;
}
export function renderTorneio(){
  const {t, fase, season} = ui.torUI;
  $("tor-comp").textContent = t.nome.toUpperCase();
  $("tor-title").innerHTML = `${flagSel(t.nat,34)} <span>${t.rotulo} · ${esc(t.nat)}</span>`;
  const passos = ["grupos","mata","resumo"], nomes = {grupos:"Fase de grupos", mata:"Mata-mata", resumo:"Resumo"};
  $("tor-steps").innerHTML = passos.map(p => `<span class="${p===fase?"on":""}">${nomes[p]}</span>`).join("");
  $("tor-body").innerHTML = fase==="grupos" ? htmlGrupos(t) : fase==="mata" ? htmlMata(t) : htmlResumo(t, season);
  $("tor-next").textContent = fase==="grupos" ? (t.fase==="grupos" ? "Ver resumo" : "Avançar para o mata-mata ▶") : fase==="mata" ? "Ver resumo" : "Continuar carreira";
}
$("tor-next").onclick = () => {
  const t = ui.torUI.t;
  if(ui.torUI.fase==="grupos") ui.torUI.fase = (t.fase==="grupos") ? "resumo" : "mata";
  else if(ui.torUI.fase==="mata") ui.torUI.fase = "resumo";
  else { const s = ui.torUI.season; ui.torUI = null; posTemporada(s); return; }
  renderTorneio(); window.scrollTo({top:0});
};
