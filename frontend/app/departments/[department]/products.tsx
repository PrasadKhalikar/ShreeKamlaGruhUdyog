// app/departments/[department]/products.tsx

import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
  type Product = {
  id: number;
  name: string;
  price: number;
};
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function ProductsScreen() {
  const { department } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products/${department}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [department]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{department?.toString()} Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(
  `/departments/${department}/productDetails?id=${item.id}&name=${item.name}&price=${item.price}`
)}

          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(125, 231, 230, 0.93)',
    borderRadius: 20,
  },
  name: { fontSize: 18, fontWeight: '500' },
  price: { fontSize: 16, color: '#333' },
});
