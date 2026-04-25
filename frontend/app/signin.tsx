import * as React from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GradientBackground } from "./gradientBg";
import { GlassCard, GLASS_COLORS } from "@/components/glass-ui";
import { getUserPool } from "../lib/auth";

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");

    setLoading(false);
    router.replace("/home");
    try {
      const userPool = getUserPool();
      const userData = {
        Username: email.trim().toLowerCase(),
        Pool: userPool,
      };

      const cognitoUser = new CognitoUser(userData);
      const authenticationDetails = new AuthenticationDetails({
        Username: email.trim().toLowerCase(),
        Password: password,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          setLoading(false);
          router.replace("/home");
        },
        onFailure: (err) => {
          setLoading(false);
          setError(String(err?.message || "Sign in failed"));
        },
      });
    } catch (e: any) {
      setLoading(false);
      setError(String(e?.message || "Sign in failed"));
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GlassCard>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={GLASS_COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={GLASS_COLORS.textMuted}
                secureTextEntry
              />

              {!!error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={GLASS_COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/signUp")}>
                <Text style={styles.link}>Don't have an account? Sign Up</Text>
              </TouchableOpacity>
            </GlassCard>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: GLASS_COLORS.title,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: GLASS_COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: GLASS_COLORS.textMuted,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: GLASS_COLORS.textMuted,
    marginTop: 10,
  },
  input: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    color: GLASS_COLORS.textDark,
  },
  button: {
    marginTop: 20,
    height: 50,
    borderRadius: 14,
    backgroundColor: GLASS_COLORS.title,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: GLASS_COLORS.white,
    fontWeight: "700",
  },
  link: {
    marginTop: 14,
    textAlign: "center",
    color: GLASS_COLORS.title,
    fontWeight: "600",
  },
  error: {
    marginTop: 8,
    color: "#A63A2C",
    fontWeight: "600",
  },
});

