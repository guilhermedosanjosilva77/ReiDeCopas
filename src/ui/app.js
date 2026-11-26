import { NACOES, NAT_INFO, POSICOES } from '../data/base.js';
import { chanceAposentadoria, definirPrimeiroClube, iniciarCarreira, jogarCarreiraAutomatica, sortearPrimeiroClube } from '../engine/carreira.js';
import { clubesDe, corShare, ligaInicial, nivelAtual, nomeDivisao, rotuloCategoria, rotuloShare, shareMinutos } from '../engine/clubes.js';
import { resolverEvento, selecionarEvento } from '../engine/eventos.js';
import { NOME_FASE, classificarFase } from '../engine/fase.js';
import { player } from '../engine/jogador.js';
import { aplicarTransferencia, calcularOfertas, clubeDoFicar, ficarNoClube, ultimoMercado } from '../engine/mercado.js';
import { simularTemporada } from '../engine/temporada.js';
import { embaralhar } from '../engine/util.js';
import { clube } from './champions.js';
import { ui } from './estado.js';
import { renderEventosTab } from './eventos.js';
import { finalizarCarreira } from './final.js';
import { ligaHTML } from './liga.js';
import { chipsDesenvolvimento, resumoHTML } from './relatorio.js';
import { mostrarTorneio, selecaoHTML } from './selecao.js';
import { renderTable } from './tabela.js';
import { $, clubColor, crest, esc, flagHTML, fmtValor, ovrTier, rgba, trofeusHTML } from './visual.js';

/* ===================== INICIALIZAÇÃO ===================== */
export const selPos = $("p-pos");
for(let k in POSICOES) selPos.innerHTML += `<option value="${k}">${POSICOES[k]}</option>`;
export const selNat = $("p-nat");
NACOES.forEach(n => selNat.innerHTML += `<option value="${n}">${n}</option>`);

document.querySelectorAll(".toggle button").forEach(btn=>{
  btn.onclick = (e)=>{
    const p = e.target.parentElement;
    p.querySelectorAll("button").forEach(b=>b.classList.remove("sel"));
    e.target.classList.add("sel");
  };
});


$("btn-start").onclick = () => {
  iniciarCarreira({
    name: $("p-name").value.trim(), number: parseInt($("p-number").value), pos: $("p-pos").value,
    foot: document.querySelector("#foot-toggle .sel").dataset.foot, nat: $("p-nat").value,
    mode: document.querySelector("#mode-toggle .sel").dataset.mode,
    start: document.querySelector("#start-toggle .sel").dataset.start
  });
  $("screen-create").classList.add("hidden");
  $("app-header").classList.add("hidden");
  if(player.mode==="rapida"){ sortearPrimeiroClube(); autoPlayCareer(); }
  else mostrarEscolhaClube();
};

/* ===================== ESCOLHA DO PRIMEIRO CLUBE (item 4) ===================== */
export function opcoesPrimeiroClube(){
  const liga = ligaInicial();
  const mk = cat => embaralhar(clubesDe(liga, cat)).slice(0,2);
  return {grande:mk("elite"), medio:mk("serieA"), pequeno:mk("serieB")};
}
export const PERFIS_CLUBE = [
  {k:"grande", titulo:"Clubes grandes", visib:"Muito alta",
   pros:["Maior reputação e visibilidade","Maior potencial de valorização se aproveitar as chances"],
   contras:["Maior concorrência por posição","Poucos minutos no início"]},
  {k:"medio", titulo:"Clubes médios", visib:"Média",
   pros:["Equilíbrio entre competitividade e oportunidades","Visibilidade suficiente para despertar interesse de maiores"],
   contras:["O espaço vem aos poucos"]},
  {k:"pequeno", titulo:"Clubes pequenos (2ª divisão)", visib:"Baixa",
   pros:["Mais minutos e protagonismo","Chance de construir boas estatísticas"],
   contras:["Precisa se destacar para atrair grandes clubes"]}
];
export function mostrarEscolhaClube(){
  const op = opcoesPrimeiroClube();
  $("screen-club").classList.remove("hidden");
  $("club-intro").textContent = `Você começa a carreira aos ${player.age} anos, com OVR ${player.ovr}. A escolha influencia o caminho, mas não decide o resultado: bons números em qualquer nível abrem portas.`;
  $("club-cols").innerHTML = PERFIS_CLUBE.map(p => `
    <div class="cc-col">
      <div class="cc-head"><h3>${p.titulo}</h3>
        <ul class="pro">${p.pros.map(x=>`<li>${x}</li>`).join("")}</ul>
        <ul class="con">${p.contras.map(x=>`<li>${x}</li>`).join("")}</ul></div>
      ${op[p.k].map((o,i) => {
        const sh = shareMinutos(player.ovr, o.nivel, player.age, 0, false);
        return `<div class="cc-card" data-k="${p.k}" data-i="${i}">
          ${crest(o.club,64)}<strong>${esc(o.club.name)}</strong>
          <span class="mini-chip">${esc(nomeDivisao(o.league,o.div))} · ${flagHTML(o.league,14)} ${NAT_INFO[o.league]?.code||""}</span>
          <div class="meter"><i style="width:${Math.round(sh*100)}%;background:${corShare(sh)}"></i></div>
          <span class="mini-chip" style="color:${corShare(sh)}">Minutos esperados: ${rotuloShare(sh)}</span>
          <span class="mini-chip">Visibilidade: ${p.visib}</span></div>`;
      }).join("")}
    </div>`).join("");
  document.querySelectorAll("#club-cols .cc-card").forEach(el => el.onclick = () => {
    definirPrimeiroClube(op[el.dataset.k][+el.dataset.i]);
    $("screen-club").classList.add("hidden");
    $("screen-season").classList.remove("hidden");
    renderSeason();
  });
}
/* ===================== FLUXO — MODO COMPLETA ===================== */
export function simularProximaTemporada(){
  if(player.age >= 40){ finalizarCarreira(); return; }
  ui.pendingOffers = []; ui.ultimaDecisao = null; ui.aba = "carreira";
  const season = simularTemporada();
  player.pendingTorneios = season.torneios.filter(t => t.status==="jogou");
  posTemporada(season);
}
// Depois da temporada: torneios de seleção (tela exclusiva) -> evento -> janela de transferências.
export function posTemporada(season){
  if(player.pendingTorneios.length){ mostrarTorneio(player.pendingTorneios.shift(), season); return; }
  if(player.age < 40){
    const ev = selecionarEvento(season);
    if(ev){ player.pendingEvent = ev; ui.pendingOffers = []; ui.aba = "eventos"; }
    else { ui.pendingOffers = calcularOfertas(); }
  }
  $("screen-torneio").classList.add("hidden");
  $("screen-season").classList.remove("hidden");
  renderSeason();
}
export function depoisDoEvento(){
  const tipo = player.ofertaTipo; player.ofertaTipo = null;
  if(player.ofertasBloqueadas){ ui.pendingOffers = []; player.ofertasBloqueadas = false; }
  else ui.pendingOffers = calcularOfertas(tipo);
  renderSeason();
}
export function escolherOpcaoEvento(i){
  ui.ultimaDecisao = resolverEvento(i);
  ui.aba = "eventos";
  depoisDoEvento();
}
// Escolher um clube (ou ficar) já confirma e joga a próxima temporada — um clique só.
export function escolherClube(offer){ if(offer) aplicarTransferencia(offer); else ficarNoClube(); simularProximaTemporada(); }
$("btn-simulate").onclick = simularProximaTemporada;
$("btn-retire").onclick = finalizarCarreira;

/* ===================== FLUXO — MODO RÁPIDA ===================== */
export function autoPlayCareer(){ jogarCarreiraAutomatica(); finalizarCarreira(); }

/* ===================== ABAS ===================== */
export function trocarAba(nome){
  ui.aba = nome;
  document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("sel", b.dataset.tab===nome));
  ["carreira","liga","eventos","selecao"].forEach(a => $("tab-"+a).classList.toggle("hidden", a!==nome));
}
document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => trocarAba(b.dataset.tab));
$("btn-ver-evento").onclick = () => { trocarAba("eventos"); $("tabs").scrollIntoView({behavior:"smooth",block:"start"}); };

/* ===================== RENDER — TELA DE CARREIRA ===================== */
export function renderSeason(){
  const col = clubColor(player.club.name);
  $("ovr-box").className = "ovr-box " + ovrTier(player.ovr);
  $("ui-ovr").textContent = player.ovr;
  $("ui-nat-chip").innerHTML = flagHTML(player.nat,16) + (NAT_INFO[player.nat]?.code || "");
  $("ui-pos-chip").textContent = `#${player.number} ${player.pos}`;
  $("ui-name").textContent = player.name;
  $("ui-club").innerHTML = crest(player.club,34) + `<span>${esc(player.club.name)}</span>`;
  $("ui-age").textContent = player.age;
  $("ui-value").textContent = fmtValor(player.value);
  $("hero-bg").style.background = `linear-gradient(110deg, ${rgba(col,.40)}, ${rgba(col,.08)} 72%)`;
  $("hero-wm").innerHTML = crest(player.club,150);

  $("ui-games").textContent = player.stats.games;
  $("ui-goals").textContent = player.stats.goals;
  $("ui-assists").textContent = player.stats.assists;
  $("ui-trophies").innerHTML = trofeusHTML(player.titulosConquistados,36) || '<span class="muted small">Sem títulos ainda</span>';

  const repTxt = player.rep>85?"Lenda":player.rep>70?"Alta":player.rep>50?"Média":"Baixa";
  const sh = shareMinutos(player.ovr, nivelAtual(), player.age, 0, false);
  const faseR = classificarFase(), corFase = {excelente:"#7fe0a8",boa:"#a8e0c0",normal:"#f5c542",ruim:"#ff8a95"}[faseR];
  $("statusline").innerHTML = `<span class="chip" style="color:${corFase}">Fase recente: ${NOME_FASE[faseR]}</span><span class="chip">Reputação: ${repTxt}</span><span class="chip" style="color:${corShare(sh)}">${rotuloCategoria(player.category)} · ${esc(nomeDivisao(player.league, player.div))}</span><span class="chip" style="color:${corShare(sh)}">${rotuloShare(sh)}</span>` + chipsDesenvolvimento();

  renderOffers();
  const pendingEv = !!player.pendingEvent, pending = ui.pendingOffers.length > 0;
  $("event-banner").classList.toggle("hidden", !pendingEv);
  $("transfer-window").classList.toggle("hidden", !pending || pendingEv);
  $("btn-simulate").classList.toggle("hidden", pending || pendingEv);
  $("btn-simulate").textContent = player.age>=40 ? "Encerrar carreira" : "Simular temporada ▶";
  // Aposentadoria disponível a partir dos 33; o texto sugere quando o corpo já pede
  $("btn-retire").classList.toggle("hidden", player.age<33 || player.age>=40 || pendingEv);
  $("btn-retire").textContent = chanceAposentadoria()>=0.4 ? "Anunciar aposentadoria (o corpo já dá sinais)" : "Anunciar aposentadoria";
  $("ev-dot").classList.toggle("hidden", !pendingEv);

  $("season-summary").innerHTML = resumoHTML();
  renderTable($("career-table"), false);
  renderEventosTab();
  $("tab-selecao").innerHTML = selecaoHTML();
  $("tab-liga").innerHTML = ligaHTML();
  trocarAba(pendingEv ? "eventos" : ui.aba);
}

export function renderOffers(){
  const cont = $("ui-offers"); cont.innerHTML = "";
  if(ui.pendingOffers.length===0) return;
  const chip = (liga,div) => `<span class="mini-chip">${esc(nomeDivisao(liga,div))} · ${flagHTML(liga,14)} ${NAT_INFO[liga]?.code||""}</span>`;
  const info = (cat,sh) => `<span class="mini-chip">${rotuloCategoria(cat)}</span><span class="mini-chip" style="color:${corShare(sh)}">${rotuloShare(sh)}</span>`;
  const m = ultimoMercado, fase = m.resumo ? `Fase recente: ${NOME_FASE[m.fase]} (${m.resumo}). ` : "";
  $("tw-text").textContent =
      m.situacao==="forcado" ? `${fase}${m.motivoFicar}: depois de uma temporada abaixo do esperado, não há espaço para continuar. As opções são clubes de outro escalão, onde você pode jogar e voltar a evoluir.`
    : m.situacao==="fimEmprestimo" ? `${fase}O empréstimo terminou. Você pode voltar ao clube de origem ou aceitar uma das propostas.`
    : `${fase}As propostas refletem esse momento — você pode aceitar uma ou ficar no clube.`;
  $("transfer-window").classList.toggle("forcado", m.situacao==="forcado");
  ui.pendingOffers.forEach(o => {
    const d = document.createElement("div"); d.className = "offer-card" + (o.salto?" salto":"") + (o.tipo==="emprestimo"?" emprestimo":"");
    const rot = o.tipo==="emprestimo" ? "Empréstimo para o" : o.club.name===player.club.name ? "Ficar em definitivo no" : "Assinar com";
    d.innerHTML = `${o.salto?'<span class="salto-tag">⭐ Salto na carreira</span>':''}${o.tipo==="emprestimo"?'<span class="emp-tag">1 temporada</span>':''}<span class="olbl">${rot}</span><strong>${esc(o.club.name)}</strong>${crest(o.club,64)}${chip(o.league,o.div)}${info(o.category,o.shareEsp)}<span class="motivo">${esc(o.motivo||"")}</span>`;
    d.onclick = () => escolherClube(o);
    cont.appendChild(d);
  });
  if(m.podeFicar){
    const f = clubeDoFicar();
    const stay = document.createElement("div"); stay.className = "offer-card";
    stay.innerHTML = `<span class="olbl">${m.textoFicar}</span><strong>${esc(f.club.name)}</strong>${crest(f.club,64)}${chip(f.league,f.div)}${info(f.category, shareMinutos(player.ovr,f.nivel,player.age,0,false))}<span class="motivo">${esc(m.motivoFicar||"")}</span>`;
    stay.onclick = () => escolherClube(null);
    cont.appendChild(stay);
  }
}
