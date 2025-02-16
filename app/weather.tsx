import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";  
import { useCallback } from "react";
import { useRoute } from '@react-navigation/native';

//added
type WeatherScreenProps = {
  growingItems: { name: string }[];
};

export default function WeatherScreen( { growingItems }: WeatherScreenProps ) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeatherAdvice = async () => {
    setLoading(true);
    try {

      const response = await axios.post("http://172.18.62.8:8000/recommend_alert", {
        crops: growingItems,
      });
      setAdvice(response.data.advice);
    } catch (error) {
      console.error("Error fetching weather advice:", error);
      setAdvice("Failed to fetch advice.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWeatherAdvice();

      console.log(growingItems)
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weather Forecast</Text>
      <Text>Sunny, 75°F</Text>

      <Text style={styles.subHeader}>Recommended Crop Actions:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.advice}>{advice}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subHeader: { fontSize: 18, marginTop: 20 },
  advice: { fontSize: 16, marginTop: 10, textAlign: "center", paddingHorizontal: 10},
})