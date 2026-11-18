import { timing } from '../theme/tokens';

export type AiTurn = { role: 'user' | 'assistant'; content: string };

const MOCK_REPLIES = [
  'Obrigada por contar. Observe se o Bento come, bebe água e brinca normalmente. Se algo mudar, a avaliação veterinária é o melhor caminho.',
  'Entendi. Anote quando os sinais aparecem e por quanto tempo — isso ajuda muito a veterinária na consulta.',
  'Faz sentido ficar atenta. Os batimentos do Bento estão estáveis pela coleira, mas só um exame confirma a causa.',
];

/**
 * Envia o histórico para o assistente e devolve a resposta.
 * Fase atual: mock. Para plugar uma API real, substitua o corpo desta função
 * mantendo a assinatura.
 */
export async function sendMessage(history: AiTurn[]): Promise<string> {
  const userTurns = history.filter((h) => h.role === 'user').length;
  await new Promise((resolve) => setTimeout(resolve, timing.replyDelayMs));
  return MOCK_REPLIES[userTurns % MOCK_REPLIES.length];
}
