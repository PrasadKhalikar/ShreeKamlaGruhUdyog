import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import React from 'react';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function OrderDetails() {
  const { department, orderId } = useLocalSearchParams();
  const router = useRouter();

  const [delivered, setDelivered] = useState(false);
  const [paid, setPaid] = useState(false);
  const [products, setProducts] = useState([]);
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/order-details/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setDelivered(data.delivered);
        setPaid(data.paid);
        setCreatedAt(data.created_at);
      })
      .catch(err => console.error('Error fetching order details:', err));
  }, [orderId]);

  const updateOrder = () => {
    fetch(`${API_URL}/update-order/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivered, paid }),
    })
      .then(res => res.json())
      .then(() => {
        Alert.alert('Order updated!');
        router.replace(`/departments/${department}`);
      })
      .catch(err => console.error('Update failed:', err));
  };

  const billTotal = products.reduce((total, p: any) => total + p.quantity * p.price, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order ID: {orderId}</Text>

      <View style={styles.orderBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.subHeading}>Order Details</Text>
          <Text style={{ fontSize: 12, color: '#555' }}>{createdAt}</Text>
        </View>

        {products.map((p: any) => (
          <Text key={p.id} style={styles.productText}>
            {p.name} — {p.quantity} × ₹{p.price}
          </Text>
        ))}

        <Text style={[styles.productText, { marginTop: 10, fontWeight: 'bold' }]}>
          Total: ₹{billTotal}
        </Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Delivered</Text>
        <Switch
          value={delivered}
          onValueChange={setDelivered}
          trackColor={{ false: "#ccc", true: "#7de7e6" }}
          thumbColor={delivered ? "#00bcd4" : "#f4f3f4"}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Bill Paid</Text>
        <Switch
          value={paid}
          onValueChange={setPaid}
          trackColor={{ false: "#ccc", true: "#7de7e6" }}
          thumbColor={paid ? "#00bcd4" : "#f4f3f4"}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel} onPress={updateOrder}>✅ Save & Back</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{department}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 15 },
  subHeading: { fontSize: 18, marginBottom: 10 },
  orderBox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#999',
    marginBottom: 20,
  },
  productText: { fontSize: 16, marginBottom: 5 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  switchLabel: { fontSize: 16 },
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
