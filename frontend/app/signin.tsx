import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { router, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

export default function SignIn() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const buttonHandlers = useMemo(() => {
    const pressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    };

    const pressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    };

    return { pressIn, pressOut };
  }, [scaleAnim]);

  async function handleSignIn() {
    try {
      setLoading(true);
      Keyboard.dismiss();

      const client = new CognitoIdentityProviderClient({
        region: "us-east-2",
      });

      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: "22fiai4ujv7oi54lk6o6btq4vu",
        AuthParameters: {
          USERNAME: email.trim().toLowerCase(),
          PASSWORD: password,
        },
      });

      const response = await client.send(command);

      const accessToken = response.AuthenticationResult?.AccessToken;
      if (accessToken) {
        const apiResponse = await fetch('https://66n4zaxjh4.execute-api.us-east-2.amazonaws.com', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!apiResponse.ok) {
          throw new Error('API call failed');
        }
        const data = await apiResponse.json();
        console.log('API response:', data);
      }

      router.replace("./home");
    } catch (e: any) {
      Alert.alert("Sign In Failed", String(e?.message ?? e ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  if (!fontsLoaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#54669F" />
        </Pressable>

        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Sign In To Continue</Text>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.underlineInput}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder=" "
                placeholderTextColor="transparent"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.fieldLabel, { marginTop: 28 }]}>Password</Text>
              <TextInput
                style={styles.underlineInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder=" "
                placeholderTextColor="transparent"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />

              <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 34, alignSelf: "center" }}>
                <Pressable
                  onPress={handleSignIn}
                  onPressIn={buttonHandlers.pressIn}
                  onPressOut={buttonHandlers.pressOut}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.button,
                    pressed ? { opacity: 0.92 } : null,
                    loading ? { opacity: 0.7 } : null,
                  ]}
                >
                  <Text style={styles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
                </Pressable>
              </Animated.View>

              <Pressable onPress={() => router.push("./signup")} style={{ marginTop: 18 }}>
                <Text style={styles.link}>Do Not Have An Account? Sign Up</Text>
              </Pressable>
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <BottomNav />
      </View>
    </TouchableWithoutFeedback>
  );
}

function BottomNav() {
  const pathname = usePathname();

  const go = (path: string) => {
    if (pathname === path) return;
    router.navigate(path as any);
  };

  return (
    <View style={styles.navWrap}>
      <BlurView intensity={55} tint="light" style={styles.navBar}>
        <View pointerEvents="none" style={styles.navTint} />

        <Pressable style={styles.navIconButton} onPress={() => go("/tasks")} hitSlop={12}>
          <Ionicons name="list-outline" size={22} color="#0E0E0E" />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go("/shopping")} hitSlop={12}>
          <Ionicons name="bag-outline" size={22} color="#0E0E0E" />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go("/home")} hitSlop={12}>
          <Ionicons name="home-outline" size={24} color="#0E0E0E" />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go("/calendar")} hitSlop={12}>
          <Ionicons name="calendar-outline" size={22} color="#0E0E0E" />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go("/expenses")} hitSlop={12}>
          <Ionicons name="card-outline" size={22} color="#0E0E0E" />
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#EDF3FF",
    paddingTop: 70,
    paddingHorizontal: 22,
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 42,
    textAlign: "center",
    color: "#54669F",
    fontFamily: "Nunito_700Bold",
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 18,
    color: "#54669F",
    fontFamily: "Nunito_600SemiBold",
  },
  scrollContent: { paddingTop: 44 },
  card: {
    backgroundColor: "#C9D6FF",
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: "rgba(84, 102, 159, 0.10)",
    shadowColor: "#0A1A4A",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  fieldLabel: {
    fontSize: 28,
    color: "#5A6FB0",
    fontFamily: "Nunito_700Bold",
  },
  underlineInput: {
    marginTop: 10,
    paddingVertical: 10,
    fontSize: 18,
    color: "#1B1B1B",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.38)",
    fontFamily: "Nunito_600SemiBold",
  },
  button: {
    backgroundColor: "#4C5A87",
    paddingVertical: 16,
    paddingHorizontal: 52,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonText: {
    color: "#0E0E0E",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },
  link: {
    textAlign: "center",
    color: "#54669F",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
  },
  navWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 26,
  },
  navBar: {
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 18,
  },
  navIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  navTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 53, 135, 0.14)",
  },
});
