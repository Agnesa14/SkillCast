import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TextInput, Alert } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { addData, getUserData } from './services/database';

const MainApp = () => {
  const { user, logout } = useAuth();
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState([]); // Këtu ruajmë listën e të dhënave

  // Kjo ekzekutohet sa herë hapet aplikacioni
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const data = await getUserData(user.uid);
    setItems(data);
  };

  const handleAdd = async () => {
    if (inputText.trim() === "") return;
    
    const success = await addData(user.uid, inputText);
    if (success) {
      setInputText(""); // Pastro fushën
      loadData(); // Ringarko listën që të shohim të renë
    } else {
      Alert.alert("Gabim", "Nuk u ruajt.");
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Mirësevini, {user.email}</Text>
        
        {/* Fusha për të shkruar */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input}
            placeholder="Shkruaj diçka të re..."
            value={inputText}
            onChangeText={setInputText}
          />
          <Button title="Shto" onPress={handleAdd} />
        </View>

        {/* Lista e të dhënave */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>S'ka asnjë shënim akoma.</Text>}
        />

        <View style={{marginTop: 20}}>
           <Button title="Dil (Logout)" onPress={logout} color="red" />
        </View>
      </View>
    );
  }

  // Pjesa e Login/Signup mbetet e njëjtë
  const [isLoginMode, setIsLoginMode] = useState(true);
  return (
    <>
      {isLoginMode ? (
        <LoginScreen onSwitch={() => setIsLoginMode(false)} />
      ) : (
        <SignupScreen onSwitch={() => setIsLoginMode(true)} />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: 'white', borderColor: '#ddd', borderWidth: 1, padding: 10, marginRight: 10, borderRadius: 5 },
  card: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2 },
  cardText: { fontSize: 16 }
});