import { Image } from 'expo-image';
import { Link, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IndexScreen() {
  // If you want to auto-redirect to the main home screen on launch, uncomment:
  // return <Redirect href="/home" />;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* ── App Screens ── */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">App</ThemedText>
        <Link href="/home" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Home</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/settings" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Settings</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
      </ThemedView>

      {/* ── Account ── */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Account</ThemedText>
        <Link href="/signUp" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Sign Up</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
      </ThemedView>

      {/* ── House ── */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">House</ThemedText>
        <Link href="/AddHouse" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Add a House</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/JoinHouse" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Join a House</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/QrCode" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Add a Housemate (QR Code)</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
      </ThemedView>

      {/* ── Tasks ── */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Tasks</ThemedText>
        <Link href="/AddTask" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Add Task</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/AddList" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Add List</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/ShoppingList" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Shopping List</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
      </ThemedView>

      {/* ── Money ── */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Money</ThemedText>
        <Link href="/expenses" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Expenses</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
        <Link href="/splitMoney" style={styles.navLink}>
          <ThemedText type="defaultSemiBold">Split Money</ThemedText>
          <ThemedText> →</ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionContainer: {
    gap: 8,
    marginBottom: 20,
  },
  navLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
