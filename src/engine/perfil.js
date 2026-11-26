import { player } from './jogador.js';

/* ===================== PERFIL DA CARREIRA (Parte 1 e Parte 11) ===================== */
// Classifica a trajetória final num dos padrões da base histórica de referência. Os nomes servem
// só como comparação de TRAJETÓRIA (nunca de estatísticas): "uma carreira que lembra a de…".

export const PERFIS = {
  excepcional: {titulo:"Carreira excepcional", grupo:"A",
    texto:"Chegou ao mais alto nível e se manteve lá por várias temporadas — algo raro.",
    refs:["Lionel Messi","Cristiano Ronaldo","Luka Modrić","Robert Lewandowski","Kevin De Bruyne","Sergio Ramos","Andrés Iniesta","Mohamed Salah"]},
  auge_curto: {titulo:"Auge brilhante, mas curto", grupo:"A",
    texto:"Atingiu o topo cedo e não conseguiu sustentar o nível por muito tempo.",
    refs:["Ronaldinho Gaúcho","Kaká","Neymar","Fernando Torres"]},
  tardia: {titulo:"Ascensão tardia", grupo:"B",
    texto:"Começou longe dos holofotes e viveu as melhores temporadas depois dos 27 anos.",
    refs:["Jamie Vardy","Didier Drogba","N'Golo Kanté","Riyad Mahrez","Luca Toni","Antonio Di Natale","Emiliano Martínez"]},
  consistente: {titulo:"Carreira consistente", grupo:"C",
    texto:"Bom nível por muitos anos, sem depender de saltos ou de um único momento.",
    refs:["Marek Hamšík","Lucas Leiva","Dirk Kuyt","Ivan Rakitić","Edinson Cavani","Olivier Giroud","James Milner","Gareth Barry"]},
  nao_alcancado: {titulo:"Potencial não alcançado", grupo:"D",
    texto:"Havia expectativa de muito mais; lesões, falta de espaço ou oscilações mudaram o rumo.",
    refs:["Dele Alli","Alexandre Pato","Bojan Krkić","Jack Wilshere","Giuseppe Rossi","Freddy Adu"]},
  interrompida: {titulo:"Carreira marcada por lesões", grupo:"D",
    texto:"A qualidade apareceu, mas a disponibilidade física impediu uma sequência longa.",
    refs:["Abou Diaby","Jack Wilshere","Giuseppe Rossi","Santi Cazorla"]},
  jornada: {titulo:"Jornada longa", grupo:"E",
    texto:"Passou por vários clubes e países, adaptando-se a contextos diferentes.",
    refs:["Zlatan Ibrahimović","Carlos Tévez","Pepe","Wayne Rooney","Edin Džeko","Ángel Di María"]},
  modesta: {titulo:"Carreira de trabalho", grupo:"—",
    texto:"Uma carreira profissional honesta, longe dos holofotes — como a da maioria dos jogadores.",
    refs:[]}
};

export function perfilDaCarreira(){
  const h = player.history;
  if(!h.length) return {...PERFIS.modesta, id:"modesta"};
  const pico = player.peakOvr;
  const idadePico = h.reduce((b,s) => s.ovr>b.ovr ? s : b, h[0]).age + 1;
  const o23 = (h.find(s => s.age===23) || h[0]).ovr;
  const anosAltos = h.filter(s => s.ovr >= Math.max(84, pico-3)).length;
  const graves = player.lesoes.filter(l => l.tipo==="grave").length;
  const paises = new Set(h.map(s => s.league)).size, clubes = new Set(h.map(s => s.clubRef.name)).size;
  let id = "modesta";
  if(pico>=89 && anosAltos>=5) id = "excepcional";
  else if(pico>=86 && anosAltos<=3 && idadePico<=27) id = "auge_curto";
  else if(pico>=86 && anosAltos>=4) id = "excepcional";
  else if(idadePico>=28 && pico-o23>=7 && pico>=78) id = "tardia";
  else if(graves>=2 && pico < player.potencialInicial) id = "interrompida";
  else if(player.potencialInicial - pico >= 6) id = "nao_alcancado";
  else if((clubes>=7 || paises>=3) && player.age>=34) id = "jornada";
  else if(pico>=76 && h.filter(s => s.nota>=60).length >= h.length*0.5) id = "consistente";
  const p = PERFIS[id];
  // duas referências, sorteadas sem repetir
  // comparação só quando o nível também é parecido (uma jornada longa de OVR 67 não lembra a de Tévez)
  const minRef = {excepcional:0, auge_curto:0, tardia:80, consistente:79, nao_alcancado:0, interrompida:0, jornada:80, modesta:99}[id];
  const refs = pico >= minRef ? p.refs.slice().sort(() => Math.random()-0.5).slice(0,2) : [];
  return {...p, id, refs, idadePico};
}
