import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

const CLIENT_ID = "22fiai4ujv7oi54lk6o6btq4vu";
const cognito = new CognitoIdentityProviderClient({ region: "us-east-2" });

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    try {
      await cognito.send(command);
      alert("Account verified! You can now log in.");
      router.replace('/home'); 
    } catch (error: any) {
      alert(error.message || "Invalid verification code");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Confirm Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#FDFDFF' },
  title: { fontSize: 24, fontWeight: '800', color: '#0A2239', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#98AAC5', marginBottom: 30 },
  input: { backgroundColor: '#F2F5FA', padding: 15, borderRadius: 12, fontSize: 18, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#0A2239', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});