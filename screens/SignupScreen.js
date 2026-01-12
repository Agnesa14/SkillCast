import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();

  const handleSignup = async () => {
    try {
      await signup(email, password);
      Alert.alert("Sukses", "Llogaria u krijua!");
    } catch (error) {
      Alert.alert("Gabim", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Krijo Llogari</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Fjalëkalimi (min 6 karaktere)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Regjistrohu" onPress={handleSignup} color="green" />

      <TouchableOpacity onPress={onSwitch} style={{marginTop: 20}}>
        <Text style={{color: 'blue'}}>Ke llogari? Hyr këtu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});