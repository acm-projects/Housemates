import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function HomeHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.avatarIconWrap}>
        <Feather name="user" size={24} color="#ffffff" />
      </View>
      <Text style={styles.welcome}>Welcome Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 2,
  },
  avatarIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f97dd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcome: {
    color: colors.title,
    fontFamily: 'Georgia',
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
