import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function Shops() {
  const [shopName, setShopName] = useState("");

  const handleSubmit = async () => {
  try {
    const response = await fetch(`${API_URL}/shops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: shopName }),
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      setShopName(""); // Clear input
      router.push("/home");
    }
  } catch (error) {
    console.error(error);
    alert("Error adding shop");
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Add Shop</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter shop name"
              value={shopName}
              onChangeText={setShopName}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>

        </View>
      
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    header: {
      backgroundColor: "rgba(125, 231, 230, 0.93)",
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerText: {
      fontSize: 24,
      color: "#000",
      fontWeight: "500",
    },
    form: {
      flex: 1,
      paddingHorizontal: 30,
      paddingTop: 50,
    },
    label: {
      fontSize: 20,
      color: "#000",
      marginBottom: 10,
    },
    input: {
      height: 50,
      borderColor: "#000",
      borderWidth: 1,
      borderRadius: 30,
      paddingHorizontal: 20,
      marginBottom: 40,
      fontSize: 16,
      backgroundColor: "#fff",
    },
    button: {
      backgroundColor: "rgba(125, 231, 230, 0.93)",
      borderRadius: 30,
      paddingVertical: 15,
      alignItems: "center",
      alignSelf: "center",
      width: 200,
    },
    buttonText: {
      fontSize: 20,
      color: "#000",
      fontWeight: "500",
    },
    
  });
  