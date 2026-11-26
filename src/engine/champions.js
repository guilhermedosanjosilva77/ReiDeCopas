import { EXTRAS_UEFA, UCL } from '../data/europa.js';
import { CATALOGO, CLUBES_POR_NOME } from './clubes.js';
import { gauss } from './desenvolvimento.js';
import { ultimasLigas } from './liga.js';
import { jogadorNaPartida, ordenarTabela, simPartida } from './selecao.js';
import { embaralhar } from './util.js';

/* ===================== UEFA CHAMPIONS LEAGUE (formato a partir de 2024/25) ===================== */
// 36 clubes · fase de liga com 8 jogos contra 8 adversários diferentes · 1º–8º vão direto às oitavas ·
// 9º–24º disputam os playoffs (ida e volta) · 25º–36º estão eliminados · oitavas, quartas e semifinais em
// ida e volta · final em jogo único. As vagas saem da classificação da liga nacional da temporada anterior.

export const MANDO_UCL = 2;
EXTRAS_UEFA.forEach(([nome,,pais,slug]) => { if(!CLUBES_POR_NOME[nome]) CLUBES_POR_NOME[nome] = {name:nome, logo:"", slug, pais}; });

export const FASES_UCL = {liga:"Eliminado na fase de liga", playoff:"Eliminado nos playoffs", oitavas:"Eliminado nas oitavas de final",
  quartas:"Eliminado nas quartas de final", semi:"Eliminado na semifinal", final:"Vice-campeão", campeao:"Campeão"};
export const PONTOS_UCL = {liga:0.5, playoff:1, oitavas:2, quartas:3, semi:4, final:5, campeao:8};

// Classificados: os primeiros de cada liga na temporada anterior (ou, no primeiro ano, os mais fortes)
export function classificadosChampions(){
  const lista = [];
  Object.entries(UCL.vagas).forEach(([pais, n]) => {
    const r = ultimasLigas[pais];
    const nomes = r ? r.divs[0].tabela.map(t => t.nome)
                    : CATALOGO.filter(e => e.league===pais && e.div===1).sort((a,b) => b.forca-a.forca).map(e => e.club.name);
    nomes.slice(0, n).forEach(nome => {
      const e = CATALOGO.find(x => x.club.name===nome);
      if(e) lista.push({nome, club:e.club, pais, rating:e.forca + e.deriva + UCL.ajuste[pais]});
    });
  });
  const extras = EXTRAS_UEFA.map(([nome, f, pais]) => ({nome, club:CLUBES_POR_NOME[nome], pais, rating:f + gauss()*2.5}))
    .sort((a,b) => b.rating-a.rating).slice(0, UCL.times - lista.length);
  return [...lista, ...extras];
}
export const disputaChampions = nome => classificadosChampions().some(t => t.nome===nome);

// 8 rodadas, cada uma um emparelhamento sem repetir adversário e evitando clubes do mesmo país
export function sortearRodadas(times){
  const jogou = new Map(times.map(t => [t.nome, new Set()]));
  const rodadas = [];
  for(let r=0; r<8; r++){
    let pares = null;
    for(let tent=0; tent<40 && !pares; tent++){
      const livres = embaralhar(times.slice()), out = [];
      let ok = true;
      while(livres.length){
        const a = livres.shift();
        let i = livres.findIndex(b => !jogou.get(a.nome).has(b.nome) && b.pais!==a.pais);
        if(i<0) i = livres.findIndex(b => !jogou.get(a.nome).has(b.nome));
        if(i<0){ ok = false; break; }
        out.push([a, livres.splice(i,1)[0]]);
      }
      if(ok) pares = out;
    }
    pares.forEach(([a,b]) => { jogou.get(a.nome).add(b.nome); jogou.get(b.nome).add(a.nome); });
    rodadas.push(pares);
  }
  return rodadas;
}

/**
 * Simula uma edição.
 * @param {number} ano
 * @param {{meu:string, ajuste:number, jog:{pJogar:number,pGol:number,pAst:number}}} o
 */
export function simularChampions(ano, o){
  const times = classificadosChampions();
  const rate = t => t.rating + (t.nome===o.meu ? o.ajuste : 0);
  const porNome = Object.fromEntries(times.map(t => [t.nome, t]));
  const acc = {jogos:0, gols:0, ast:0};
  const meusJogos = [];
  const jogar = (a, b, mata=false, neutro=false) => {
    const m = simPartida(rate(a) + (neutro ? 0 : MANDO_UCL), rate(b), mata);
    m.a = a.nome; m.b = b.nome;
    if(a.nome===o.meu || b.nome===o.meu){ jogadorNaPartida(m, o.meu, o.jog, acc); meusJogos.push(m); }
    return m;
  };

  // Fase de liga
  const tab = Object.fromEntries(times.map(t => [t.nome, {nome:t.nome, pais:t.pais, j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0}]));
  const reg = (n, gp, gc) => { const r = tab[n]; r.j++; r.gp+=gp; r.gc+=gc; r.sg=r.gp-r.gc;
    if(gp>gc){ r.v++; r.pts+=3; } else if(gp===gc){ r.e++; r.pts+=1; } else r.d++; };
  sortearRodadas(times).forEach((pares, ri) => pares.forEach(([a,b]) => {
    const [casa, fora] = Math.random()<0.5 ? [a,b] : [b,a];
    const m = jogar(casa, fora); m.rodada = ri+1;
    reg(casa.nome, m.ga, m.gb); reg(fora.nome, m.gb, m.ga);
  }));
  const tabela = ordenarTabela(Object.values(tab));
  tabela.forEach((t,i) => t.pos = i+1);
  const nomePos = p => tabela[p-1].nome;

  // Confronto em ida e volta (o mais bem colocado decide em casa)
  const ida_volta = (A, B) => {
    const a = porNome[A], b = porNome[B];
    const ida = jogar(b, a), volta = jogar(a, b);
    const ga = ida.gb + volta.ga, gb = ida.ga + volta.gb;
    let venc = ga>gb ? A : gb>ga ? B : null, pen = false;
    if(!venc){ pen = true; venc = Math.random() < 0.5 + (rate(a)-rate(b))/200 ? A : B; }
    return {a:A, b:B, ida:{ga:ida.gb, gb:ida.ga}, volta:{ga:volta.ga, gb:volta.gb}, agg:[ga,gb], venc, pen};
  };
  const mata = [];
  // Playoffs: 9º x 24º, 10º x 23º … 16º x 17º
  const play = []; for(let k=1;k<=8;k++) play.push(ida_volta(nomePos(8+k), nomePos(25-k)));
  mata.push({nome:"Playoffs", cod:"playoff", confrontos:play});
  // Oitavas: 1º x vencedor de 16º/17º, 2º x 15º/18º …
  let atuais = []; for(let k=1;k<=8;k++) atuais.push(ida_volta(nomePos(k), play[8-k].venc));
  mata.push({nome:"Oitavas de final", cod:"oitavas", confrontos:atuais});
  const prox = (lista, nome, cod) => { const c = []; for(let i=0;i<lista.length;i+=2) c.push(ida_volta(lista[i].venc, lista[i+1].venc));
    mata.push({nome, cod, confrontos:c}); return c; };
  const qf = prox(atuais, "Quartas de final", "quartas");
  const sf = prox(qf, "Semifinais", "semi");
  const fA = porNome[sf[0].venc], fB = porNome[sf[1].venc];
  const fin = jogar(fA, fB, true, true);
  const campeao = fin.venc==="a" ? fA.nome : fB.nome;
  mata.push({nome:"Final", cod:"final", final:{a:fA.nome, b:fB.nome, ga:fin.ga, gb:fin.gb, pen:fin.pen, prorrog:!!fin.prorrog, venc:campeao}});

  // Até onde o clube do jogador chegou
  let fase = null;
  if(times.some(t => t.nome===o.meu)){
    const pos = tabela.find(t => t.nome===o.meu).pos;
    fase = pos>24 ? "liga" : pos>8 ? "playoff" : "oitavas";
    for(const r of mata.slice(0,4)) if(r.confrontos.some(c => c.venc===o.meu)) fase = {playoff:"oitavas", oitavas:"quartas", quartas:"semi", semi:"final"}[r.cod];
    if(campeao===o.meu) fase = "campeao";
  }
  return {comp:"ucl", nome:"UEFA Champions League", abrev:"UCL", ano, meu:o.meu, tabela, mata, campeao,
    fase, faseRotulo: fase ? FASES_UCL[fase] : null, posLiga: fase ? tabela.find(t => t.nome===o.meu).pos : null,
    titulo: campeao===o.meu, jogador:acc, meusJogos};
}

// Reflexos de uma boa campanha: reputação, valor e interesse do mercado (nunca derrubam o OVR)
export function consequenciasChampions(c){
  const fs = PONTOS_UCL[c.fase] || 0, jogou = c.jogador.jogos>0;
  const ind = c.jogador.gols*0.6 + c.jogador.ast*0.35;
  return {
    rep: jogou ? Math.round(fs*0.9 + Math.min(4, ind*0.5)) : Math.round(fs*0.3),
    mult: jogou ? 1 + Math.min(0.3, fs*0.03 + ind*0.025) : 1,
    interesse: jogou ? Math.min(0.4, fs*0.04 + ind*0.03) : 0,
    nota: jogou ? Math.min(5, fs*0.6 + ind*0.4) : 0
  };
}
