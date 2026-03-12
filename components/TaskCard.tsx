import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '@/constants/theme';

type TaskCardProps = {
  items: Array<
    | {
        id: string;
        label: string;
        done: boolean;
      }
    | string
  >;
  onToggle?: (id: string) => void;
};

export function TaskCard({ items, onToggle }: TaskCardProps) {
  const normalizedItems = items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `legacy-${index}-${item}`,
        label: item,
        done: false,
      };
    }

    return item;
  });

  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={['#9db0e6', '#90a4dc', '#a8b8ea']}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.inner}
      >
        {normalizedItems.map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={() => onToggle?.(item.id)}>
            <Text style={[styles.bullet, item.done && styles.bulletDone]}>{item.done ? '●' : '○'}</Text>
            <Text style={[styles.text, item.done && styles.textDone]}>{item.label}</Text>
          </Pressable>
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 4,
    borderColor: colors.taskBorder,
    borderRadius: 34,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 18,
    ...shadows.soft,
  },
  inner: {
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 20,
    gap: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    fontSize: 20,
    lineHeight: 24,
    marginRight: 8,
    color: '#3f2e2e',
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    color: '#3f2e2e',
    fontWeight: '500',
  },
  bulletDone: {
    color: '#1f5c2f',
  },
  textDone: {
    color: '#2f4c39',
    textDecorationLine: 'line-through',
  },
});
