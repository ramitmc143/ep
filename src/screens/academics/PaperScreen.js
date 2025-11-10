import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function PapersScreen({ route, navigation }) {
  const { sect_id, year, state, category, sub, subject, medium } = route.params;

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      const res = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: 123, sect_id })
        }
      );

      const json = await res.json();
      const data = json.latest_Notification || [];

      const filtered = data.filter(
        (item) =>
          item.year == year &&
          item.cat_name === category &&
          item.sub_cat_name.trim() === sub &&
          item.ee_topic_name === subject &&
          (medium === "English Medium"
            ? item.doc_language == "1"
            : item.doc_language == "2")
      );

      setPapers(filtered);
    } catch (err) {
      console.log("paper error:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={{ padding: wp(4) }}>
      <Text style={styles.header}>📄 Select Paper</Text>

      {papers.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
       onPress={() =>
  navigation.navigate("FlipBookScreen", {
    pages: item.images.map(img => img.image_url)
  })
}

        >
          <Text style={styles.title}>📘 {subject}</Text>
          <Text style={styles.subText}>Year: {item.year}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontWeight: "700",
    fontSize: wp(5),
    marginBottom: 10,
  },
  card: {
    padding: 12,
    backgroundColor: "#E6F0FA",
    marginBottom: 10,
    borderRadius: 8
  },
  title: { fontWeight: "700", fontSize: wp(4.5), color: "#003A78" },
  subText: { fontSize: wp(3.6), marginTop: 4 }
});
