// app/home.tsx

import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
const skgu = require("../assets/images/skgu.jpg");


export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    Alert.alert("Logged out", "You have been logged out.");
    router.replace('/');  // Go back to login page
  };

  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🔒</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Image source={skgu} style={styles.logo} resizeMode="cover" />
        <Text style={styles.title}>Shree Kamla Gruh Udyog</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/shops')}>
        <Text style={styles.buttonText}>Shops</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/department')}>
        <Text style={styles.buttonText}>Departments</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(125, 231, 230, 0.93)',
    borderRadius: 20,
    width: 40,
    height: 40,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 80,
  },
  logo: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    width: 300,
    paddingVertical: 15,
    backgroundColor: 'rgba(125, 231, 230, 0.93)',
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 20,
    color: '#000',
  },
});
