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
// import { signUp, confirmSignUp } from "aws-amplify/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold } from "@expo-google-fonts/nunito";
import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognito, CLIENT_ID } from "./cognitoconfig";

type SignUpParams = {
  email: string;
  password: string;
  givenName: string;
};

type ConfirmSignUpParams = {
  email: string;
  code: string;
};

export async function signUp({ email, password, givenName }: SignUpParams) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "given_name", Value: givenName },
      { Name: "name", Value: givenName },
    ],
  });

  const response = await cognito.send(command);
  return response;
}

export async function confirmSignUp({ email, code }: ConfirmSignUpParams) {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });

  const response = await cognito.send(command);
  return response;
}

export default function SignUp() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const [step, setStep] = useState<"form" | "confirm">("form");

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
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

  async function handleSignUp() {
    try {
      setLoading(true);
      Keyboard.dismiss();

      await signUp({
        email: email.trim().toLowerCase(),
        password,
        givenName: firstName.trim(),
      });

      setStep("confirm");
    } catch (e: any) {
      Alert.alert("Sign Up Failed", String(e?.message ?? e ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    try {
      setLoading(true);
      Keyboard.dismiss();

      await confirmSignUp({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });

      const client = new CognitoIdentityProviderClient({
        region: "us-east-2",
      });

      const authCommand = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email.trim().toLowerCase(),
          PASSWORD: password,
        },
      });

      const authResponse = await client.send(authCommand);

      const accessToken = authResponse.AuthenticationResult?.AccessToken;
      if (accessToken) {
        const apiResponse = await fetch('https://66n4zaxjh4.execute-api.us-east-2.amazonaws.com', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!apiResponse.ok) {
          console.warn('API call failed after sign-up');
        } else {
          const data = await apiResponse.json();
          console.log('API response after sign-up:', data);
        }
      }

      router.replace("./home");
    } catch (e: any) {
      Alert.alert("Confirmation Failed", String(e?.message ?? e ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  if (!fontsLoaded) return null;

  const primaryAction = step === "form" ? handleSignUp : handleConfirm;
  const primaryText =
    step === "form"
      ? loading
        ? "Creating..."
        : "Sign Up"
      : loading
      ? "Confirming..."
      : "Confirm";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color="#54669F" />
        </Pressable>

        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Sign Up To Continue</Text>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {step === "form" ? (
                <>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <TextInput
                    style={styles.underlineInput}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder=" "
                    placeholderTextColor="transparent"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />

                  <Text style={[styles.fieldLabel, { marginTop: 28 }]}>Email</Text>
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
                    onSubmitEditing={handleSignUp}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.confirmTitle}>Confirmation Code</Text>
                  <Text style={styles.confirmHint}>Check Your Email For The Code.</Text>

                  <Text style={[styles.fieldLabel, { marginTop: 22 }]}>Code</Text>
                  <TextInput
                    style={styles.underlineInput}
                    value={code}
                    onChangeText={setCode}
                    placeholder=" "
                    placeholderTextColor="transparent"
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleConfirm}
                  />

                  <Pressable onPress={() => setStep("form")} style={{ marginTop: 18 }}>
                    <Text style={styles.link}>Go Back</Text>
                  </Pressable>
                </>
              )}

              <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 34, alignSelf: "center" }}>
                <Pressable
                  onPress={primaryAction}
                  onPressIn={buttonHandlers.pressIn}
                  onPressOut={buttonHandlers.pressOut}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.button,
                    pressed ? { opacity: 0.92 } : null,
                    loading ? { opacity: 0.7 } : null,
                  ]}
                >
                  <Text style={styles.buttonText}>{primaryText}</Text>
                </Pressable>
              </Animated.View>

              <Pressable onPress={() => router.replace("./signin")} style={{ marginTop: 18 }}>
                <Text style={styles.link}>Already Have An Account? Sign In</Text>
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
  page: { flex: 1, backgroundColor: "#EDF3FF", paddingTop: 70, paddingHorizontal: 22 },
  backButton: { position: "absolute", top: 52, left: 16, padding: 8, zIndex: 10 },
  title: { fontSize: 42, textAlign: "center", color: "#54669F", fontFamily: "Nunito_700Bold", marginTop: 10 },
  subtitle: { textAlign: "center", marginTop: 6, fontSize: 18, color: "#54669F", fontFamily: "Nunito_600SemiBold" },
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
  fieldLabel: { fontSize: 28, color: "#5A6FB0", fontFamily: "Nunito_700Bold" },
  underlineInput: {
    marginTop: 10,
    paddingVertical: 10,
    fontSize: 18,
    color: "#1B1B1B",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.38)",
    fontFamily: "Nunito_600SemiBold",
  },
  confirmTitle: { fontSize: 22, color: "#1B1B1B", fontFamily: "Nunito_700Bold" },
  confirmHint: { marginTop: 6, color: "#54669F", fontFamily: "Nunito_600SemiBold" },
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
  buttonText: { color: "#0E0E0E", fontSize: 22, fontFamily: "Nunito_700Bold" },
  link: { textAlign: "center", color: "#54669F", fontFamily: "Nunito_600SemiBold", fontSize: 14 },
  navWrap: { position: "absolute", left: 16, right: 16, bottom: 26 },
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
  navTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20, 53, 135, 0.14)" },
});
