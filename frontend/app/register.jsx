import React, { useState } from 'react' // importing the default export (naming it React) and one of the many named exports (useState) through destructuring
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import axios from 'axios'
import { useRouter, Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';

// if you want even MORE efficient coloring and themeing, use themed components

const registerScreen = () => {

    const [username, setUsername ] = useState('')
    const [email, setEmail ] = useState('')
    const [password, setPassword ] = useState('')
    const [confirmPassword, setConfirmPassword ] = useState('')
    const [errorMessage, setErrorMessage ] = useState('None')

    const router = useRouter()
    const handleRegister = async () => {
        try {
            const res = await axios.post('http://localhost:8000/api/users/signup', {
                name:username,
                email,
                password,
                confirmPassword
            })
            console.log(res)
            if (res.data.success == 1) {
                Alert.alert('Registration successful! Please Login with your credentials');
                console.log("Registration Successful!");
                router.push('/login')
            }
            else {
                Alert.alert('Login failed', 'No token returned');
            }

        }
        catch (err){
            setErrorMessage(err.response.data.message)
            Alert.alert('Registration failed with error: ', err.response?.data?.message || 'Something went wrong')
        }
    }

    return(
        <ThemedView style={styles.container}>
            <ThemedText style = {styles.header}>Register</ThemedText>
            <ThemedTextInput
                style={styles.input}
                placeholder="Username"
                autoCapitalize="none"
                onChangeText={setUsername}
                value={username}
            />
            <ThemedTextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
            />
            <ThemedTextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />
            <ThemedTextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                // Just like in my react-project, value only controls what's SHOWN, while onChange function changes state
            />
            <Text style = {styles.errorText}>Any Errors Here {errorMessage}</Text>
            <Button title = "Register" onPress = {handleRegister} />
            <Link href="/login" asChild>
                <Text className = 'underline text-blue-100'>Create an account</Text>
            </Link>
            
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems:'center', padding: 20 },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: {
      width: '70%',
      borderWidth: 0,
      padding: 10,
      marginBottom: 15,
      borderRadius: 5,},
    errorText:{
        color: 'red',
    }
})

export default registerScreen