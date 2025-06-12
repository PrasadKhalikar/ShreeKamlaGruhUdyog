import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import React from 'react';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function ProductDetails() {
  const { id, name, price, department } = useLocalSearchParams();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/product/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        console.log(`Product ${id} deleted.`);
        // ✅ Navigate to the products page
        router.replace(`/departments/${department}`);
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product Details</Text>
      <Text style={styles.label}>Name: {name}</Text>
      <Text style={styles.label}>Price: ₹{price}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={deleting ? 'Deleting...' : 'Delete Product'}
          color="red"
          onPress={handleDelete}
          disabled={deleting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  label: { fontSize: 20, marginVertical: 10 },
  buttonContainer: { marginTop: 40 },
});
