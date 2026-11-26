import { SELECOES } from '../data/selecoes.js';
import { COMPETICOES, anoDaEdicao, rotuloEdicao } from './competicoes.js';
import { player } from './jogador.js';
import { arred, clamp, embaralhar, poisson, sigmoid } from './util.js';

/* ===================== CONVOCAÇÃO ===================== */
export const limiarSelecao = nat => 40 + (SELECOES[nat] ? SELECOES[nat].r : 65)*0.45;      // OVR para ~50% de chance
// "OVR efetivo" para a comissão técnica: qualidade + momento (nota) + nível do clube/competição + histórico.
// OVR alto não garante convocação; jogador de clube menor pode ser chamado se estiver muito bem.
export function ovrEfetivoSel(ovr, perf, age, ctx){
  let e = ovr - (age<19 ? 3 : 0) - (age>33 ? (age-33) : 0);
  if(ctx && ctx.nota != null){
    e += (ctx.nota-60)*0.16 + clamp((ctx.nivel-66)*0.06, -1.5, 1.2);
    e += Math.min(2, player.convocacoes*0.4);                 // quem já é do grupo tem alguma vantagem
    e += (Math.random()-0.5)*3;                               // concorrência na posição muda a cada ciclo
  } else e += [2,0.5,0,-3][perf];
  return e;
}
export const probConvocacao = (ovrEf,T,ef) => clamp(sigmoid((ovrEf-T)/3.5) + (ef.selecao||0), 0.02, 0.97);

// Partidas regulares da seleção (amistosos e partidas oficiais fora dos torneios finais) — categoria separada.
export function simularSelecaoRegular(perf, isAtt, ovr, age, ef, ctx){
  const r = {games:0,goals:0,assists:0,convocado:false};
  if(age<18 || age>38) return r;
  const T = limiarSelecao(player.nat);
  const p = probConvocacao(ovrEfetivoSel(ovr,perf,age,ctx), T-1, ef) * (age>34 ? 0.5 : 1);
  if(Math.random() >= p) return r;
  r.convocado = true; player.selVisto = true;
  const jogos = 3 + Math.floor(Math.random()*6), f = [1.3,1,0.6,0.3][perf];
  r.games = jogos;
  r.goals = arred(jogos*(ovr/100)*(isAtt?0.3:0.05)*f);
  r.assists = arred(jogos*(ovr/100)*0.15*f);
  return r;
}

/* ===================== MOTOR DE PARTIDAS ===================== */
export const PESO_GOL = {ATA:.30,PE:.20,PD:.20,MEI:.16,ME:.10,MD:.10,MC:.08,VOL:.05,LE:.04,LD:.04,ZAG:.05,GOL:0};
export const PESO_AST = {ATA:.12,PE:.20,PD:.20,MEI:.24,ME:.18,MD:.18,MC:.14,VOL:.07,LE:.12,LD:.12,ZAG:.03,GOL:.01};

export function simPartida(Ra, Rb, mata){
  const la = 1.25*Math.pow(10,(Ra-Rb)/90), lb = 1.25*Math.pow(10,(Rb-Ra)/90);
  const m = {ga:poisson(la), gb:poisson(lb), pen:null, venc:null};
  if(mata){
    if(m.ga===m.gb){
      const pa = 1/(1+Math.pow(10,-(Ra-Rb)/60));
      if(Math.random()<0.35){ if(Math.random()<pa) m.ga++; else m.gb++; m.prorrog = true; }
      else {
        const aVence = Math.random() < 0.5+(pa-0.5)*0.4, w = 4+Math.floor(Math.random()*3), l = w-1-(Math.random()<0.3?1:0);
        m.pen = aVence ? {a:w,b:l} : {a:l,b:w};
      }
    }
    m.venc = m.ga>m.gb ? "a" : m.gb>m.ga ? "b" : (m.pen.a>m.pen.b ? "a" : "b");
  }
  return m;
}
// Gols e assistências do jogador numa partida da sua seleção (só se ele jogou).
export function jogadorNaPartida(m, minha, jog, acc){
  if(m.a!==minha && m.b!==minha) return;
  const golsTime = m.a===minha ? m.ga : m.gb;
  const jogou = Math.random() < jog.pJogar;
  let gols = 0, ast = 0;
  if(jogou) for(let i=0;i<golsTime;i++){ const x = Math.random(); if(x<jog.pGol) gols++; else if(x<jog.pGol+jog.pAst) ast++; }
  m.jog = {jogou, gols, ast};
  if(jogou){ acc.jogos++; acc.gols += gols; acc.ast += ast; }
}
export function ordemBracket(n){ let a=[1,2]; while(a.length<n){ const t=a.length*2+1; a = a.flatMap(x=>[x,t-x]); } return a; }
export const nomeRodadaKO = n => n===32?"16-avos de final" : n===16?"Oitavas de final" : n===8?"Quartas de final" : n===4?"Semifinais" : n===2?"Final" : `Rodada de ${n}`;
export const codRodadaKO = n => n===32?"r32" : n===16?"oitavas" : n===8?"quartas" : n===4?"semi" : "final";
export const ROTULO_FASE = {grupos:"Eliminada na fase de grupos", r32:"Eliminada nas 16-avos de final", oitavas:"Eliminada nas oitavas de final",
  quartas:"Eliminada nas quartas de final", semi:"Eliminada na semifinal", final:"Vice-campeã", campeao:"Campeã"};
export const PONTOS_FASE = {grupos:0, r32:0.5, oitavas:1, quartas:2, semi:3, final:4, campeao:6};

export function ordenarTabela(arr){
  return arr.sort((x,y)=> y.pts-x.pts || y.sg-x.sg || y.gp-x.gp || (Math.random()<0.5?-1:1));
}

export function simularTorneio(comp, ano, jog){
  const minha = player.nat;
  const nomes = comp.participantes(minha);
  const rate = n => SELECOES[n].r - (comp.sub23?6:0) + (n===minha ? jog.bonusTime : 0);
  const G = comp.formato.grupos, tam = nomes.length/G;
  const ordenados = nomes.slice().sort((a,b)=>rate(b)-rate(a));
  const potes = []; for(let i=0;i<tam;i++) potes.push(embaralhar(ordenados.slice(i*G,(i+1)*G)));
  const acc = {jogos:0, gols:0, ast:0};
  const grupos = Array.from({length:G}, (_,g) => ({nome:String.fromCharCode(65+g), times:potes.map(p=>p[g]), partidas:[], tabela:[]}));
  const rodadas = [[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]];

  grupos.forEach(g => {
    const tab = {}; g.times.forEach(t => tab[t] = {nome:t,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0});
    rodadas.forEach((pares,ri) => pares.forEach(([i,k]) => {
      const a = g.times[i], b = g.times[k];
      const m = simPartida(rate(a), rate(b), false); m.a=a; m.b=b; m.rodada=ri+1;
      jogadorNaPartida(m, minha, jog, acc);
      g.partidas.push(m);
      [[a,m.ga,m.gb],[b,m.gb,m.ga]].forEach(([t,gp,gc]) => {
        const r = tab[t]; r.j++; r.gp+=gp; r.gc+=gc; r.sg=r.gp-r.gc;
        if(gp>gc){ r.v++; r.pts+=3; } else if(gp===gc){ r.e++; r.pts+=1; } else r.d++;
      });
    }));
    g.tabela = ordenarTabela(Object.values(tab));
    g.tabela.forEach((t,i) => t.pos = i+1);
  });

  // Classificados: líderes/vices (+ melhores terceiros, quando o formato prevê)
  const {classif, terceiros} = comp.formato;
  let avanc = grupos.flatMap(g => g.tabela.slice(0,classif));
  if(terceiros>0){
    const ter = ordenarTabela(grupos.map(g => g.tabela[classif])).slice(0,terceiros);
    avanc = avanc.concat(ter);
  }
  avanc.forEach(t => t.classificado = true);
  const seeds = avanc.slice().sort((x,y)=> x.pos-y.pos || y.pts-x.pts || y.sg-x.sg || y.gp-x.gp || (Math.random()<0.5?-1:1)).map(t=>t.nome);

  // Mata-mata (chaveamento por cabeças de chave)
  let atual = ordemBracket(seeds.length).map(s => seeds[s-1]);
  const mata = []; let faseCod = "grupos";
  if(!avanc.some(t=>t.nome===minha)) faseCod = "grupos";
  else faseCod = "r32";                     // provisório — refinado abaixo
  let eliminadaEm = null;
  while(atual.length>1){
    const partidas = [], prox = [];
    for(let i=0;i<atual.length;i+=2){
      const a = atual[i], b = atual[i+1];
      const m = simPartida(rate(a), rate(b), true); m.a=a; m.b=b;
      jogadorNaPartida(m, minha, jog, acc);
      partidas.push(m); prox.push(m.venc==="a" ? a : b);
      if((a===minha||b===minha) && (m.venc==="a" ? a : b)!==minha) eliminadaEm = codRodadaKO(atual.length);
    }
    mata.push({nome:nomeRodadaKO(atual.length), partidas});
    atual = prox;
  }
  const campeao = atual[0];
  const final = mata[mata.length-1].partidas[0];
  const vice = final.venc==="a" ? final.b : final.a;
  const noMata = avanc.some(t=>t.nome===minha);
  let fase = !noMata ? "grupos" : (campeao===minha ? "campeao" : eliminadaEm);
  const titulo = campeao===minha;
  return {grupos, mata, campeao, vice, fase, faseRotulo:ROTULO_FASE[fase], titulo, jogador:acc, meuGrupo:grupos.findIndex(g=>g.times.includes(minha))};
}

// Consequências internacionais (item 3.6): reputação, valor e interesse sobem com bom torneio; nunca derrubam o OVR.
export function consequenciasTorneio(t, tipo){
  const fs = PONTOS_FASE[t.fase];
  const peso = {mundo:1.3, continental:0.9, olimpico:0.7}[tipo];
  const jogou = t.jogador.jogos>0;
  const ind = t.jogador.gols*0.6 + t.jogador.ast*0.35;
  return {
    rep: jogou ? Math.round((1 + fs*1.1 + Math.min(4,ind))*peso) : Math.round(fs*0.5*peso),
    mult: jogou ? 1 + Math.min(0.4, ind*0.05 + fs*0.025 + (t.titulo?0.1:0)) : 1,
    interesse: jogou ? Math.min(0.5, (fs*0.05 + ind*0.04)*peso) : 0,
    bonusOvr: (jogou && (ind>=3.5 || (t.titulo && ind>=2)) && Math.random()<0.4) ? 1 : 0,
    forma: jogou ? clamp((fs/6)*0.25 + Math.min(0.15, ind*0.03), 0, 0.4) : 0
  };
}

// Percorre o calendário do ano: classificação -> convocação -> torneio simulado.
export function simularTorneiosDoAno(perf, ovr, age, ef, ano, ctx){
  const lista = [], conf = SELECOES[player.nat] ? SELECOES[player.nat].c : null;
  if(!conf) return lista;
  const r = SELECOES[player.nat].r;
  COMPETICOES.forEach(comp => {
    if(!anoDaEdicao(comp, ano)) return;
    const pc = comp.pClassif(player.nat, conf, r);
    if(pc<=0) return;                                     // competição não se aplica a esta nacionalidade
    const base = {comp:comp.id, nome:comp.nome, abrev:comp.abrev, tipo:comp.tipo, ano, rotulo:rotuloEdicao(comp,ano), nat:player.nat};
    // Olimpíadas: sub-23 + até 3 atletas acima da idade
    let sub = 0;
    if(comp.sub23){
      if(age>23){ if(!(ovr>=limiarSelecao(player.nat)+3 && Math.random()<0.2)) return; }
      sub = 6;
    }
    if(Math.random() >= pc){
      // Convidado que não foi chamado não "deixou de se classificar": só registramos a ausência de quem é membro.
      if(!comp.confs || comp.confs.includes(conf)) lista.push({...base, status:"nao_classificada"});
      return;
    }        // eliminatórias: abstraídas (sem estatísticas)
    const T = limiarSelecao(player.nat) - sub;
    const p = probConvocacao(ovrEfetivoSel(ovr,perf,age,ctx), T, ef);
    if(Math.random() >= p){ lista.push({...base, status:"nao_convocado"}); return; }
    player.selVisto = true;
    const forma = [1.25,1.05,0.9,0.7][perf];
    const jog = {
      bonusTime: clamp((ovr-80)*0.12, -1.5, 2.5),
      pJogar: clamp(0.55 + (ovr-T)/18, 0.3, 0.95),
      pGol: PESO_GOL[player.pos]*clamp(0.5+(ovr-65)/30, 0.5, 1.6)*forma,
      pAst: PESO_AST[player.pos]*clamp(0.5+(ovr-65)/30, 0.5, 1.6)*forma
    };
    const t = simularTorneio(comp, ano, jog);
    const entry = {...base, ...t, status:"jogou", convocado:true};
    entry.conseq = consequenciasTorneio(entry, comp.tipo);
    lista.push(entry);
  });
  return lista;
}
