import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Modal, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Shop = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
};
type OrderItem = {
  productId: string;
  productName: string;
  quantity: string;
  price: number;
};

export default function OrderPage() {
  const router = useRouter();
  const { department } = useLocalSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
 const [items, setItems] = useState<OrderItem[]>([
  { productId: '', productName: '', quantity: '', price: 0 }
]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState<string[]>([]);
  const [modalType, setModalType] = useState<'shop' | 'product'>();
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [billTotal, setBillTotal] = useState(0);
  

  useEffect(() => {
    fetch(`${API_URL}/shops`)
      .then(res => res.json())
      .then(setShops);

    fetch(`${API_URL}/products/${department}`)
      .then(res => res.json())
      .then(setProducts);
  }, [department]);

  const openModal = (type: 'shop' | 'product', index?: number) => {
    setModalType(type);
    setModalItems(
      type === 'shop' ? shops.map(s => s.name) : products.map(p => p.name)
    );
    setSelectedItemIndex(index ?? null);
    setModalVisible(true);
  };

  const selectItem = (item: string) => {
    if (modalType === 'shop') {
      setSelectedShop(item);
    } else if (modalType === 'product' && selectedItemIndex !== null) {
      const product = products.find(p => p.name === item);
      const updated = [...items];
      updated[selectedItemIndex] = {
        ...updated[selectedItemIndex],
        productId: product?.id || '',
        productName: product?.name || '',
        price: product?.price || 0,
      };
      setItems(updated);
    }
    setModalVisible(false);
  };

 const updateItem = (index: number, field: 'productId' | 'productName' | 'quantity', value: string) => {
  const newItems = [...items];
  newItems[index][field] = value;
  setItems(newItems);
};



  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const qty = parseInt(item.quantity);
      return sum + (isNaN(qty) ? 0 : qty * item.price);
    }, 0);
    setBillTotal(total);
  }, [items]);

  const handleSubmit = () => {
  const orderData = {
    department,
    shop_name: selectedShop,
    total: billTotal,
    items: items.map(i => ({
      product_id: i.productId,
      quantity: parseInt(i.quantity),
    })),
  };

  fetch(`${API_URL}/create-order`, {   
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  })
    .then(res => res.json())
    .then(() => {
      console.log('Order submitted');
      router.replace(`/departments/${department}/orders`);
    })
    .catch(err => console.error('Order submit failed:', err));
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Order</Text>

      <Text style={styles.label}>Select Shop</Text>
      <Pressable style={styles.dropdown} onPress={() => openModal('shop')}>
        <Text>{selectedShop || 'Select Shop'}</Text>
      </Pressable>

      {items.map((item, index) => (
        <View key={index} style={styles.itemGroup}>
          <Text style={styles.label}>Product</Text>
          <Pressable style={styles.dropdown} onPress={() => openModal('product', index)}>
            <Text>{item.productName || 'Select Product'}</Text>
          </Pressable>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={item.quantity}
            onChangeText={(value) => updateItem(index, 'quantity', value)}
            placeholder="Enter quantity"
          />
        </View>
      ))}

      <Pressable
        onPress={() =>
          setItems([...items, { productId: '', productName: '', quantity: '', price: 0 }])
        }
        style={styles.addMoreButton}
      >
        <Text style={styles.addMoreText}>+ Add More</Text>
      </Pressable>

      <TextInput
        value={`₹ ${billTotal}`}
        editable={false}
        style={[styles.input, { backgroundColor: '#eee', fontWeight: 'bold' }]}
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Order</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <FlatList
              data={modalItems}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable style={styles.modalItem} onPress={() => selectItem(item)}>
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    paddingBottom:60,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  itemGroup: {
    marginBottom: 10,
  },
  addMoreButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addMoreText: {
    fontSize: 18,
    color: 'blue',
  },
  submitButton: {
    backgroundColor: 'rgba(125, 231, 230, 0.93)',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalItem: {
    paddingVertical: 12,
  },
});
