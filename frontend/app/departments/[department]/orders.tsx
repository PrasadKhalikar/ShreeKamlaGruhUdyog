import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
type Order = {
  id: number;
  shop_name: string;
  // optionally add more fields if needed
};

export default function Orders() {
  const { department } = useLocalSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/orders/${department}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, [department]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/departments/${department}/orderDetails?orderId=${item.id}`)}
          >
            <Text style={styles.cardText}>{item.shop_name}</Text>
          </TouchableOpacity>
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 ,paddingBottom:60},
  title: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
  card: {
    padding: 20,
    backgroundColor: '#7de7e6',
    borderRadius: 20,
    marginBottom: 10,
  },
  cardText: { fontSize: 18, fontWeight: '500' },
  footer: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: 360,
    backgroundColor: '#7de7e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 18, fontWeight: '500',paddingBottom:30 },
});
