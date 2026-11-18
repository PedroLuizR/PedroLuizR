import { useCallback, useEffect, useRef, useState } from 'react';
import { aiChat, clinicChat, clinics, collar, pet, user, type ChatMessage } from '../data/mock';
import { sendMessage, type AiTurn } from '../services/ai';
import { timing } from '../theme/tokens';

export function useUser() {
  return user;
}

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Dados do pet com batimento "ao vivo" (varia entre 82 e 90). */
export function usePet() {
  const [heartRate, setHeartRate] = useState(pet.heartRate);
  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate(82 + Math.round(Math.random() * 8));
    }, timing.heartTickMs);
    return () => clearInterval(id);
  }, []);
  return { ...pet, heartRate };
}

export function useCollar() {
  return collar;
}

export function useClinics() {
  return clinics;
}

let idCounter = 0;
const newId = () => `m${Date.now()}_${idCounter++}`;

type ChatMode = 'clinic' | 'ai';

/** Estado de um chat com resposta mock após ~1,5 s. */
export function useChat(mode: ChatMode) {
  const initial = mode === 'clinic' ? clinicChat.messages : aiChat.messages;
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<ChatMessage[]>(initial);
  messagesRef.current = messages;
  const replyIdx = useRef(0);
  const alive = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const mine: ChatMessage = { id: newId(), kind: 'text', from: 'me', text: trimmed };
      const history = [...messagesRef.current, mine];
      messagesRef.current = history;
      setMessages(history);
      setTyping(true);
      const gen = generation.current;

      let reply: string;
      if (mode === 'ai') {
        const turns: AiTurn[] = history.map((m) => ({
          role: m.from === 'me' ? 'user' : 'assistant',
          content: m.kind === 'text' ? m.text : m.kind === 'analysis' ? `${m.title}. ${m.text}` : m.detail,
        }));
        reply = await sendMessage(turns);
      } else {
        await new Promise((r) => setTimeout(r, timing.replyDelayMs));
        reply = clinicChat.replies[replyIdx.current++ % clinicChat.replies.length];
      }
      if (!alive.current || gen !== generation.current) return;
      setTyping(false);
      setMessages((prev) => [...prev, { id: newId(), kind: 'text', from: 'them', text: reply }]);
    },
    [mode],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    setTyping(false);
    setMessages(mode === 'ai' ? [{ id: newId(), kind: 'text', from: 'them', text: aiChat.greeting }] : initial);
  }, [mode, initial]);

  return { messages, typing, send, reset };
}
