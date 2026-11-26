// Testes das regras de realismo (v2.1) e do mercado após mau desempenho em clube grande.
import { describe, it, expect } from 'vitest';
import { NACOES, POSICOES } from '../src/data/base.js';
import { SELECOES } from '../src/data/selecoes.js';
import { COMPETICOES } from '../src/engine/competicoes.js';
import { player } from '../src/engine/jogador.js';
import { iniciarCarreira, definirPrimeiroClube, sortearPrimeiroClube, jogarCarreiraAutomatica } from '../src/engine/carreira.js';
import { entradaDe } from '../src/engine/clubes.js';
import { calcularOfertas, ultimoMercado, aplicarTransferencia, ficarNoClube } from '../src/engine/mercado.js';
import { simularTemporada } from '../src/engine/temporada.js';
import { notaDaTemporada, tendenciaIdade, faseDaNota } from '../src/engine/desenvolvimento.js';
import { classificarFase } from '../src/engine/fase.js';

const temporadaRuim = (clube, extra={}) => ({age:player.age-1, year:2024, clubRef:player.club, league:entradaDe(clube).league,
  category:"elite", games:7, goals:0, assists:0, perf:3, share:0.2, nota:36, trofeus:[], torneios:[], liga:null, ...extra});

describe('mau desempenho em clube grande', () => {
  it('não permite ficar e só oferece clubes de outro escalão', () => {
    for(let i=0;i<150;i++){
      iniciarCarreira({name:"T", pos:"ATA", nat:"Brasil", start:"pro"});
      definirPrimeiroClube(entradaDe("Flamengo"));
      player.age = 25; player.ovr = 74;
      player.history.push(temporadaRuim("Flamengo"));
      const ofertas = calcularOfertas();
      expect(ultimoMercado.podeFicar).toBe(false);
      expect(ultimoMercado.situacao).toBe("forcado");
      expect(ofertas.length).toBeGreaterThan(0);
      ofertas.forEach(o => { expect(o.category).not.toBe("elite"); expect(o.club.name).not.toBe("Flamengo"); });
    }
  });

  it('jovem dispensado de clube grande recebe empréstimos', () => {
    let comEmprestimo = 0;
    for(let i=0;i<100;i++){
      iniciarCarreira({name:"T", pos:"MEI", nat:"Brasil", start:"base"});
      definirPrimeiroClube(entradaDe("Palmeiras"));
      player.age = 19; player.ovr = 66;
      player.history.push(temporadaRuim("Palmeiras", {age:18}));
      if(calcularOfertas().some(o => o.tipo==="emprestimo")) comEmprestimo++;
    }
    expect(comEmprestimo).toBeGreaterThan(60);
  });

  it('temporada boa em clube grande mantém a opção de ficar', () => {
    iniciarCarreira({name:"T", pos:"ATA", nat:"Brasil", start:"pro"});
    definirPrimeiroClube(entradaDe("Flamengo"));
    player.history.push(temporadaRuim("Flamengo", {games:34, goals:14, assists:6, share:0.85, nota:72, perf:1}));
    calcularOfertas();
    expect(ultimoMercado.podeFicar).toBe(true);
  });

  it('empréstimo: ao fim da temporada pode voltar ao clube de origem', () => {
    iniciarCarreira({name:"T", pos:"MEI", nat:"Brasil", start:"base"});
    definirPrimeiroClube(entradaDe("Palmeiras"));
    const destino = entradaDe("Goiás");
    aplicarTransferencia({...destino, tipo:"emprestimo"});
    expect(player.emprestimo.dono.name).toBe("Palmeiras");
    const s = simularTemporada();
    expect(s.emprestimo).toBe("Palmeiras");
    calcularOfertas();
    if(player.emprestimo){                         // se houver propostas, a janela é de fim de empréstimo
      expect(ultimoMercado.situacao).toBe("fimEmprestimo");
      ficarNoClube();
    }
    expect(player.club.name).toBe("Palmeiras");
    expect(player.emprestimo).toBe(null);
  });
});

describe('Copa Ouro', () => {
  it('só tem seleções da CONCACAF', () => {
    const ouro = COMPETICOES.find(c => c.id==="ouro");
    for(const nat of ["Estados Unidos","México","Jamaica","Cuba"]){
      const p = ouro.participantes(nat);
      expect(p.length).toBe(16);
      p.forEach(n => expect(SELECOES[n].c).toBe("CONCACAF"));
    }
    expect(ouro.pClassif("Brasil","CONMEBOL",88)).toBe(0);
    expect(ouro.pClassif("Japão","AFC",75)).toBe(0);
  });
});

describe('avaliação da temporada', () => {
  it('zagueiro sem gols, titular e bem avaliado não é classificado em má fase', () => {
    const nota = notaDaTemporada({atuacao:68, share:0.85, games:32, goals:0, assists:1, nivel:66, titulos:false, pos:"ZAG"});
    expect(nota).toBeGreaterThanOrEqual(55);
    expect(faseDaNota(nota)).not.toBe("ruim");
  });
  it('reserva que quase não jogou recebe nota baixa (perda de espaço)', () => {
    const nota = notaDaTemporada({atuacao:60, share:0.1, games:3, goals:0, assists:0, nivel:80, titulos:false, pos:"ATA"});
    expect(nota).toBeLessThanOrEqual(38);
  });
  it('goleiros e zagueiros declinam mais tarde que pontas', () => {
    expect(tendenciaIdade(33,"GOL")).toBeGreaterThan(tendenciaIdade(33,"PE"));
    expect(tendenciaIdade(31,"ZAG")).toBeGreaterThan(tendenciaIdade(31,"PD"));
  });
});

describe('distribuição das carreiras (Parte 11)', () => {
  it('carreiras excepcionais são raras; a maioria fica no meio; trajetórias variam', () => {
    const picos = [], notas = [], saltos = []; let graves = 0, semTitulo = 0;
    const N = 300;
    for(let i=0;i<N;i++){
      iniciarCarreira({name:"x", pos:Object.keys(POSICOES)[i%12], nat:NACOES[i%NACOES.length], start:"base"});
      sortearPrimeiroClube(); jogarCarreiraAutomatica();
      picos.push(player.peakOvr);
      player.history.forEach(s => { notas.push(s.nota); saltos.push(s.ovrChange); });
      if(player.lesoes.some(l => l.tipo==="grave")) graves++;
      if(!player.titulosConquistados.length) semTitulo++;
    }
    const frac = (a,f) => a.filter(f).length/a.length;
    const med = picos.slice().sort((a,b)=>a-b)[N>>1];
    expect(med).toBeGreaterThanOrEqual(73); expect(med).toBeLessThanOrEqual(81);
    expect(frac(picos, x => x>=90)).toBeLessThan(0.1);
    expect(frac(picos, x => x<75)).toBeGreaterThan(0.15);       // carreiras medianas existem
    expect(frac(notas, x => x>=90)).toBeLessThan(0.04);          // temporadas históricas são raras
    expect(frac(saltos, x => x>5)).toBeLessThan(0.01);           // +5 por temporada é teto prático
    expect(graves/N).toBeGreaterThan(0.1); expect(graves/N).toBeLessThan(0.45);
    expect(semTitulo/N).toBeGreaterThan(0.03);                   // dá para encerrar sem títulos
  }, 60000);
});
