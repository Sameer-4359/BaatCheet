import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from './_context/auth'; // again, will change after login persistence, only to move to auth first if not logged in
import { useRouter, Link } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const { setIsAuthenticated } = useAuth(); // remove later, uses useContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const handleLogin = async () => {
    try {
      console.log("Logging in");
      const res = await axios.post('http://192.168.1.104:8000/api/users/login', {
        email,
        password,
      });

      if (res.data.token) {
        Alert.alert('Login successful! Moving to Main Page');
        console.log("Login Successful!");
        setIsAuthenticated(true); // remove later
        router.replace('/'); // set to .push later if needed
      } else {
        Alert.alert('Login failed', 'No token returned');
      }
    } catch (err) {
      console.error(err);
      // more detailed error
      // console.log("Full Axios Error Object:", JSON.stringify(err, null, 2)); // 👈 Logs everything
      // console.log("Error Config:", err.config); // Check the URL, headers, etc.
      // if (err.response) {
      //   console.log("Backend Response:", err.response.data);
      // } else if (err.request) {
      //   console.log("No Response Received:", err.request._url); // 👈 Did the request even go out?
      // } else {
      //   console.log("Unknown Error:", err.message);
      // }
      Alert.alert('Login error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.header, { color: textColor }]}>Login</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            color: textColor,
            backgroundColor: cardColor,
            borderColor 
          }
        ]}
        placeholder="Email"
        placeholderTextColor={Colors.light.icon} // Use icon color for placeholder
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={[
          styles.input, 
          { 
            color: textColor,
            backgroundColor: cardColor,
            borderColor 
          }
        ]}
        placeholder="Password"
        placeholderTextColor={Colors.light.icon}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button 
        className='rounded-xl'
        title="Login" 
        onPress={handleLogin}
        color={primaryColor} // Use primary color for button
      />
      <Link href="/register" asChild>
        <Text className = 'underline text-blue-600'>Create an account</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    alignItems: 'center'
  },
  header: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center',
    fontWeight: 'bold'
  },
  input: {
    width: '70%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
});
