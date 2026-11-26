/* ===================== ESTADO DA INTERFACE ===================== */
// Tudo o que é só da tela (não do jogador) fica aqui, num objeto compartilhado entre os módulos de UI.
export const ui = {
  aba: "carreira",          // aba visível: carreira | liga | eventos | selecao
  ultimaDecisao: null,      // último evento resolvido (para mostrar o resultado)
  pendingOffers: [],        // propostas da janela atual
  torUI: null               // {t, fase, season} enquanto a tela de torneio está aberta
};
