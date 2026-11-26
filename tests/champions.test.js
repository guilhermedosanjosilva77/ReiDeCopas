// Testes da UEFA Champions League e das ligas novas.
import { describe, it, expect, beforeEach } from 'vitest';
import { PAISES } from '../src/data/clubes.js';
import { UCL } from '../src/data/europa.js';
import { montarCatalogo, entradaDe } from '../src/engine/clubes.js';
import { simularLigas, aplicarMovimentos, limparLigas } from '../src/engine/liga.js';
import { classificadosChampions, simularChampions } from '../src/engine/champions.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, definirPrimeiroClube } from '../src/engine/carreira.js';
import { simularTemporada } from '../src/engine/temporada.js';

beforeEach(() => { montarCatalogo(); limparLigas(); });
const jog = {pJogar:0.8, pGol:0.2, pAst:0.15};

describe('Champions League', () => {
  it('36 clubes, sem repetição, sem clubes russos, vagas por país respeitadas', () => {
    for(let ano=2024; ano<2030; ano++){
      const c = classificadosChampions();
      expect(c.length).toBe(36);
      expect(new Set(c.map(t=>t.nome)).size).toBe(36);
      expect(c.some(t => t.pais==="Rússia")).toBe(false);
      Object.entries(UCL.vagas).forEach(([p,n]) => expect(c.filter(t=>t.pais===p).length).toBe(n));
      aplicarMovimentos(simularLigas(ano));
    }
  });

  it('vagas saem da classificação da liga anterior', () => {
    const r = simularLigas(2024); aplicarMovimentos(r);
    const top4 = r["Inglaterra"].divs[0].tabela.slice(0,4).map(t=>t.nome);
    const c = classificadosChampions().filter(t => t.pais==="Inglaterra").map(t=>t.nome);
    expect(c).toEqual(top4);
  });

  it('fase de liga com 8 jogos por clube e mata-mata coerente', () => {
    const meu = classificadosChampions()[0].nome;
    for(let i=0;i<30;i++){
      const u = simularChampions(2024, {meu, ajuste:0, jog});
      u.tabela.forEach(t => { expect(t.j).toBe(8); expect(t.pts).toBe(3*t.v+t.e); });
      expect(u.tabela.reduce((s,t)=>s+t.sg,0)).toBe(0);
      expect(u.mata.map(r=>r.cod)).toEqual(["playoff","oitavas","quartas","semi","final"]);
      expect(u.mata[0].confrontos.length).toBe(8);
      expect(u.mata[1].confrontos.length).toBe(8);
      expect(u.mata[2].confrontos.length).toBe(4);
      expect(u.mata[3].confrontos.length).toBe(2);
      const f = u.mata[4].final;
      expect([f.a, f.b]).toContain(u.campeao);
      // top 8 da fase de liga entram direto nas oitavas
      const top8 = u.tabela.slice(0,8).map(t=>t.nome);
      expect(u.mata[1].confrontos.map(c=>c.a).sort()).toEqual(top8.slice().sort());
      // fase do clube do jogador coerente com a posição
      if(u.posLiga>24) expect(u.fase).toBe("liga");
      if(u.titulo) expect(u.fase).toBe("campeao");
      expect(u.jogador.jogos).toBeLessThanOrEqual(8 + 2*4 + 1);
    }
  });

  it('jogador de clube classificado disputa a Champions e os números entram no total do clube', () => {
    let comUCL = 0;
    for(let i=0;i<40;i++){
      iniciarCarreira({name:"T", pos:"ATA", nat:"Inglaterra", start:"pro"});
      const meu = classificadosChampions().find(t => t.pais==="Inglaterra").nome;
      definirPrimeiroClube(entradaDe(meu));
      const s = simularTemporada();
      expect(s.ucl).toBeTruthy();
      comUCL++;
      expect(s.games).toBe(s.jogosLiga + s.ucl.jogador.jogos);
      expect(s.goals).toBe(s.golsLiga + s.ucl.jogador.gols);
      if(s.trofeus.includes("champions")) expect(s.ucl.titulo).toBe(true);
    }
    expect(comUCL).toBe(40);
  });

  it('clube brasileiro ou russo não disputa a Champions', () => {
    iniciarCarreira({name:"T", pos:"ATA", nat:"Brasil", start:"pro"});
    definirPrimeiroClube(entradaDe("Flamengo"));
    expect(simularTemporada().ucl).toBe(null);
    definirPrimeiroClube(entradaDe("Zenit"));
    expect(simularTemporada().ucl).toBe(null);
  });
});

describe('ligas novas', () => {
  it('Bélgica, Turquia, Escócia, Romênia e Rússia existem com duas divisões e rebaixamento', () => {
    for(const p of ["Bélgica","Turquia","Escócia","Romênia","Rússia"]){
      expect(PAISES[p]).toBeTruthy();
      expect(PAISES[p].rebaixa).toBeGreaterThan(0);
      const r = simularLigas(2024)[p];
      expect(r.caem.length).toBe(PAISES[p].rebaixa);
    }
  });
  it('Premier League e Championship completas (20 + 24)', () => {
    const r = simularLigas(2024)["Inglaterra"];
    expect(r.divs[0].tabela.length).toBe(20);
    expect(r.divs[1].tabela.length).toBe(24);
    expect(r.caem.length).toBe(3);
  });
});
