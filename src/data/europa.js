/* ===================== UEFA CHAMPIONS LEAGUE ===================== */
// Vagas por país (fixas, inspiradas no coeficiente da UEFA) e ajuste de força: a força de um clube
// no arquivo de clubes é relativa ao próprio país; somando o ajuste, ela vira comparável entre ligas.
// Rússia não aparece: os clubes russos estão suspensos das competições da UEFA desde 2022.
export const UCL = {
  times: 36,
  vagas:  {"Inglaterra":4, "Espanha":4, "Itália":4, "Alemanha":4, "França":3, "Portugal":2, "Holanda":2,
           "Bélgica":2, "Turquia":2, "Escócia":1, "Romênia":1},
  ajuste: {"Inglaterra":1, "Espanha":2, "Itália":0, "Alemanha":0, "França":-2, "Portugal":-4, "Holanda":-4,
           "Bélgica":-7, "Turquia":-6, "Escócia":-9, "Romênia":-13}
};

// Clubes de países sem liga no jogo: completam as 36 vagas como adversários.
// [nome, força na escala europeia, país, arquivo do escudo (quando há no pacote)]
export const EXTRAS_UEFA = [
  ["Olympiacos", 74, "Grécia"], ["Shakhtar Donetsk", 73, "Ucrânia", "shakhtar"], ["Bodø/Glimt", 72, "Noruega", "bodo-glimt"],
  ["Red Bull Salzburg", 72, "Áustria"], ["AEK Atenas", 71, "Grécia", "aek-athens"], ["Slavia Praga", 71, "República Tcheca", "slavia-praha"],
  ["Copenhague", 71, "Dinamarca"], ["PAOK", 70, "Grécia"], ["Dinamo Zagreb", 70, "Croácia"], ["Estrela Vermelha", 70, "Sérvia"],
  ["Sparta Praga", 70, "República Tcheca"], ["Young Boys", 69, "Suíça"], ["Qarabağ", 68, "Azerbaijão"], ["LASK", 67, "Áustria", "lask"],
  ["Ferencváros", 67, "Hungria"], ["Viking", 66, "Noruega", "viking"], ["Slovan Bratislava", 66, "Eslováquia", "s-bratislava"],
  ["Sabah", 63, "Azerbaijão", "sabah"]
];
