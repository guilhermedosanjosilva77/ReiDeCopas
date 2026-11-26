import { PAISES } from '../data/clubes.js';
import { CATALOGO, atualizarCategoria, nomeDivisao } from './clubes.js';
import { gauss } from './desenvolvimento.js';
import { ordenarTabela, simPartida } from './selecao.js';
import { clamp } from './util.js';

/* ===================== LIGAS NACIONAIS: CLASSIFICAÇÃO, ACESSO E REBAIXAMENTO ===================== */
// Toda temporada, cada país joga as duas divisões em pontos corridos (ida e volta). A força de cada
// clube = força-base + uma "deriva" que muda devagar de um ano para o outro (fases boas e ruins dos
// clubes). O clube do jogador recebe um ajuste conforme o desempenho e os minutos dele.
// No fim: os últimos da 1ª divisão caem e os primeiros da 2ª sobem (quantidade em PAISES[...].rebaixa).

export const MANDO = 2;                 // vantagem de jogar em casa (em pontos de força)
export const ultimasLigas = {};  // pais -> resultado da última temporada (para a interface)


export function jogarDivisao(entradas, ajuste){
  const tab = entradas.map(e => ({e, nome:e.club.name, j:0,v:0,e_:0,d:0,gp:0,gc:0,sg:0,pts:0}));
  const forca = tab.map(t => t.e.forca + t.e.deriva + (ajuste[t.nome] || 0));
  const reg = (t, gp, gc) => {
    t.j++; t.gp += gp; t.gc += gc; t.sg = t.gp - t.gc;
    if(gp>gc){ t.v++; t.pts += 3; } else if(gp===gc){ t.e_++; t.pts += 1; } else t.d++;
  };
  for(let i=0;i<tab.length;i++) for(let k=0;k<tab.length;k++){
    if(i===k) continue;                                   // i em casa contra k (ida e volta)
    const m = simPartida(forca[i]+MANDO, forca[k], false);
    reg(tab[i], m.ga, m.gb); reg(tab[k], m.gb, m.ga);
  }
  ordenarTabela(tab);
  tab.forEach((t,i) => { t.pos = i+1; t.e = undefined; t.empates = t.e_; delete t.e_; });
  return tab;
}

/**
 * Simula as ligas de todos os países em um ano.
 * @param {number} ano
 * @param {Object<string,number>} ajuste  bônus de força por nome de clube (o clube do jogador)
 * @returns {Object} resultados por país
 */
export function simularLigas(ano, ajuste={}){
  const res = {};
  Object.entries(PAISES).forEach(([pais, P]) => {
    const d1 = CATALOGO.filter(e => e.league===pais && e.div===1);
    const d2 = CATALOGO.filter(e => e.league===pais && e.div===2);
    const t1 = jogarDivisao(d1, ajuste), t2 = jogarDivisao(d2, ajuste);
    const k = Math.min(P.rebaixa||0, Math.floor(d1.length/3), Math.floor(d2.length/2));
    const caem = k ? t1.slice(-k).map(t => t.nome) : [];
    const sobem = k ? t2.slice(0,k).map(t => t.nome) : [];
    res[pais] = {
      ano, pais, k, caem, sobem,
      divs:[{div:1, nome:nomeDivisao(pais,1), titulo:P.titulos[0], tabela:t1},
            {div:2, nome:nomeDivisao(pais,2), titulo:P.titulos[1], tabela:t2}]
    };
  });
  return res;
}

// Aplica acesso/rebaixamento e atualiza a "deriva" de todos os clubes para a próxima temporada.
export function aplicarMovimentos(res){
  const por = {};
  CATALOGO.forEach(e => por[e.club.name] = e);
  Object.values(res).forEach(r => {
    r.caem.forEach(n => { const e = por[n]; e.div = 2; e.deriva -= 1.5; atualizarCategoria(e); });
    r.sobem.forEach(n => { const e = por[n]; e.div = 1; e.deriva += 1.5; atualizarCategoria(e); });
    ultimasLigas[r.pais] = r;
  });
  CATALOGO.forEach(e => { e.deriva = clamp(e.deriva*0.65 + gauss()*2.2, -7, 7); });
}

// Resultado de um clube num resultado de liga: posição, divisão, se caiu/subiu.
export function situacaoDoClube(res, nome){
  for(const r of Object.values(res)) for(const d of r.divs){
    const t = d.tabela.find(x => x.nome===nome);
    if(t) return {
      pais:r.pais, div:d.div, divNome:d.nome, titulo:d.titulo, pos:t.pos, total:d.tabela.length, pts:t.pts,
      movimento: r.caem.includes(nome) ? "rebaixado" : r.sobem.includes(nome) ? "acesso" : null
    };
  }
  return null;
}

export function limparLigas(){ for(const k of Object.keys(ultimasLigas)) delete ultimasLigas[k]; }
