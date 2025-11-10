import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

export default function AcademicScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            device_id: 123
          })
        }
      );

      const json = await res.json();
      const data = json.latest_Notification || [];

      const map = {};

      data.forEach(item => {
        const sectName = item.sect_name_english; // Intermediate, Tenth Class
        const sectId = item.sect_id;

        if (sectName && sectId && !map[sectId]) {
          map[sectId] = sectName;
        }
      });

      const finalList = Object.keys(map).map(id => ({
        sect_id: id,
        title: map[id]
      }));

      setCategories(finalList);
    } catch (e) {
      console.log("Category Fetch Error", e);
    }

    setLoading(false);
  };

  const CategoryCard = ({ title, onPress }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text>Loading Categories...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>📘 Academic Section</Text>

      <View style={styles.grid}>
        {categories.map(item => (
          <CategoryCard
            key={item.sect_id}
            title={item.title}
            onPress={() =>
              navigation.navigate("CategoryDetailScreen", {
                sect_id: item.sect_id,   // ✅ send sect_id
                classType: item.title
              })
            }
          />
        ))}
      </View>

      <View style={{ height: hp(3) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    backgroundColor: "#F2F4F7"
  },
  header: {
    fontSize: wp(6),
    fontWeight: "700",
    color: "#003977",
    marginBottom: hp(2)
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    backgroundColor: "#E6F0FA",
    paddingVertical: hp(3),
    marginBottom: hp(2),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#0054A6",
    elevation: 4
  },
  cardText: {
    fontSize: wp(4.3),
    fontWeight: "700",
    color: "#0054A6",
    textAlign: "center"
  }
});
