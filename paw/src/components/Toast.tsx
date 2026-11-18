import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, timing, typography } from '../theme/tokens';

/** Toast simples para feedbacks (ex.: “360° em breve”). */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMessage(null));
      }, timing.toastMs);
    },
    [opacity],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const node = message ? (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  ) : null;

  return { show, node };
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: spacing.xxl,
    backgroundColor: colors.toastBg,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  text: { ...typography.bodyMedium, color: colors.textOnColor },
});
