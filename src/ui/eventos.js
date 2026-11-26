import { EVENTOS } from '../engine/eventos.js';
import { player } from '../engine/jogador.js';
import { escolherOpcaoEvento } from './app.js';
import { ui } from './estado.js';
import { $, esc } from './visual.js';

/* ===================== ABA EVENTOS ===================== */
export function logEventosHTML(){
  const l = player.eventos.log;
  if(!l.length) return `<div class="muted small">Nenhuma decisão registrada ainda.</div>`;
  return l.slice().reverse().map(e => `<div class="log-item"><div class="log-top"><span>${e.icone} <b>${esc(e.titulo)}</b></span><span class="muted small">${e.ano} · ${e.idade} anos</span></div>
    <div class="small"><span class="muted">Decisão:</span> ${esc(e.escolha)}</div>
    <div class="small"><span class="muted">Resultado:</span> ${esc(e.resultado)}</div>
    ${e.desfecho?`<div class="small"><span class="muted">Desfecho:</span> ${esc(e.desfecho)}</div>`:`<div class="small muted">Desfecho: será registrado após a próxima temporada.</div>`}</div>`).join("");
}
export function renderEventosTab(){
  const box = $("tab-eventos"); let html = "";
  const pe = player.pendingEvent;
  if(pe){
    const e = EVENTOS.find(x => x.id===pe.id);
    html += `<div class="evt-card"><div class="evt-head"><span class="evt-ico">${e.icone}</span><div><div class="lbl gold">Evento</div><div class="evt-title">${esc(e.titulo)}</div></div></div>
      <p class="evt-ctx">${esc(pe.texto)}</p>
      <div class="evt-opts">${e.opcoes.map((o,i) => `<button class="evt-opt" data-i="${i}">
        <h4>${String.fromCharCode(65+i)} — ${esc(o.rotulo)}</h4>
        <div class="lbl">Vantagens</div><ul class="pro">${o.pros.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
        <div class="lbl">Riscos</div><ul class="con">${o.contras.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></button>`).join("")}</div>
      <p class="muted small" style="margin:12px 0 0">Nem todas as consequências são certas: o resultado depende do seu momento na carreira.</p></div>`;
  } else if(ui.ultimaDecisao){
    const r = ui.ultimaDecisao;
    html += `<div class="evt-card done"><div class="lbl gold">Decisão registrada</div><div class="evt-title">${r.icone} ${esc(r.titulo)}</div>
      <p class="small"><span class="muted">Você escolheu:</span> ${esc(r.escolha)}</p><p class="evt-ctx" style="margin-top:6px">${esc(r.resultado)}</p></div>`;
  } else {
    html += `<div class="evt-empty">Nenhum evento pendente. Eventos aparecem em momentos importantes da carreira — não a cada temporada.</div>`;
  }
  html += `<div class="lbl" style="margin:18px 0 8px">Histórico de decisões</div><div class="log-list">${logEventosHTML()}</div>`;
  box.innerHTML = html;
  box.querySelectorAll(".evt-opt").forEach(b => b.onclick = () => escolherOpcaoEvento(+b.dataset.i));
}
