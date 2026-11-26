// Testes de carreira completa (sem interface) e da integração com a liga.
import { describe, it, expect } from 'vitest';
import { NACOES, POSICOES } from '../src/data/base.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, sortearPrimeiroClube, definirPrimeiroClube, jogarCarreiraAutomatica } from '../src/engine/carreira.js';
import { entradaDe, clubesDe, CATALOGO } from '../src/engine/clubes.js';
import { simularTemporada } from '../src/engine/temporada.js';
import { selecionarEvento, resolverEvento } from '../src/engine/eventos.js';
import { calcularOfertas } from '../src/engine/mercado.js';

const pick = a => a[Math.floor(Math.random()*a.length)];
const novo = (o={}) => iniciarCarreira({name:"Teste", number:9, pos:pick(Object.keys(POSICOES)), nat:pick(NACOES), start:Math.random()<0.5?"base":"pro", ...o});

describe('carreiras automáticas', () => {
  it('120 carreiras terminam sem erro e com estatísticas coerentes', () => {
    for(let i=0;i<120;i++){
      novo(); sortearPrimeiroClube();
      const n = jogarCarreiraAutomatica();
      expect(n).toBeGreaterThan(10);
      const clube = player.history.reduce((a,s)=>({g:a.g+s.games, gl:a.gl+s.goals, as:a.as+s.assists}), {g:0,gl:0,as:0});
      expect(player.stats.games).toBe(clube.g + player.sel.games);
      expect(player.stats.goals).toBe(clube.gl + player.sel.goals);
      expect(player.stats.assists).toBe(clube.as + player.sel.assists);
      player.history.forEach(s => {
        expect(s.liga, 'toda temporada tem a posição na liga').toBeTruthy();
        // Título de liga só com 1º lugar
        if(s.trofeus.includes("liga")) { expect(s.liga.pos).toBe(1); expect(s.liga.div).toBe(1); }
        if(s.trofeus.includes("liga2")) { expect(s.liga.pos).toBe(1); expect(s.liga.div).toBe(2); }
        if(s.liga.pos===1 && s.games>=12) expect(s.trofeus.some(k => k==="liga"||k==="liga2")).toBe(true);
      });
      expect(Number.isFinite(player.value)).toBe(true);
      // a categoria do jogador acompanha a divisão do clube
      const e = entradaDe(player.club.name);
      expect(player.category).toBe(e.category);
      expect(player.div).toBe(e.div);
    }
  });
});

describe('rebaixamento do clube do jogador', () => {
  it('gera evento obrigatório; ficar mantém o jogador na 2ª divisão como clube pequeno', () => {
    let testados = 0;
    for(let t=0; t<400 && testados<5; t++){
      novo({nat:"Brasil", pos:"ZAG", start:"pro"});
      // começa num médio fraco da Série A para que a queda seja provável
      const fraco = clubesDe("Brasil","serieA").sort((a,b)=>a.forca-b.forca)[0];
      definirPrimeiroClube(fraco);
      for(let k=0;k<6;k++){
        const s = simularTemporada();
        if(s.liga.movimento==="rebaixado"){
          expect(player.div).toBe(2);
          expect(player.category).toBe("serieB");
          const ev = selecionarEvento(s);
          expect(ev && ev.id).toBe("rebaixamento");
          player.pendingEvent = ev;
          resolverEvento(0);                      // ficar
          expect(player.ofertasBloqueadas).toBe(true);
          const s2 = simularTemporada();
          expect(s2.liga.div).toBe(2);
          expect(s2.clubRef.name).toBe(s.clubRef.name);
          testados++;
          break;
        }
      }
    }
    expect(testados).toBeGreaterThan(0);
  });

  it('acesso devolve o clube à 1ª divisão e muda a categoria', () => {
    let ok = 0;
    for(let t=0; t<200 && ok<3; t++){
      novo({nat:"Brasil", pos:"ATA", start:"pro"});
      const forte = clubesDe("Brasil","serieB").sort((a,b)=>b.forca-a.forca)[0];
      definirPrimeiroClube(forte);
      const s = simularTemporada();
      if(s.liga.movimento==="acesso"){
        expect(player.div).toBe(1);
        expect(["serieA","elite"]).toContain(player.category);
        ok++;
      }
    }
    expect(ok).toBeGreaterThan(0);
  });
});

describe('mercado depois da mudança de categorias', () => {
  // Cenário A do documento de transferências: fase ruim em clube grande → sem enxurrada de grandes
  it('fase ruim em clube grande raramente traz propostas de grandes', () => {
    let janelas = 0, comElite = 0;
    for(let i=0;i<300;i++){
      novo({nat:"Brasil", pos:"ATA", start:"pro"});
      definirPrimeiroClube(entradaDe("Palmeiras"));
      player.ovr = 66; player.age = 24;
      player.history.push({age:23, year:2024, clubRef:player.club, league:"Brasil", category:"elite",
        games:6, goals:0, assists:0, perf:3, share:0.2, trofeus:[], torneios:[], liga:null});
      const o = calcularOfertas();
      if(o.length){ janelas++; if(o.some(x => x.category==="elite")) comElite++; }
    }
    expect(comElite/Math.max(1,janelas)).toBeLessThan(0.12);
  });

  it('clubes da 2ª divisão aparecem como opção para quem está em fase ruim', () => {
    let pequenos = 0, total = 0;
    for(let i=0;i<200;i++){
      novo({nat:"Brasil", pos:"MC", start:"pro"});
      definirPrimeiroClube(entradaDe("Bahia"));
      player.ovr = 62; player.age = 27;
      player.history.push({age:26, year:2024, clubRef:player.club, league:"Brasil", category:"serieA",
        games:8, goals:0, assists:0, perf:3, share:0.25, trofeus:[], torneios:[], liga:null});
      calcularOfertas().forEach(o => { total++; if(o.category==="serieB") pequenos++; });
    }
    expect(pequenos/Math.max(1,total)).toBeGreaterThan(0.25);
  });
});
