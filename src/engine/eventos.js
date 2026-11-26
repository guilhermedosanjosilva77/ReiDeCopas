import { nivelAtual, nomeDivisao, shareMinutos } from './clubes.js';
import { player } from './jogador.js';
import { aplicarTransferencia, precisaSair, sortearClube } from './mercado.js';
import { limiarSelecao, ovrEfetivoSel } from './selecao.js';
import { clamp, sortearPonderado } from './util.js';
import { clube } from '../ui/champions.js';

/* ===================== EVENTOS DINÂMICOS (item 5) ===================== */
// Cada evento: condição de contexto, texto personalizado, duas opções com prós/contras e consequências aplicadas
// aos sistemas existentes (minutos, forma, OVR, reputação, valor, interesse de clubes, seleção, títulos).
export const addEf = (k,v) => { player.efeitos[k] = (player.efeitos[k]||0) + v; };
export const mulEf = (k,v) => { player.efeitos[k] = (player.efeitos[k]||1) * v; };
export const addRep = v => { player.rep = clamp(player.rep+v, 10, 100); };
export function mudarClube(c){ aplicarTransferencia(c); player.ofertasBloqueadas = true; }

export function ctxEvento(s){
  const hist = player.history, pen = hist[hist.length-2] || null;
  return {
    idade:player.age, ovr:player.ovr, rep:player.rep, valor:player.value,
    clube:player.club.name, liga:player.league, categoria:player.category, tier:player.tier, nivel:nivelAtual(),
    perf:s.perf, share:s.share, golsUlt:s.goals, jogosUlt:s.games, penultPerf:pen?pen.perf:null, fase:player.fase,
    T:limiarSelecao(player.nat), ovrSelEf:ovrEfetivoSel(player.ovr, s.perf, player.age), temporadas:hist.length,
    movimento:s.liga ? s.liga.movimento : null, divNome:s.liga ? s.liga.divNome : "", divNova:nomeDivisao(player.league, player.div),
    nota:s.nota, papel:s.papel, forcado:precisaSair(),
    estagnado: hist.length>=3 && hist.slice(-3).reduce((a,x)=>a+x.ovrChange,0)<=1 && player.ovr < player.potencial-3
  };
}

export const EVENTOS = [
{ id:"rebaixamento", icone:"📉", titulo:"O clube foi rebaixado", peso:10, cooldown:1, max:99, obrigatorio:true,
  cond:c => c.movimento==="rebaixado",
  contexto:c => `O ${c.clube} terminou entre os últimos da ${c.divNome} e foi rebaixado. Na próxima temporada o clube disputa a ${c.divNova}. A diretoria quer saber se você fica para ajudar na volta.`,
  opcoes:[
   { rotulo:"Ficar e ajudar o clube a voltar",
     pros:["Mais minutos e protagonismo na divisão de baixo","Ganha a torcida e pode liderar o acesso"],
     contras:["Menos visibilidade por uma temporada","Nível de competição mais baixo"],
     aplicar:c => {
       player.ofertasBloqueadas = true; addEf("minutos",0.12); addEf("forma",0.15); mulEf("titulo",1.15); addRep(1);
       return {texto:`Você ficou no ${c.clube}. O objetivo agora é conquistar o acesso de volta.`};
     }},
   { rotulo:"Buscar um novo clube",
     pros:["Continua jogando na primeira divisão, se houver proposta","Mantém a exposição"],
     contras:["Parte da torcida vê a saída como abandono","As propostas dependem do seu momento"],
     aplicar:c => { addRep(-1); return {texto:"Você pediu para sair. O mercado vai olhar para a sua fase recente."}; }}
  ]},
{ id:"treinador_novo", icone:"📋", titulo:"Mudança de treinador", peso:2, cooldown:3, max:4,
  cond:c => c.idade>=19 && c.idade<=34 && c.jogosUlt>=8,
  contexto:c => `O ${c.clube} trocou de treinador. O novo comandante usa outro sistema e avisou que todos começam do zero.`,
  opcoes:[
   { rotulo:"Aceitar uma nova função no sistema",
     pros:["Espaço garantido no time","Mostra versatilidade"],
     contras:["Menos participação ofensiva na nova função"],
     aplicar:c => { addEf("minutos",0.12); mulEf("golsMult",0.8); addEf("forma",0.05);
       return {texto:"Você se adaptou à nova função. O treinador gostou da disposição."}; }},
   { rotulo:"Manter sua posição e disputar a vaga",
     pros:["Se convencer o treinador, vira peça central"],
     contras:["Se não convencer, perde espaço"],
     aplicar:c => {
       if(Math.random() < clamp(0.35 + (c.nota-55)/60, 0.15, 0.8)){ addEf("minutos",0.15); addEf("forma",0.1); return {texto:"Você convenceu o novo treinador e segue como titular na sua posição."}; }
       addEf("minutos",-0.18); addEf("forma",-0.1); return {texto:"O novo treinador preferiu outro jogador na sua posição. A próxima temporada começa no banco."};
     }}
  ]},
{ id:"estagnacao", icone:"⏸️", titulo:"Carreira estagnada", peso:3, cooldown:4, max:2,
  cond:c => c.idade>=20 && c.idade<=27 && c.estagnado,
  contexto:c => `Três temporadas sem evolução significativa. A comissão técnica do ${c.clube} acha que você ainda pode render mais — a dúvida é onde.`,
  opcoes:[
   { rotulo:"Mudar de ambiente",
     pros:["Clubes que oferecem mais minutos","Um recomeço pode destravar a evolução"],
     contras:["Pode ser um passo atrás no tamanho do clube"],
     aplicar:c => { player.ofertaTipo = "minutos"; return {texto:"Você decidiu buscar um novo ambiente. A janela vai priorizar clubes onde possa jogar."}; }},
   { rotulo:"Ficar e reforçar o treinamento",
     pros:["Mantém o espaço conquistado","Treino específico pode render frutos"],
     contras:["Não há garantia de evolução"],
     aplicar:c => {
       if(Math.random()<0.45){ addEf("ovr",1); addEf("forma",0.15); return {texto:"O trabalho extra deu resultado: você voltou a evoluir."}; }
       addEf("forma",-0.05); return {texto:"Você treinou mais, mas a evolução não veio por enquanto."};
     }}
  ]},
{ id:"promessa", icone:"🌟", titulo:"A promessa da temporada", peso:4, cooldown:99, max:1,
  cond:c => c.idade<=20 && c.ovr>=66 && c.jogosUlt>=12 && (c.perf===0 || (c.perf===1 && c.golsUlt>=10)) && c.categoria!=="elite",
  contexto:c => `Você tem ${c.idade} anos e fez uma temporada excepcional pelo ${c.clube}. Olheiros de grandes clubes passaram a acompanhar seus jogos, e uma equipe de elite apresentou uma proposta.`,
  opcoes:[
   { rotulo:"Aceitar a proposta de um clube de elite",
     pros:["Grande aumento de reputação","Possibilidade de acelerar a evolução"],
     contras:["Concorrência elevada pela posição","Menor probabilidade de ser titular","Risco de queda nos números"],
     aplicar:c => {
       const alvo = sortearClube(x=>x.category==="elite" && x.tier===1) || sortearClube(x=>x.category==="elite");
       if(!alvo) return {texto:"A proposta não se concretizou e você seguiu no clube."};
       mudarClube(alvo); addRep(5); addEf("interesse",0.2);
       const sh = shareMinutos(player.ovr, alvo.nivel, player.age, 0, false);
       return {texto:`Você assinou com o ${alvo.club.name} (${alvo.league}). ${sh<0.4 ? "A concorrência é enorme e o espaço no time deve ser pequeno no início." : "Há espaço para disputar uma vaga desde o começo."}`};
     }},
   { rotulo:"Permanecer no clube atual",
     pros:["Mais chances de manter os minutos","Continuar como protagonista","Melhores estatísticas"],
     contras:["Menor exposição internacional","Risco de perder a oportunidade de transferência"],
     aplicar:c => {
       addEf("minutos",0.12); addRep(1);
       if(Math.random()<0.4){ addEf("interesse",-0.35); return {texto:"Você ficou como protagonista, mas a janela de oportunidade se fechou por ora: os grandes clubes esfriaram o interesse."}; }
       return {texto:"Você ficou como protagonista. Os clubes grandes seguem de olho no seu desempenho."};
     }}
  ]},
{ id:"treinador", icone:"🧢", titulo:"O treinador perdeu a confiança", peso:3, cooldown:3, max:3,
  cond:c => c.idade>=17 && (c.perf===3 || (c.share<0.4 && c.perf>=2)),
  contexto:c => `Depois de algumas partidas ruins, o treinador do ${c.clube} passou a deixá-lo no banco. A confiança em você diminuiu.`,
  opcoes:[
   { rotulo:"Treinar mais e disputar a posição",
     pros:["Possibilidade de recuperar espaço","Demonstra comprometimento"],
     contras:["Desgaste maior","Risco de continuar sem minutos suficientes"],
     aplicar:c => {
       if(Math.random()<(c.ovr>=c.nivel-3?0.65:0.55)){ addEf("minutos",0.2); addEf("forma",0.35); return {texto:"O esforço foi notado: o treinador voltou a contar com você e a confiança começou a retornar."}; }
       addEf("forma",-0.2); addEf("minutos",-0.05); return {texto:"Mesmo treinando mais, o desgaste pesou e você segue sem conquistar a confiança do treinador."};
     }},
   { rotulo:"Pedir uma transferência",
     pros:["Chance de buscar um clube com mais oportunidades"],
     contras:["Risco de receber propostas de equipes inferiores","Perda de espaço no mercado"],
     aplicar:c => { addRep(-1); player.ofertaTipo = "minutos"; return {texto:"Você comunicou ao clube que quer sair. Chegaram propostas de equipes onde terá mais chances de jogar."}; }}
  ]},
{ id:"salarial", icone:"💰", titulo:"Proposta salarial irrecusável", peso:2, cooldown:5, max:2,
  cond:c => c.idade>=23 && c.ovr>=70 && c.rep>=40 && c.liga!=="Arábia Saudita",
  contexto:c => `Um clube de uma liga financeiramente muito forte oferece um contrato muito superior ao que você recebe no ${c.clube}.`,
  opcoes:[
   { rotulo:"Aceitar a transferência",
     pros:["Salário muito maior","Possível aumento do valor de mercado","Nova experiência"],
     contras:["Adaptação difícil","Menor visibilidade em certos mercados","Risco de estagnação esportiva"],
     aplicar:c => {
       const alvo = sortearClube(x=>x.league==="Arábia Saudita" && x.category===(c.ovr>=80 && !c.forcado?"elite":"serieA")) || sortearClube(x=>x.league==="Arábia Saudita" && (!c.forcado || x.category!=="elite"));
       if(!alvo) return {texto:"A proposta desapareceu antes de ser formalizada."};
       mudarClube(alvo); player.mercadoDistante = 2; addRep(-2);
       player.value = Math.min(200, Math.round(player.value*1.1*100)/100); player.peakValue = Math.max(player.peakValue, player.value);
       return {texto:`Você assinou com o ${alvo.club.name} (${alvo.league}). O contrato é muito superior, mas a visibilidade nas ligas de elite diminui por algum tempo.`};
     }},
   { rotulo:"Permanecer no clube atual",
     pros:["Continuidade esportiva","Chance de disputar competições mais relevantes"],
     contras:["Perda da oportunidade financeira","A proposta pode não voltar"],
     aplicar:c => { addEf("forma",0.1); mulEf("titulo", c.tier===1?1.12:1.04); addRep(1); return {texto:"Você recusou o dinheiro e manteve o foco esportivo. A confiança na decisão ajudou o ambiente no vestiário."}; }}
  ]},
{ id:"sequencia", icone:"🔥", titulo:"A grande sequência de gols", peso:2, cooldown:3, max:3,
  cond:c => c.perf===0 && c.jogosUlt>=15 && (c.golsUlt>=15 || c.golsUlt/c.jogosUlt>=0.5),
  contexto:c => `Você marcou gols em várias partidas seguidas e vive o melhor momento da carreira no ${c.clube}. A imprensa não fala de outra coisa.`,
  opcoes:[
   { rotulo:"Manter a rotina e evitar riscos",
     pros:["Mais estabilidade","Preserva o bom rendimento"],
     contras:["Menor chance de um salto excepcional de desempenho"],
     aplicar:c => { addEf("forma",0.25); return {texto:"Você manteve a rotina e a cabeça no lugar. O rendimento tende a seguir estável."}; }},
   { rotulo:"Assumir mais responsabilidade ofensiva",
     pros:["Possibilidade de aumentar gols e assistências","Mais reconhecimento"],
     contras:["Maior risco de atuações frustrantes se a estratégia não funcionar"],
     aplicar:c => {
       if(Math.random()<0.55){ mulEf("golsMult",1.25); addRep(3); addEf("interesse",0.15); return {texto:"A aposta no protagonismo deu certo: você virou a referência ofensiva do time."}; }
       mulEf("golsMult",0.85); addEf("forma",-0.15); addRep(-1); return {texto:"A busca por mais protagonismo trouxe pressão extra e partidas frustrantes."};
     }}
  ]},
{ id:"lesao", icone:"🩹", titulo:"A lesão no momento decisivo", peso:1, cooldown:4, max:3,
  cond:c => c.idade>=19 && c.jogosUlt>=20,
  contexto:c => `Perto de uma partida importante pelo ${c.clube}, você sente um desconforto físico.`,
  opcoes:[
   { rotulo:"Comunicar o problema e preservar a recuperação",
     pros:["Reduz o risco de agravamento","Favorece a recuperação"],
     contras:["Pode perder jogos importantes e espaço no time"],
     aplicar:c => { mulEf("jogosMult",0.9); return {texto:"Você avisou a comissão médica e se poupou. Perdeu alguns jogos, mas voltou sem sequelas."}; }},
   { rotulo:"Tentar jogar mesmo assim",
     pros:["Chance de participar da partida e ajudar a equipe"],
     contras:["Risco de agravar o problema e ficar mais tempo fora"],
     aplicar:c => {
       if(Math.random()<0.5){ addRep(2); return {texto:"Você jogou no sacrifício e deu conta do recado. O grupo reconheceu o gesto."}; }
       mulEf("jogosMult",0.55); addEf("forma",-0.2); return {texto:"O problema se agravou e você ficará mais tempo fora do que o previsto."};
     }}
  ]},
{ id:"convocacao", icone:"📨", titulo:"A primeira convocação", peso:4, cooldown:99, max:1,
  cond:c => !player.selVisto && c.idade>=18 && c.ovrSelEf>=c.T-5,
  contexto:c => `Suas atuações chamaram a atenção da comissão técnica da seleção de ${player.nat}. Você está na lista de observados para as próximas convocações.`,
  opcoes:[
   { rotulo:"Priorizar a preparação para a seleção",
     pros:["Possibilidade de se destacar internacionalmente","Aumenta a reputação"],
     contras:["Desgaste físico","Risco de voltar ao clube em fase menos favorável"],
     aplicar:c => { addEf("selecao",0.25); addRep(3); addEf("forma",-0.1); return {texto:"Você se dedicou à preparação internacional. As chances de ser chamado aumentaram, mas o desgaste cobra seu preço."}; }},
   { rotulo:"Concentrar-se na temporada pelo clube",
     pros:["Mais foco nas competições atuais","Mais atenção na disputa por posição"],
     contras:["Menor aproveitamento do momento internacional"],
     aplicar:c => { addEf("minutos",0.06); addEf("selecao",-0.1); return {texto:"Você priorizou o clube. A convocação pode demorar um pouco mais, mas você chega mais inteiro ao seu time."}; }}
  ]},
{ id:"torcida", icone:"📣", titulo:"A pressão da torcida", peso:2, cooldown:3, max:3,
  cond:c => c.perf>=2 && (c.categoria==="elite" || c.categoria==="serieA") && c.rep>=45,
  contexto:c => `O ${c.clube} atravessa uma sequência ruim e a torcida começa a cobrar os principais jogadores, você entre eles.`,
  opcoes:[
   { rotulo:"Assumir publicamente a responsabilidade",
     pros:["Melhora a relação com a torcida se a equipe reagir","Pode aumentar a reputação"],
     contras:["Maior pressão individual se os resultados continuarem ruins"],
     aplicar:c => {
       if(Math.random()<0.5){ addRep(5); addEf("forma",0.15); return {texto:"A torcida reconheceu a postura e o time reagiu. Sua imagem saiu fortalecida."}; }
       addRep(-3); addEf("forma",-0.2); return {texto:"O discurso caiu bem, mas a equipe não reagiu e a cobrança sobre você aumentou."};
     }},
   { rotulo:"Evitar declarações e focar no campo",
     pros:["Reduz a exposição pública","Permite concentrar-se no desempenho"],
     contras:["Pode não melhorar a percepção da torcida e da imprensa"],
     aplicar:c => { addRep(-1); return {texto:"Você se manteve em silêncio e trabalhou nos treinos. A cobrança continua, mas sem novos desgastes públicos."}; }}
  ]},
{ id:"titularidade", icone:"⚔️", titulo:"A disputa pela titularidade", peso:2, cooldown:3, max:3,
  cond:c => c.idade>=19 && c.share>=0.55 && c.share<=0.95,
  contexto:c => `Um jogador de nível semelhante ao seu chegou ao ${c.clube} para disputar a mesma posição.`,
  opcoes:[
   { rotulo:"Aceitar a disputa e trabalhar para manter a vaga",
     pros:["Possibilidade de melhorar o desempenho","Consolidar a titularidade"],
     contras:["Risco de perder minutos se não se destacar"],
     aplicar:c => {
       if(Math.random()<0.55){ addEf("minutos",0.05); addEf("forma",0.15); return {texto:"A concorrência o fez evoluir: você manteve a camisa e saiu mais forte."}; }
       addEf("minutos",-0.25); return {texto:"O novo reforço levou a melhor na disputa e você perdeu parte dos minutos."};
     }},
   { rotulo:"Buscar um empréstimo ou transferência",
     pros:["Possibilidade de jogar com mais frequência em outro clube"],
     contras:["Mudança de ambiente e adaptação","Risco de propostas pouco atrativas"],
     aplicar:c => { player.ofertaTipo = "minutos"; return {texto:"Você avisou que quer mais minutos. Chegaram propostas de clubes onde teria mais espaço."}; }}
  ]},
{ id:"recomeco", icone:"🔄", titulo:"A temporada do recomeço", peso:3, cooldown:4, max:2,
  cond:c => c.idade>=22 && c.perf>=2 && c.penultPerf!==null && c.penultPerf>=2 && (c.perf===3 || c.penultPerf===3),
  contexto:c => `Depois de duas temporadas abaixo das expectativas, seu valor de mercado caiu e os clubes de elite perderam parte do interesse.`,
  opcoes:[
   { rotulo:"Aceitar um projeto em um mercado alternativo",
     pros:["Recuperar a confiança","Assumir protagonismo","Reconstruir a carreira"],
     contras:["Perda de visibilidade em certos mercados","Dificuldade para voltar à elite"],
     aplicar:c => {
       const alvo = sortearClube(x=>x.tier===2 && x.league!==player.league && (x.category==="serieA"||(x.category==="elite" && !c.forcado)));
       if(!alvo) return {texto:"Nenhum projeto interessante apareceu e você seguiu no clube."};
       mudarClube(alvo); addEf("minutos",0.25); addEf("forma",0.3); addRep(-2); player.mercadoDistante = 1;
       return {texto:`Você aceitou o desafio no ${alvo.club.name} (${alvo.league}). Mais minutos e confiança, mas fora do radar da elite por um tempo.`};
     }},
   { rotulo:"Permanecer no clube e lutar por recuperação",
     pros:["Continuidade","Chance de recuperar espaço","Evita transferência precipitada"],
     contras:["Risco de continuar em má fase","Pode perder mais oportunidades"],
     aplicar:c => {
       if(Math.random()<0.45){ addEf("forma",0.4); return {texto:"A persistência compensou: você reencontrou o bom futebol dentro do próprio clube."}; }
       addEf("forma",-0.1); addRep(-2); return {texto:"A recuperação não veio como esperado e a fase ruim persiste."};
     }}
  ]},
{ id:"final", icone:"🏟️", titulo:"A decisão antes da final", peso:2, cooldown:3, max:3,
  cond:c => (c.categoria==="elite" || c.categoria==="serieA") && c.perf<=1 && c.jogosUlt>=15,
  contexto:c => `O ${c.clube} está prestes a disputar uma final importante. Você é um dos principais jogadores, mas chega desgastado.`,
  opcoes:[
   { rotulo:"Priorizar a preparação física",
     pros:["Chega em melhores condições","Reduz o risco de queda de rendimento"],
     contras:["Menos tempo para a preparação específica"],
     aplicar:c => { mulEf("titulo",1.1); return {texto:"Você priorizou o corpo e chegou inteiro à reta final. Nada está garantido, mas as condições são boas."}; }},
   { rotulo:"Intensificar a preparação para a partida",
     pros:["Melhora a preparação específica","Aumenta as chances de uma atuação decisiva"],
     contras:["Risco de mais desgaste e rendimento abaixo do esperado"],
     aplicar:c => {
       if(Math.random()<0.55){ mulEf("titulo",1.3); return {texto:"A preparação intensiva deixou você afiado para o jogo decisivo."}; }
       mulEf("titulo",0.9); addEf("forma",-0.2); return {texto:"O excesso de treino cobrou seu preço e você chega cansado à decisão."};
     }}
  ]}
];

export function selecionarEvento(season){
  const ctx = ctxEvento(season), ev = player.eventos;
  const elegiveis = EVENTOS.filter(e => {
    if((ev.vezes[e.id]||0) >= e.max) return false;
    const u = ev.ultimo[e.id]; if(u!==undefined && season.year-u < e.cooldown) return false;
    return e.cond(ctx);
  });
  if(!elegiveis.length) return null;
  const obrig = elegiveis.find(e => e.obrigatorio);        // acontecimentos que sempre pedem uma decisão
  if(obrig) return {id:obrig.id, ano:season.year, idade:player.age, ctx, texto:obrig.contexto(ctx)};
  let p = elegiveis.some(e=>e.peso>=3) ? 0.8 : 0.4;          // não aparece em toda temporada
  if(ev.ultimoAno===season.year-1) p *= 0.5;                      // evita eventos em sequência
  if(Math.random() > p) return null;
  const e = sortearPonderado(elegiveis, x=>x.peso, 1)[0];
  return {id:e.id, ano:season.year, idade:player.age, ctx, texto:e.contexto(ctx)};
}
export function resolverEvento(idx){
  const pe = player.pendingEvent, e = EVENTOS.find(x=>x.id===pe.id), op = e.opcoes[idx];
  player.ofertaTipo = null; player.ofertasBloqueadas = false;
  const r = op.aplicar(pe.ctx);
  player.eventos.vezes[e.id] = (player.eventos.vezes[e.id]||0) + 1;
  player.eventos.ultimo[e.id] = pe.ano; player.eventos.ultimoAno = pe.ano;
  const reg = {ano:pe.ano, idade:pe.idade, id:e.id, icone:e.icone, titulo:e.titulo, escolha:op.rotulo, resultado:r.texto, desfecho:null};
  player.eventos.log.push(reg);
  player.pendingEvent = null;
  return reg;
}
