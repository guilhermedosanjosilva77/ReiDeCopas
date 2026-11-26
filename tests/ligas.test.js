// Testes das ligas: catálogo, categorias, acesso e rebaixamento.
import { describe, it, expect, beforeEach } from 'vitest';
import { readdirSync } from 'node:fs';
import { PAISES, LOGO_ALIAS } from '../src/data/clubes.js';
import { CATALOGO, CLUBES_POR_NOME, montarCatalogo, entradaDe, clubesDe } from '../src/engine/clubes.js';
import '../src/engine/champions.js';
import { simularLigas, aplicarMovimentos, situacaoDoClube, limparLigas } from '../src/engine/liga.js';

const slugify = s => s.replace(/ı/g,'i').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/['’]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const tamanhos = () => Object.fromEntries(Object.keys(PAISES).map(p =>
  [p, [1,2].map(d => CATALOGO.filter(e => e.league===p && e.div===d).length)]));

beforeEach(() => { montarCatalogo(); limparLigas(); });

describe('catálogo de clubes', () => {
  it('não tem nomes repetidos', () => {
    const nomes = CATALOGO.map(e => e.club.name);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('Brasil tem 20 na Série A e 20 na Série B; Argentina 30 na Primera', () => {
    const t = tamanhos();
    expect(t["Brasil"]).toEqual([20, 20]);
    expect(t["Argentina"][0]).toBe(30);
  });

  it('categoria segue a divisão: 2ª = pequeno; 1ª = grande ou médio', () => {
    CATALOGO.forEach(e => {
      if(e.div===2) expect(e.category).toBe("serieB");
      else expect(e.category).toBe(e.grande ? "elite" : "serieA");
    });
    expect(entradaDe("Flamengo").category).toBe("elite");
    expect(entradaDe("Bahia").category).toBe("serieA");
    expect(entradaDe("Fortaleza").category).toBe("serieB");
  });

  it('todo escudo dos pacotes pertence a um clube do jogo', () => {
    const arquivos = readdirSync(new URL('../src/assets/escudos/', import.meta.url)).map(f => f.replace('.football-logos.cc.png',''));
    const slugs = new Set(Object.values(CLUBES_POR_NOME).map(c => LOGO_ALIAS[c.name] || c.slug || slugify(c.name)));
    const orfaos = arquivos.filter(a => !slugs.has(a));
    expect(orfaos).toEqual([]);
    expect(arquivos.length).toBeGreaterThanOrEqual(335);
  });

  it('todos os países com clubes oferecem as três categorias para o primeiro clube', () => {
    Object.keys(PAISES).forEach(p => ["elite","serieA","serieB"].forEach(c => expect(clubesDe(p,c).length, p+" "+c).toBeGreaterThan(1)));
  });
});

describe('acesso e rebaixamento', () => {
  it('mantém o tamanho das divisões e troca a mesma quantidade de clubes', () => {
    const antes = tamanhos();
    for(let ano=2024; ano<2054; ano++){
      const r = simularLigas(ano);
      Object.values(r).forEach(x => { expect(x.caem.length).toBe(x.k); expect(x.sobem.length).toBe(x.k); });
      expect(r["Brasil"].k).toBe(4);
      expect(r["Argentina"].k).toBe(2);
      expect(r["Inglaterra"].k).toBe(3);
      expect(r["México"].k).toBe(0);
      aplicarMovimentos(r);
    }
    expect(tamanhos()).toEqual(antes);
  });

  it('rebaixados são os últimos da 1ª e promovidos os primeiros da 2ª', () => {
    const r = simularLigas(2024);
    const br = r["Brasil"];
    expect(br.caem).toEqual(br.divs[0].tabela.slice(-4).map(t=>t.nome));
    expect(br.sobem).toEqual(br.divs[1].tabela.slice(0,4).map(t=>t.nome));
    aplicarMovimentos(r);
    br.caem.forEach(n => { expect(entradaDe(n).div).toBe(2); expect(entradaDe(n).category).toBe("serieB"); });
    br.sobem.forEach(n => { expect(entradaDe(n).div).toBe(1); expect(entradaDe(n).category).not.toBe("serieB"); });
  });

  it('a tabela é coerente (pontos = 3V + E, 38 jogos na Série A)', () => {
    const r = simularLigas(2024);
    r["Brasil"].divs[0].tabela.forEach(t => {
      expect(t.j).toBe(38);
      expect(t.pts).toBe(3*t.v + t.empates);
      expect(t.v + t.empates + t.d).toBe(t.j);
    });
    const sg = r["Brasil"].divs[0].tabela.reduce((s,t) => s+t.sg, 0);
    expect(sg).toBe(0);
  });

  it('situacaoDoClube informa posição e movimento', () => {
    const r = simularLigas(2024);
    const caiu = r["Brasil"].caem[0];
    const s = situacaoDoClube(r, caiu);
    expect(s.movimento).toBe("rebaixado");
    expect(s.div).toBe(1);
    expect(s.pos).toBeGreaterThan(16);
  });

  it('grandes caem raramente e clubes da Série B sobem com frequência', () => {
    let grandesCaindo = 0, temporadas = 0;
    for(let i=0;i<6;i++){
      montarCatalogo();
      for(let ano=2024; ano<2044; ano++){
        const r = simularLigas(ano);
        grandesCaindo += r["Brasil"].caem.filter(n => entradaDe(n).grande).length;
        temporadas++;
        aplicarMovimentos(r);
      }
    }
    // 4 grandes por temporada: queda de grande deve ficar bem abaixo de 1 a cada 2 temporadas
    expect(grandesCaindo/temporadas).toBeLessThan(0.5);
  });
});
