import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
const skgu = require("../assets/images/skgu.jpg");


export default function Departments() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={skgu} style={styles.logo} resizeMode="cover" />
        <Text style={styles.title}>Shree Kamla Gruh Udyog</Text>
      </View>

      {/* Department Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/departments/cotton")}
        >
          <Text style={styles.buttonText}>Cotton Wicks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/departments/camphor")}
        >
          <Text style={styles.buttonText}>Camphor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/departments/food")}
        >
          <Text style={styles.buttonText}>Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    header: {
      backgroundColor: "#fff",
      alignItems: "center",
      paddingBottom: 10,
    },
    logo: {
      width: "100%",
      height: 200,
    },
    title: {
      fontSize: 24,
      color: "#000",
      fontWeight: "500",
      marginTop: 10,
    },
    buttonsContainer: {
      flex: 1,
      paddingHorizontal: 30,
      justifyContent: "center",
    },
    button: {
      backgroundColor: "rgba(125, 231, 230, 0.93)",
      paddingVertical: 15,
      borderRadius: 30,
      alignItems: "center",
      marginVertical: 15,
    },
    buttonText: {
      fontSize: 20,
      color: "#000",
      fontWeight: "500",
    },
  });
  