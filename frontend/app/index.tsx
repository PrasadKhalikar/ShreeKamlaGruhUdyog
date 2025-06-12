import React, { useState } from "react";
import {Image,Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform,} from "react-native";
const skgu = require("../assets/images/skgu.jpg");


import { useRouter } from "expo-router";

const router = useRouter();
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* Dismiss keyboard when tapping outside 
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>*/}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Image source={skgu} style={styles.logo} resizeMode="cover" />
              <Text style={styles.title}>Shree Kamla Gruh Udyog</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setemail}
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setpassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.loginButton}
                onPress={async () => {
                try {
                  const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      email: email,
                      password: password
                    })
                  });

                  const data = await response.json();

                  if (response.ok && data.status === 'ok') {
                    Alert.alert("Success", "Login successful");
                    router.replace('/home'); // navigate to home only if login succeeds
                  } else {
                    Alert.alert("Error", data.message || "Invalid credentials");
                  }
                } catch (error) {
                  console.error(error);
                  Alert.alert("Error", "Failed to connect to server");
                }
              }}

              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      {/*</TouchableWithoutFeedback>*/}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  logo: {
    width: "100%",
    height: 200,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "400",
    color: "#000",
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    //paddingBottom: 60, // Give some room at the bottom
  },
  label: {
    fontSize: 20,
    color: "#000",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  loginButton: {
    marginTop: 40,
    backgroundColor: "rgba(125, 231, 230, 0.93)",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
});
