import { View, Text, FlatList, Image, StyleSheet } from "react-native";

const products = [
  { id: "1", name: "Organic Apples", image: "https://via.placeholder.com/100" },
  { id: "2", name: "Fresh Carrots", image: "https://via.placeholder.com/100" },
  { id: "3", name: "Imperfect Tomatoes", image: "https://via.placeholder.com/100" }
];

export default function MarketplaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Marketplace</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  item: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  image: { width: 50, height: 50, marginRight: 10 }
});
