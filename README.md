# Rei de Copas — v2.2

Simulador de carreira de jogador de futebol. Roda inteiro no navegador, sem servidor nem banco de dados.

## Só quero jogar

Abra **`dist/index.html`** com dois cliques. A pasta `dist/images/` precisa ficar ao lado dele. O jogo também funciona sem ela, porque os 335 escudos dos pacotes vêm embutidos no HTML (por isso ele tem cerca de 3 MB).

## Para desenvolver

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais recente.

```bash
npm install        # uma vez
npm run dev        # abre o jogo em http://localhost:5173 e recarrega a cada alteração salva
npm test           # roda os testes automáticos (motor, ligas, rebaixamento, mercado)
npm run build      # gera o dist/index.html (arquivo único) + dist/images
```

## Estrutura

```
index.html              estrutura das telas (HTML)
src/
  main.js               ponto de entrada
  styles/main.css       visual
  data/                 dados puros (fácil de editar)
    clubes.js           países, divisões, clubes e força; cores; apelidos de escudo
    europa.js           Champions League: vagas por país, ajuste de força e clubes convidados
    coresEscudos.js     cor predominante de cada escudo (gerado por scripts/gerar-cores.mjs)
    base.js             posições, nacionalidades
    selecoes.js         seleções (confederação, força, bandeira)
    logosWeb.js         endereços web de escudos (último recurso)
  engine/               regras do jogo — sem tela, testável
    clubes.js           catálogo de clubes, categorias, minutos esperados
    liga.js             ligas em pontos corridos, acesso e rebaixamento
    temporada.js        simulação de uma temporada
    fase.js             fase recente (Excelente/Boa/Regular/Ruim)
    mercado.js          propostas de transferência
    jogador.js          estado do jogador e valor de mercado
    selecao.js          convocação, torneios e motor de partidas
    competicoes.js      calendário internacional
    eventos.js          eventos dinâmicos (rebaixamento, treinador novo, estagnação…)
    desenvolvimento.js  potencial, curva de idade, nota da temporada, lesões, moral
    perfil.js           perfil final da carreira (padrões da base histórica)
    champions.js        UEFA Champions League (fase de liga com 36 clubes + mata-mata)
    carreira.js         início de carreira e modo rápido
  ui/                   telas (montam o HTML e ligam os botões)
  assets/escudos/       escudos embutidos no build (128 px)
public/images/          escudos copiados para dist/images (256 px)
tests/                  testes automáticos (Vitest)
scripts/metricas.js     equilíbrio das ligas: npx vite-node scripts/metricas.js
scripts/realismo.js     distribuição das carreiras: npx vite-node scripts/realismo.js 600 base
scripts/champions.js    campeões da Champions em 300 edições: npx vite-node scripts/champions.js
scripts/gerar-cores.mjs gera as cores dos clubes a partir dos escudos: node scripts/gerar-cores.mjs
docs/                   documento de referência de realismo (COPERO)
```

## Como fazer coisas comuns

- **Adicionar uma liga de escudos (pacote football-logos.cc):**
  1. Copie os `.png` de 128x128 para `src/assets/escudos/` e os de 256x256 para `public/images/`.
  2. Cadastre os clubes em `src/data/clubes.js`. Se o nome do arquivo não for o nome do clube sem acentos e com hífens, use o 3º campo: `["Newcastle United", 80, "newcastle"]`.
  3. Rode `node scripts/gerar-cores.mjs` para gerar as cores.
  4. Rode `npm test`: o teste "todo escudo dos pacotes pertence a um clube do jogo" avisa se sobrou algum arquivo sem clube.
- **Adicionar ou mover um clube:** edite `grandes`, `medios` ou `div2` do país em `src/data/clubes.js`. A força (0–100) só pesa na classificação da liga.
- **Mudar quantos clubes caem:** campo `rebaixa` do país (0 = liga fechada).

## Regras de categoria (v2.0)

| Categoria | Quem é |
|---|---|
| Clube grande | os maiores do país, enquanto estiverem na 1ª divisão |
| Clube médio | os demais clubes da 1ª divisão |
| Clube pequeno | clubes da 2ª divisão, inclusive um grande que tenha caído |

Todo ano as duas divisões de cada país são jogadas em pontos corridos. Caem e sobem 4 clubes no Brasil, 2 na Argentina e 1 nos demais países, porque as listas de clubes deles são menores. México e EUA são ligas fechadas, sem acesso nem rebaixamento. O desempenho do jogador ajusta a força do próprio clube, e o título de liga só vem com o 1º lugar. Se o clube do jogador cair, aparece um evento obrigatório: ficar e ajudar o clube a subir, ou procurar outro clube.

## Realismo das carreiras (v2.1)

Baseado em `docs/copero_referencia_simulacao_realista.md`.

- **Variáveis separadas:** OVR, potencial (oculto; a tela mostra só a faixa estimada pelos olheiros), consistência, condição física, moral, reputação, valor de mercado e situação no elenco.
- **Nota da temporada (0–100):** combina atuação, minutos, estatística ajustada à posição, nível da competição, importância no elenco e títulos. Faixas: Histórica, Excelente, Muito boa, Boa, Regular, Fraca, Muito fraca e Crítica.
- **Evolução do OVR:** depende de idade, distância até o potencial, nota, minutos, ambiente e lesões. O normal é de 0 a 2 pontos por temporada, e acima de 5 é raríssimo. Goleiros e zagueiros declinam mais tarde; pontas e laterais, mais cedo.
- **Potencial não é destino:** sobe com uma ascensão tardia e cai com estagnação, temporadas fracas seguidas ou lesão grave.
- **Lesões:** podem ser pontuais, relevantes ou graves. O risco cresce com a idade, o histórico de lesões e o desgaste.
- **Mercado:**
  - Depois de uma temporada ruim em clube grande, o jogador não pode ficar e só recebe propostas de clubes de outro escalão. Até os 22 anos, a saída costuma ser por empréstimo.
  - No fim do empréstimo, ele volta ao clube de origem ou fica em definitivo.
  - Não há saltos de clube pequeno direto para gigante, salvo exceção.
  - Veteranos atraem clubes menores.
- **Seleção:** a convocação considera a nota, o nível do clube e o histórico de convocações. OVR alto não garante vaga.
- **Relatório:** clique em qualquer linha da tabela para ver o relatório da temporada. No fim da carreira aparece o perfil da trajetória.

Números de referência (600 carreiras começando na base, decisões automáticas): OVR de pico mediano 78; 3% chegam a 90+ e 15% a 85+; 1% das temporadas são "Históricas"; 29% das carreiras têm uma lesão grave; cerca de 6% ficam bem abaixo do potencial e 5% são ascensões tardias.

## Ligas e Champions League (v2.2)

- **18 países, 492 clubes.** Ligas completas com escudo: Premier League + Championship, La Liga, Serie A, Ligue 2, Eredivisie, Pro League (Bélgica), Süper Lig, Scottish Premiership, SuperLiga (Romênia), Premier League Russa, Saudi Pro League, MLS, Brasileirão A e B, Liga Profesional. Ainda sem pacote de escudos: Ligue 1, Bundesliga, Portugal, México, Japão e as segundas divisões de Espanha, Itália, Holanda, Bélgica, Turquia, Escócia, Romênia, Rússia e Arábia Saudita.
- **Champions League** (formato desde 2024/25):
  - 36 clubes, com as vagas definidas pela classificação da liga na temporada anterior: Inglaterra, Espanha, Itália e Alemanha 4; França 3; Portugal, Holanda, Bélgica e Turquia 2; Escócia e Romênia 1. As demais vagas ficam com clubes de outros países europeus.
  - Fase de liga com 8 jogos contra adversários diferentes. Do 1º ao 8º vão direto às oitavas; do 9º ao 24º disputam os playoffs. Oitavas, quartas e semifinais são em ida e volta, e a final é em jogo único.
  - Clubes russos não disputam, por estarem suspensos pela UEFA desde 2022.
  - Os jogos da Champions somam nas estatísticas do clube, e uma boa campanha melhora a nota, a reputação, o valor e o interesse do mercado.
  - O título entra na vitrine com troféu próprio e aumenta a chance de Bola de Ouro.
  - A aba LIGA mostra a campanha completa da última edição.
- **Copa Ouro:** só seleções da CONCACAF.
