import { player } from '../engine/jogador.js';
import { perfilDaCarreira } from '../engine/perfil.js';
import { logEventosHTML } from './eventos.js';
import { selecaoHTML } from './selecao.js';
import { renderTable, selTitulos } from './tabela.js';
import { $, clubColor, crest, esc, flagHTML, fmtValor, imgLogo, ovrTier, rgba, trofeusHTML } from './visual.js';

/* ===================== FIM DE CARREIRA ===================== */
export function agregarClubes(){
  const m = new Map();
  player.history.forEach(s=>{
    const k = s.clubRef.name;
    if(!m.has(k)) m.set(k,{club:s.clubRef,games:0,goals:0,assists:0});
    const c = m.get(k); c.games+=s.games; c.goals+=s.goals; c.assists+=s.assists;
  });
  return [...m.values()].sort((a,b)=>b.games-a.games);
}
export const stats3Final = (g,gl,a) => `<div><span class="lbl">Jogos</span><b>${g}</b></div><div><span class="lbl">Gols</span><b>${gl}</b></div><div><span class="lbl">Ast</span><b>${a}</b></div>`;
export const titulosDoClube = nome => player.titulosConquistados.filter(t => t.club===nome);

export function bigClubHTML(c){
  const col = clubColor(c.club.name);
  const wm = imgLogo(c.club,"wm","",`<div class="wm-ini">${esc(c.club.name.substring(0,2).toUpperCase())}</div>`);
  return `<div class="clubbig" style="background:linear-gradient(165deg, ${rgba(col,.42)}, ${rgba(col,.10)} 55%, #0e0e10)">${wm}
    <div>${crest(c.club,120)}</div><div class="cb-name">${esc(c.club.name)}</div>
    <div class="cb-stats">${stats3Final(c.games,c.goals,c.assists)}</div>
    <div class="cb-trophies">${trofeusHTML(titulosDoClube(c.club.name),44)}</div></div>`;
}
export function miniClubHTML(c){
  const col = clubColor(c.club.name), tit = titulosDoClube(c.club.name);
  return `<div class="clubmini" style="background:linear-gradient(90deg, ${rgba(col,.28)}, #131316 80%)">${crest(c.club,38)}
    <div><div class="cm-name">${esc(c.club.name)}</div>
    <div class="cm-stats">${c.games} jogos · ${c.goals} gols · ${c.assists} ast${tit.length?" · 🏆"+tit.length:""}</div></div></div>`;
}

export function finalizarCarreira(){
  player.aposentado = true;
  ["screen-create","screen-club","screen-season","screen-torneio"].forEach(id => $(id).classList.add("hidden"));
  $("app-header").classList.add("hidden");
  $("screen-report").classList.remove("hidden");

  $("final-player").innerHTML = `
    <div class="pf-head">
      <div><div class="lbl">Carreira finalizada</div>
        <div class="pf-name" style="${player.name.length>12?"font-size:1.45rem":player.name.length>8?"font-size:1.8rem":""}">${esc(player.name)}</div>
        <div class="chips"><span class="chip">#${player.number}</span><span class="chip pink">${player.pos}</span></div></div>
      <div class="pf-right">
        <div class="pf-val"><span class="lbl">Valor máx.</span><b>${fmtValor(player.peakValue)}</b></div>
        <div class="ovr-box small ${ovrTier(player.peakOvr)}"><small>OVR</small><b>${player.peakOvr}</b></div>
      </div>
    </div>
    <div class="stats3 boxed">${stats3Final(player.stats.games,player.stats.goals,player.stats.assists)}</div>`;

  const disputados = player.torneios.filter(t=>t.status==="jogou").length;
  $("final-sel").innerHTML = `
    <div class="sel-head">${flagHTML(player.nat,52)}<div><div class="lbl gold">Seleção</div><div class="sel-name">${esc(player.nat)}</div></div></div>
    <div class="stats3 boxed">${stats3Final(player.sel.games,player.sel.goals,player.sel.assists)}</div>
    <div class="sel-trophies">${trofeusHTML(selTitulos(),46) || (player.sel.games===0 ? '<span class="muted small">Nunca foi convocado</span>' : "")}</div>
    <div class="small muted center" style="margin-top:8px">${disputados} torneio${disputados===1?"":"s"} final${disputados===1?"":"is"} disputado${disputados===1?"":"s"}</div>`;

  const grupos = {};
  player.premios.forEach(p => { (grupos[p.nome]=grupos[p.nome]||{icon:p.icon,anos:[]}).anos.push(p.year); });
  const lista = Object.entries(grupos).map(([nome,g]) =>
    `<div class="award"><span class="aico">${g.icon}</span><div><b>${esc(nome)}${g.anos.length>1?" ×"+g.anos.length:""}</b><small>${g.anos.join(", ")}</small></div></div>`).join("");
  $("final-awards").innerHTML = `<div class="lbl">Prêmios</div>` +
    (lista ? `<div class="awards-list">${lista}</div>` : `<div class="empty-awards">VITRINE VAZIA</div>`);

  const pf = perfilDaCarreira();
  $("final-perfil").innerHTML = `<div class="lbl">Perfil da carreira</div><div class="pf-tipo">${esc(pf.titulo)}</div>
    <p>${esc(pf.texto)}</p>${pf.refs.length ? `<p class="muted small">Trajetória que lembra a de ${pf.refs.map(esc).join(" e ")}.</p>` : ""}
    <div class="pf-dados"><span>Pico: OVR ${player.peakOvr} aos ${pf.idadePico} anos</span><span>Potencial inicial estimado: ${player.potencialInicial}</span>
    <span>Lesões graves: ${player.lesoes.filter(l=>l.tipo==="grave").length}</span><span>Aposentadoria: ${player.age} anos</span></div>`;

  const clubes = agregarClubes();
  const grande = $("final-clubs");
  grande.className = "clubs-big" + (clubes.length===1 ? " one" : "");
  grande.innerHTML = clubes.slice(0,2).map(bigClubHTML).join("");
  const resto = clubes.slice(2);
  $("final-more-wrap").classList.toggle("hidden", resto.length===0);
  $("final-more").innerHTML = resto.map(miniClubHTML).join("");

  // Histórico completo: temporadas, seleção (consultável) e decisões da carreira
  renderTable($("final-table"), true);
  $("final-intl").innerHTML = selecaoHTML();
  $("final-events").innerHTML = logEventosHTML();
  $("btn-history").onclick = () => {
    const h = $("final-history"); h.classList.toggle("hidden");
    $("btn-history").textContent = h.classList.contains("hidden") ? "Ver histórico completo" : "Ocultar histórico";
  };
}
