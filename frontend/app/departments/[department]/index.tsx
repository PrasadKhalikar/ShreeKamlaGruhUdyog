import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function DepartmentHome() {
  const router = useRouter();
  const { department } = useLocalSearchParams(); // dynamic route param

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/departments/${department}/products`)}
      >
        <Text style={styles.buttonText}>Products</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/departments/${department}/orders`)}
      >
        <Text style={styles.buttonText}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/departments/${department}/create-order`)}
      >
        <Text style={styles.buttonText}>Create Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/departments/${department}/add-product`)}
      >
        <Text style={styles.buttonText}>Add Product</Text>
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
    paddingTop: 80,
    alignItems: 'center',
  },
  button: {
    width: 350,
    height: 65,
    backgroundColor: 'rgba(125, 231, 230, 0.93)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  buttonText: {
    fontSize: 24,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 24,
    color: '#000',
  },
});
