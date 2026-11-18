import { timing } from '../theme/tokens';

export type AiTurn = { role: 'user' | 'assistant'; content: string };

const MOCK_REPLIES = [
  'Thanks for sharing. Watch whether Bento eats, drinks water and plays as usual. If anything changes, a vet visit is the best next step.',
  'Got it. Write down when the signs show up and for how long — it really helps the vet during the visit.',
  'It makes sense to keep an eye on it. Bento\'s heart rate is stable on the collar, but only an exam can confirm the cause.',
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
