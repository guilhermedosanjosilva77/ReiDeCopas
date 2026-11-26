import { LIGA_ORIGEM, PAISES } from '../data/clubes.js';
import { LOGO_WEB } from '../data/logosWeb.js';
import { player } from './jogador.js';
import { clamp } from './util.js';

/* ===================== CATÁLOGO DE CLUBES ===================== */
// Cada clube vira uma ENTRADA mutável: a divisão muda com acesso/rebaixamento e, com ela,
// a categoria (grande / médio / pequeno) e o nível competitivo.
//   1ª divisão + grande → "elite"  (Clube grande)
//   1ª divisão          → "serieA" (Clube médio)
//   2ª divisão          → "serieB" (Clube pequeno)  ← inclusive um grande rebaixado

// Nível competitivo de referência por categoria (comparável ao OVR do jogador).
export const NIVEL_CAT = {elite:82, serieA:66, serieB:57};
export function nivelClube(cat, liga){
  const P = PAISES[liga];
  return NIVEL_CAT[cat] - (P && P.tier===2 ? 3 : 0) + ((P && P.ajusteNivel) || 0);   // ajusteNivel: força relativa da liga
}

export const CATALOGO = [];          // todas as entradas
export const ENTRADA_POR_NOME = {};  // nome -> entrada
export const CLUBES_POR_NOME = {};   // nome -> {name, logo} (o objeto do clube é sempre o mesmo, para o histórico)

export const categoriaDe = e => e.div===2 ? "serieB" : e.grande ? "elite" : "serieA";
export function atualizarCategoria(e){
  e.category = categoriaDe(e);
  // Um grande na 2ª divisão ainda tem estrutura acima da média da divisão
  e.nivel = nivelClube(e.category, e.league) + (e.grande && e.div===2 ? 4 : 0);
}

// (Re)monta o catálogo na configuração inicial (temporada 2025/26). Chamado ao iniciar uma carreira.
export function montarCatalogo(){
  CATALOGO.length = 0;
  for(const k of Object.keys(ENTRADA_POR_NOME)) delete ENTRADA_POR_NOME[k];
  Object.entries(PAISES).forEach(([pais, P]) => {
    [[P.grandes,1,true],[P.medios,1,false],[P.div2,2,false]].forEach(([lista,div,grande]) => (lista||[]).forEach(([nome,forca,slug]) => {
      const club = CLUBES_POR_NOME[nome] || (CLUBES_POR_NOME[nome] = {name:nome, logo:LOGO_WEB[nome] || "", slug});
      const e = {club, league:pais, tier:P.tier, div, grande, forca, deriva:0};
      atualizarCategoria(e);
      CATALOGO.push(e); ENTRADA_POR_NOME[nome] = e;
    }));
  });
}
montarCatalogo();

export const entradaDe = nome => ENTRADA_POR_NOME[nome] || null;
export const nomeDivisao = (liga, div) => (PAISES[liga]?.divisoes || [])[div-1] || (div===1 ? "1ª divisão" : "2ª divisão");
export const clubesDe = (liga, cat) => CATALOGO.filter(e => e.league===liga && (!cat || e.category===cat));

export const rotuloCategoria = c => c==="elite" ? "Clube grande" : c==="serieA" ? "Clube médio" : "Clube pequeno";
export function nivelAtual(){
  const e = player.club && ENTRADA_POR_NOME[player.club.name];
  return e ? e.nivel : nivelClube(player.category, player.league);
}
// Copia para o jogador a situação atual do clube (após acesso/rebaixamento ou transferência)
export function sincronizarClubeDoJogador(){
  const e = player.club && ENTRADA_POR_NOME[player.club.name];
  if(e){ player.category = e.category; player.tier = e.tier; player.league = e.league; player.div = e.div; }
}

export const ligaInicial = () => PAISES[player.nat] ? player.nat : (LIGA_ORIGEM[player.nat] || "Brasil");

// Fatia de minutos esperada: depende do OVR do jogador em relação ao nível do clube.
export function shareMinutos(ovr, nivel, idade, extra=0, ruido=true){
  let s = 0.55 + (ovr-nivel)/20;
  if(idade<=19 && ovr<nivel) s -= 0.04;              // jovens têm menos prioridade em clubes acima do seu nível
  s += extra + (ruido ? (Math.random()-0.5)*0.14 : 0);
  return clamp(s, 0.1, 1);
}
export const rotuloShare = s => s>=0.7 ? "Titular provável" : s>=0.4 ? "Disputa por vaga" : "Pouco espaço";
export const corShare = s => s>=0.7 ? "#7fe0a8" : s>=0.4 ? "#f5c542" : "#ff8a95";
