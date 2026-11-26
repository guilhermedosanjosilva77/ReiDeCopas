import { clamp } from './util.js';

/* ===================== ESTADO DO JOGADOR ===================== */
export const novoJogador = () => ({
  name:"", number:10, pos:"", foot:"Direito", nat:"", mode:"completa",
  age:16, year:2024, ovr:62, rep:30, value:0.5, peakOvr:62, peakValue:0.5,
  fase:"normal",                       // excelente | boa | normal | ruim — momentum que pesa o próximo sorteio
  club:null, league:"", tier:2, category:"serieB",
  stats:{games:0,goals:0,assists:0},   // totais da carreira (clubes + seleção)
  sel:{games:0,goals:0,assists:0},     // totais da seleção (regular + torneios)
  selReg:{games:0,goals:0,assists:0},  // amistosos e partidas oficiais fora dos torneios finais
  selTor:{games:0,goals:0,assists:0},  // torneios finais
  selVisto:false,                      // já viveu a primeira convocação?
  history:[],                          // uma entrada por temporada (estatísticas do CLUBE)
  torneios:[],                         // histórico internacional completo
  forma:[],                            // desempenho por temporada (0..1) — suaviza o valor de mercado
  titulosConquistados:[],              // [{year,titulo,club,kind}]
  premios:[],                          // [{year,nome,icon}]
  efeitos:{},                          // modificadores temporários vindos de eventos/torneios
  mercadoDistante:0,                   // temporadas restantes com menos visibilidade nas ligas de elite
  eventos:{log:[], ultimo:{}, vezes:{}, ultimoAno:null},
  pendingEvent:null, ofertaTipo:null, ofertasBloqueadas:false, pendingTorneios:[],
  div:1,                               // divisão atual do clube (1 ou 2)
  // --- Realismo (v2.1): variáveis independentes do OVR ---
  potencial:75, potencialInicial:75,   // teto provável (oculto; a interface mostra uma faixa estimada)
  olheiro:0,                           // viés da estimativa dos olheiros
  consistencia:60,                     // regularidade natural (0–100): reduz a oscilação das atuações
  propensao:0.03,                      // tendência a lesões
  fisico:100,                          // condição física (cai com a idade e com lesões graves)
  moral:65,                            // confiança (sobe com minutos e boas temporadas)
  lesoes:[],                           // [{ano, tipo, nome, jogos}]
  marcos:[],                           // [{ano, tipo, texto}] ascensão tardia, estagnação, recuperação…
  emprestimo:null,                     // {dono: clube de origem, ano} enquanto estiver emprestado
  convocacoes:0,                       // temporadas em que foi convocado (histórico pesa na convocação)
  aposentado:false
});
export const player = novoJogador();
// Zera o estado (nova carreira / testes automáticos)
export function resetarJogador(){ for(const k of Object.keys(player)) delete player[k]; Object.assign(player, novoJogador()); }

/* ===================== VALOR DE MERCADO DINÂMICO (item 2) ===================== */
// Valor-alvo = f(OVR, idade, forma recente, reputação, honras). O valor real caminha só uma parte do
// trajeto até o alvo a cada temporada — isso evita saltos e quedas bruscas por uma única fase.
export const valorBase = o => 0.5*Math.exp(0.18*(o-60));
// Idade pesa muito no valor (revenda e risco): um veterano de OVR 86 pode valer menos que um jovem de 82.
export const idadeMult = a => a<=19?1.6 : a<=22?1.45 : a<=25?1.2 : a<=28?1.0 : a<=30?0.7 : a<=32?0.45 : a<=34?0.28 : 0.15;
export function formaMedia(){
  const f = player.forma.slice(-3); if(!f.length) return 0.5;
  const w = [0.5,0.3,0.2]; let s=0, ws=0;
  f.slice().reverse().forEach((v,i)=>{ s+=v*w[i]; ws+=w[i]; });
  return s/ws;
}
export function honrasRecentes(){
  const lim = player.year-3;
  const t = player.titulosConquistados.filter(x=>x.year>=lim).length;
  const p = player.premios.filter(x=>x.year>=lim).length;
  return Math.min(0.25, t*0.04 + p*0.05);
}
export function valorAlvo(mult=1){
  const forma = 0.6 + 0.9*formaMedia();
  const rep = 0.85 + (player.rep/100)*0.35;
  const potencialPercebido = player.age<=23 ? 1 + clamp(player.potencial-player.ovr, 0, 15)*0.02 : 1;
  const fisico = player.fisico<70 ? 0.85 : 1;
  return clamp(valorBase(player.ovr)*idadeMult(player.age)*forma*rep*(1+honrasRecentes())*potencialPercebido*fisico*mult, 0.05, 200);
}
export function atualizarValor(mult=1){
  const alvo = valorAlvo(mult);
  let v = player.value + (alvo-player.value)*0.55;
  v = clamp(v, player.value*0.55, player.value*2.2);
  player.value = Math.min(200, Math.round(v*100)/100);
}
