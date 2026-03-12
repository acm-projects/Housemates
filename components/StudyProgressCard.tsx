import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { colors, shadows } from '@/constants/theme';

type StudyProgressCardProps = {
  progressPercent: number;
};

export function StudyProgressCard({ progressPercent }: StudyProgressCardProps) {
  const radius = 26;
  const strokeWidth = 6;
  const normalized = Math.max(0, Math.min(100, progressPercent));
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalized / 100);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="menu-book" size={30} color={colors.accent} />
      </View>
      <View style={styles.copyWrap}>
        <Text style={styles.title}>Daily Study</Text>
        <Text style={styles.subtitle}>30 Tasks</Text>
      </View>
      <View style={styles.progressWrap}>
        <Svg width={64} height={64}>
          <Circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#ead8cb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx="32"
            cy="32"
            r={radius}
            stroke={colors.accent}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </Svg>
        <View style={styles.percentCenter}>
          <Text style={styles.percent}>{normalized}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    ...shadows.soft,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#fbe0cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  copyWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#2f3039',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c6c7d',
    marginTop: 4,
    fontWeight: '600',
  },
  progressWrap: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    fontSize: 16,
    color: '#2f3039',
    fontWeight: '700',
  },
});
