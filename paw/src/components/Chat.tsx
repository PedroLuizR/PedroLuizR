import { Activity, Paperclip, SendHorizontal, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ChatMessage } from '../data/mock';
import { colors, radii, shadows, sizes, spacing, typography } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

export function ChatBubble({ from, text }: { from: 'me' | 'them'; text: string }) {
  const out = from === 'me';
  return (
    <View style={[styles.bubble, out ? styles.outgoing : styles.incoming]}>
      <Text style={[typography.body, { color: out ? colors.textOnColor : colors.textPrimary }]}>{text}</Text>
    </View>
  );
}

function PetSummaryCard({ title, detail, caption }: { title: string; detail: string; caption: string }) {
  return (
    <View style={[styles.bubble, styles.summary]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryIcon}>
          <Activity size={sizes.iconSm} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.flex}>
          <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[typography.label, { color: colors.primary }]}>{detail}</Text>
        </View>
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{caption}</Text>
    </View>
  );
}

function AnalysisCard({ title, text, advice, cta, onCta }: { title: string; text: string; advice: string; cta: string; onCta?: () => void }) {
  return (
    <View style={[styles.bubble, styles.analysis]}>
      <View style={styles.analysisTitle}>
        <Sparkles size={sizes.iconSm} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text style={[typography.cardTitle, styles.flex, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{text}</Text>
      <Text style={[typography.caption, { color: colors.primary }]}>{advice}</Text>
      <PrimaryButton label={cta} icon="arrow" compact onPress={onCta} />
    </View>
  );
}

export function ChatMessageView({ message, onCta }: { message: ChatMessage; onCta?: () => void }) {
  switch (message.kind) {
    case 'text':
      return <ChatBubble from={message.from} text={message.text} />;
    case 'petSummary':
      return <PetSummaryCard {...message} />;
    case 'analysis':
      return <AnalysisCard {...message} onCta={onCta} />;
  }
}

function TypingIndicator() {
  return (
    <View style={[styles.bubble, styles.incoming]} accessibilityLabel="Typing">
      <Text style={[typography.caption, { color: colors.textMuted }]}>typing…</Text>
    </View>
  );
}

export function ChatInput({ placeholder, onSend, attach = false }: { placeholder: string; onSend: (t: string) => void; attach?: boolean }) {
  const [text, setText] = useState('');
  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };
  return (
    <View style={styles.inputBar}>
      {attach ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Attach file" style={styles.attach} hitSlop={spacing.xs}>
          <Paperclip size={sizes.icon} color={colors.textMuted} strokeWidth={sizes.iconStroke} />
        </Pressable>
      ) : null}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !attach && styles.inputNoAttach]}
        onSubmitEditing={submit}
        returnKeyType="send"
        accessibilityLabel={placeholder}
      />
      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={({ pressed }) => [styles.send, pressed && styles.pressed]}
      >
        <SendHorizontal size={sizes.iconSm + 2} color={colors.textOnColor} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

type ChatListProps = {
  header: ReactNode;
  messages: ChatMessage[];
  typing: boolean;
  onSend: (t: string) => void;
  placeholder: string;
  attach?: boolean;
  onCta?: () => void;
};

/** Lista de chat com auto-scroll e input protegido do teclado. */
export function ChatList({ header, messages, typing, onSend, placeholder, attach, onCta }: ChatListProps) {
  const list = useRef<FlatList<ChatMessage>>(null);
  useEffect(() => {
    const id = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [messages.length, typing]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={<>{header}</>}
        renderItem={({ item }) => <ChatMessageView message={item} onCta={onCta} />}
        ListFooterComponent={typing ? <TypingIndicator /> : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
      />
      <View style={styles.inputWrap}>
        <ChatInput placeholder={placeholder} onSend={onSend} attach={attach} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: spacing.screen, paddingBottom: spacing.lg, gap: spacing.md },
  bubble: { maxWidth: sizes.chatMaxWidth, borderRadius: radii.card, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.xs + spacing.xxs,
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
  },
  outgoing: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderTopRightRadius: spacing.xs + spacing.xxs },
  summary: { alignSelf: 'flex-end', backgroundColor: colors.surfaceLavender, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md - spacing.xxs },
  summaryIcon: {
    width: sizes.iconTile - spacing.sm,
    height: sizes.iconTile - spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysis: { alignSelf: 'flex-start', backgroundColor: colors.surfaceLavender, gap: spacing.md, maxWidth: '88%' },
  analysisTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputWrap: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm, paddingBottom: spacing.md, backgroundColor: colors.background },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: sizes.borderThin,
    borderColor: colors.border,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    minHeight: sizes.touch + spacing.sm,
    ...shadows.soft,
  },
  attach: { width: sizes.touch, height: sizes.touch, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, ...typography.body, color: colors.textPrimary, paddingVertical: spacing.sm },
  inputNoAttach: { paddingLeft: spacing.md },
  send: {
    width: sizes.sendButton,
    height: sizes.sendButton,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
