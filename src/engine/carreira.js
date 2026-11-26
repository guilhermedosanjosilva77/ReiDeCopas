import { clubesDe, ligaInicial, montarCatalogo, sincronizarClubeDoJogador } from './clubes.js';
import { gerarAtributos } from './desenvolvimento.js';
import { resolverEvento, selecionarEvento } from './eventos.js';
import { player, resetarJogador, valorAlvo } from './jogador.js';
import { limparLigas } from './liga.js';
import { aplicarTransferencia, calcularOfertas, ficarNoClube, melhorOferta } from './mercado.js';
import { simularTemporada } from './temporada.js';
import { clamp, pick, sortearPonderado } from './util.js';

/* ===================== CICLO DE VIDA DA CARREIRA ===================== */
// Funções sem tela (sem DOM): usadas pela interface e pelos testes automáticos.

/**
 * Prepara uma nova carreira.
 * @param {{name:string, number:number, pos:string, foot:string, nat:string, mode:string, start:"base"|"pro"}} o
 */
export function iniciarCarreira(o){
  resetarJogador();
  montarCatalogo();                 // ligas voltam à configuração inicial
  limparLigas();
  Object.assign(player, {name:o.name || "Jogador", number:clamp(o.number || 10, 1, 99), pos:o.pos, foot:o.foot || "Direito",
                         nat:o.nat, mode:o.mode || "completa"});
  if(o.start==="pro"){ player.age=21; player.ovr=72; player.rep=55; }
  else { player.age=16; player.ovr=62; player.rep=30; }
  player.year = 2024;
  Object.assign(player, gerarAtributos(o.start));   // potencial, consistência, propensão a lesões…
  player.value = Math.round(valorAlvo()*100)/100;
  player.peakOvr = player.ovr; player.peakValue = player.value;
}

export function definirPrimeiroClube(o){
  player.club = o.club; player.league = o.league; player.tier = o.tier; player.category = o.category;
  sincronizarClubeDoJogador();
}

// Primeiro clube sorteado (modo rápido): 40% pequeno, 40% médio, 20% grande
export function sortearPrimeiroClube(){
  const cat = sortearPonderado(["serieB","serieA","elite"], c=>({serieB:0.4,serieA:0.4,elite:0.2}[c]), 1)[0];
  const lista = clubesDe(ligaInicial(), cat);
  definirPrimeiroClube(pick(lista.length ? lista : clubesDe(ligaInicial())));
}

// Joga a carreira inteira com decisões automáticas (modo rápido). Devolve o número de temporadas.
export function jogarCarreiraAutomatica(){
  while(player.age < 40){
    const season = simularTemporada();
    if(player.age < 40){
      const ev = selecionarEvento(season);
      if(ev){ player.pendingEvent = ev; resolverEvento(Math.random()<0.5 ? 0 : 1); }
      const tipo = player.ofertaTipo; player.ofertaTipo = null;
      if(player.ofertasBloqueadas) player.ofertasBloqueadas = false;
      else { const escolha = melhorOferta(calcularOfertas(tipo)); if(escolha) aplicarTransferencia(escolha); else ficarNoClube(); }
    }
    if(deveAposentar()) break;
  }
  player.aposentado = true;
  return player.history.length;
}

// Aposentadoria em idades diferentes (Parte 11): idade, nível, condição física e posição pesam.
// Goleiros e zagueiros costumam jogar mais tempo. Usada no modo rápido e como sugestão no modo completo.
export function chanceAposentadoria(){
  const a = player.age + (player.pos==="GOL" ? -3 : player.pos==="ZAG" ? -1 : 0);
  if(a < 32) return 0;
  let p = (a-31)*0.08;
  if(player.ovr < 65) p += 0.15;
  if(player.fisico < 60) p += 0.1;
  const ult = player.history[player.history.length-1];
  if(ult && ult.share < 0.3) p += 0.12;
  return clamp(p, 0, 0.95);
}
export const deveAposentar = () => player.age >= 40 || Math.random() < chanceAposentadoria();
