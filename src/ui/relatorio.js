import { UCL } from '../data/europa.js';
import { FAIXA_ETARIA, consistenciaObservada, corNota, potencialEstimado } from '../engine/desenvolvimento.js';
import { player } from '../engine/jogador.js';
import { clube } from './champions.js';
import { $, crest, esc, fmtValor } from './visual.js';

/* ===================== RELATÓRIO DA TEMPORADA (Parte 10.2) ===================== */

export const pl = (n,a,b) => `${n} ${n===1?a:b}`;
const sinal = n => n>0 ? `+${n}` : `${n}`;
export const notaBadge = (n, big=false) =>
  n==null ? "" : `<span class="nota-badge${big?" big":""}" style="--c:${corNota(n)}">${n}</span>`;

export function proximoClube(idx){
  const s = player.history[idx], prox = player.history[idx+1];
  if(!prox && !player.aposentado) return "Janela de transferências em aberto";
  const destino = prox ? prox.clubRef.name : player.club.name;
  if(destino === s.clubRef.name) return "Permaneceu no clube";
  const emp = prox ? prox.emprestimo : (player.emprestimo && player.emprestimo.dono.name);
  return emp && emp===s.clubRef.name ? `Emprestado ao ${destino}` : `Transferido para o ${destino}`;
}

export function relatorioHTML(idx){
  const s = player.history[idx];
  const linha = (rot, val) => `<div class="rl"><span>${rot}</span><b>${val}</b></div>`;
  const tor = (s.torneios||[]).filter(t => t.status==="jogou");
  const conv = s.convocado ? (tor.length ? `Convocado · ${tor.map(t=>`${t.abrev} ${t.rotulo} (${t.faseRotulo.toLowerCase()})`).join(", ")}` : "Convocado")
                           : "Não convocado";
  const titulos = player.titulosConquistados.filter(t => t.year===s.year).map(t => t.titulo);
  return `<div class="rel-head">${crest(s.clubRef,46)}
      <div><div class="lbl">Temporada ${s.year} · ${s.age} anos · ${FAIXA_ETARIA(s.age)}</div>
      <div class="rel-club">${esc(s.clubRef.name)}${s.emprestimo?` <span class="mini-chip">emprestado</span>`:""}</div></div>
      <div class="rel-nota">${notaBadge(s.nota,true)}<small>${esc(s.notaClasse||"")}</small></div></div>
    <div class="rel-grid">
      ${linha("OVR", `${s.ovrBefore} → ${s.ovr} <span class="${s.ovrChange>0?"up":s.ovrChange<0?"dn":""}">(${sinal(s.ovrChange)})</span>`)}
      ${linha("Partidas e minutos", `${s.games} jogos${s.ucl&&s.ucl.fase?` (${s.jogosLiga} na liga)`:""} · ${s.minutos ?? "–"} min`)}
      ${linha("Gols e assistências", `${s.goals} gols · ${s.assists} assistências`)}
      ${linha("Situação no elenco", esc(s.papel||"–"))}
      ${linha("Liga", s.liga ? `${s.liga.pos}º na ${esc(s.liga.divNome)}${s.liga.movimento==="rebaixado"?" · rebaixado":s.liga.movimento==="acesso"?" · acesso":""}` : "–")}
      ${linha("Títulos", titulos.length ? esc(titulos.join(", ")) : "Nenhum")}
      ${linha("Prêmios", (s.premios&&s.premios.length) ? esc(s.premios.join(", ")) : "Nenhum")}
      ${linha("Lesões", s.lesao ? `${esc(s.lesao.nome)} (${s.lesao.tipo}) · ${s.lesao.jogos} jogos fora` : "Nenhuma relevante")}
      ${linha("Reputação", s.repDepois!=null ? `${s.repAntes} → ${s.repDepois}` : "–")}
      ${linha("Valor de mercado", s.valorDepois!=null ? `${fmtValor(s.valorAntes)} → ${fmtValor(s.valorDepois)}` : "–")}
      ${s.ucl && s.ucl.fase ? linha("Champions League", `${esc(s.ucl.faseRotulo)} · ${s.ucl.posLiga}º na fase de liga · ${pl(s.ucl.jogador.jogos,"jogo","jogos")}, ${pl(s.ucl.jogador.gols,"gol","gols")}, ${s.ucl.jogador.ast} ast`) : ""}
      ${linha("Seleção", esc(conv))}
      ${linha("Mercado", esc(proximoClube(idx)))}
    </div>
    ${(s.marcos&&s.marcos.length) ? `<div class="rel-marcos">${s.marcos.map(m=>`<div>• ${esc(m.texto)}</div>`).join("")}</div>` : ""}
    ${s.perspectiva ? `<div class="rel-persp"><span class="lbl">Perspectiva</span>${esc(s.perspectiva)}${s.potEstimado?` <span class="muted">· potencial estimado: ${esc(s.potEstimado)}</span>`:""}</div>` : ""}`;
}

// Cartão compacto da última temporada, no topo da aba CARREIRA
export function resumoHTML(){
  const idx = player.history.length-1;
  if(idx<0) return "";
  const s = player.history[idx];
  const cons = consistenciaObservada();
  return `<div class="resumo" data-idx="${idx}">
    <div class="rs-l">${notaBadge(s.nota,true)}</div>
    <div class="rs-m"><div class="lbl">Última temporada · ${esc(s.notaClasse||"")}</div>
      <div>${s.games} jogos · ${s.goals} gols · ${s.assists} ast · ${esc(s.papel||"")}${s.ucl&&s.ucl.fase?` · UCL: ${esc(s.ucl.faseRotulo.toLowerCase())}`:""}${s.lesao&&s.lesao.tipo!=="pontual"?` · 🩹 ${s.lesao.jogos} jogos fora`:""}</div>
      <div class="muted small">${esc(s.perspectiva||"")}${cons?` · ${cons.rotulo}`:""}</div></div>
    <button class="rs-btn">Relatório</button></div>`;
}

export function abrirRelatorio(idx){
  $("report-body").innerHTML = relatorioHTML(idx);
  $("report-modal").classList.remove("hidden");
}
export function fecharRelatorio(){ $("report-modal").classList.add("hidden"); }
if(typeof document !== 'undefined'){
  document.addEventListener("click", e => {
    if(e.target.closest("#report-modal .modal-x") || e.target.id==="report-modal") return fecharRelatorio();
    const row = e.target.closest("[data-idx]");
    if(row && !e.target.closest("#report-modal")) abrirRelatorio(+row.dataset.idx);
  });
  document.addEventListener("keydown", e => { if(e.key==="Escape") fecharRelatorio(); });
}
// Chips do cartão do jogador: potencial estimado, físico e moral (variáveis independentes do OVR)
export function chipsDesenvolvimento(){
  const pot = potencialEstimado();
  const fis = player.fisico, mor = player.moral;
  const corF = fis>=85 ? "#7fe0a8" : fis>=70 ? "#f5c542" : "#ff8a95";
  const corM = mor>=70 ? "#7fe0a8" : mor>=45 ? "#f5c542" : "#ff8a95";
  return `<span class="chip" title="Faixa estimada pelos olheiros — não é garantia">Potencial: ${pot.texto}</span>`
    + `<span class="chip" style="color:${corF}">Físico: ${fis>=85?"Ótimo":fis>=70?"Bom":"Desgastado"}</span>`
    + `<span class="chip" style="color:${corM}">Moral: ${mor>=70?"Alta":mor>=45?"Normal":"Baixa"}</span>`
    + (player.emprestimo ? `<span class="chip">Emprestado pelo ${esc(player.emprestimo.dono.name)}</span>` : "");
}
