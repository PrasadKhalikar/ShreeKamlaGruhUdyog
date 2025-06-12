import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function AddProductScreen() {
  const { department } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

const handleSubmit = async () => {
  try {
    const response = await fetch(`${API_URL}/add_product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price,
        department,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add product");
    }

    const data = await response.json();
    alert(data.message); // feedback
    router.replace(`/departments/${department}/products`);
  } catch (error) {
    console.error("Error:", error);
    alert("Error adding product");
  }
};



  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Product</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter product name"
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{department?.toString()} Department</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingTop: 50,
      alignItems: 'center',
    },
    heading: {
      fontSize: 24,
      fontWeight: '400',
      color: '#000',
      marginBottom: 40,
    },
    label: {
      fontSize: 24,
      color: '#000',
      alignSelf: 'flex-start',
      marginLeft: 30,
      marginBottom: 5,
    },
    input: {
      width: 352,
      height: 65,
      borderColor: '#000',
      borderWidth: 1,
      borderRadius: 30,
      paddingHorizontal: 20,
      marginBottom: 30,
      fontSize: 18,
      backgroundColor: '#FFFFFF',
    },
    button: {
      width: 352,
      height: 65,
      backgroundColor: 'rgba(125, 231, 230, 0.93)',
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    buttonText: {
      fontSize: 24,
      color: '#000',
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 24,
      color: '#000',
    },
  });
  