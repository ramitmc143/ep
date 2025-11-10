import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function SubjectBooksScreen({ route, navigation }) {
  const { sect_id, year, state, category, categoryTel, sub, subTel, medium } =
    route.params;

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: 123,
            sect_id: parseInt(sect_id),
          }),
        }
      );

      const json = await response.json();
      const data = json.latest_Notification || [];

      const filtered = data.filter(
        (item) =>
          item.year == year &&
          (item.doc_path.includes("TG") ? "Telangana" : "Andhra Pradesh") ===
            state &&
          item.cat_name === category &&
          item.sub_cat_name.trim() === sub &&
          (medium === "English Medium"
            ? item.doc_language == "1"
            : item.doc_language == "2")
      );

      const map = {};
      filtered.forEach((item) => {
        const subName = item.ee_topic_name;
        const subNameTel = item.ee_topic_name_telugu;
        if (!map[subName]) {
          map[subName] = { tel: subNameTel };
        }
      });

      // ✅ Sorted unique list
      const finalList = Object.keys(map)
        .sort()
        .map((key) => ({
          name: key,
          tel: map[key].tel,
        }));

      setSubjects(finalList);
    } catch (err) {
      console.log("Subject error:", err);
    }
    setLoading(false);
  };

  // ✅ Correct asset path (case sensitive)
  const bookImage = require("../../Assets/book.jpg");
// ensure folder is `assets`

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text style={{ marginTop: 6 }}>Loading Subjects...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.screenTitle}>📘 Select Subject</Text>

      {/* Header Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{category}</Text>
        <Text style={styles.infoTel}>{categoryTel}</Text>

        <Text style={styles.infoSub}>{sub}</Text>
        <Text style={styles.infoSubTel}>{subTel}</Text>

        <Text style={styles.metaText}>📅 {year} | 🌐 {state}</Text>
        <Text style={styles.metaText}>🎓 {medium}</Text>
      </View>

      {/* Subjects */}
      <Text style={styles.sectionTitle}>📚 Subjects</Text>

      {subjects.length === 0 && (
        <Text style={styles.noData}>No subjects found</Text>
      )}

      {subjects.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate("PapersScreen", {
              sect_id,
              year,
              state,
              category,
              sub,
              subject: item.name,
              subjectTel: item.tel,
              medium,
            })
          }
        >
          <Image source={bookImage} style={styles.icon} />

          <View style={{ flex: 1 }}>
            <Text style={styles.subName}>{item.name}</Text>
            <Text style={styles.subNameTel}>{item.tel}</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: hp(3) }} />
    </ScrollView>
  );
}

/* ✅ Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  screenTitle: {
    textAlign: "center",
    fontSize: wp(5),
    fontWeight: "700",
    color: "#003A78",
    marginTop: hp(1),
  },

  infoBox: {
    margin: wp(4),
    padding: wp(3),
    backgroundColor: "#FFFFFF",
    borderRadius: wp(2),
    elevation: 4,
  },
  infoTitle: { fontSize: wp(5), fontWeight: "800", color: "#003A78" },
  infoTel: { fontSize: wp(4.2), fontWeight: "700", color: "#008000" },
  infoSub: { fontSize: wp(4.6), fontWeight: "700", marginTop: hp(1) },
  infoSubTel: { fontSize: wp(4), fontWeight: "700", color: "#008000" },
  metaText: { fontSize: wp(3.7), marginTop: 4, color: "#444" },

  sectionTitle: {
    marginLeft: wp(4),
    marginBottom: hp(1),
    fontSize: wp(5),
    fontWeight: "700",
    color: "#0054A6",
  },

  noData: {
    textAlign: "center",
    color: "#777",
    fontSize: wp(4),
    marginVertical: hp(2),
  },

  card: {
    marginHorizontal: wp(4),
    marginBottom: hp(1.2),
    padding: wp(3),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: wp(2),
    elevation: 3,
  },
  icon: { width: wp(10), height: wp(10), marginRight: wp(3) },
  subName: { fontSize: wp(4.3), fontWeight: "700", color: "#003A78" },
  subNameTel: { fontSize: wp(3.8), color: "#008000" },
  arrow: { fontSize: wp(7), color: "#555" },
});
