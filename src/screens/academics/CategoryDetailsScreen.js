import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

/* COLORS */
const COLORS = {
  tsBlue: "#187DC1",
  tsRed: "#ED2532",
  tsGreen: "#19A356",
  tsCyan: "#1CA9A0",
  apOrange: "#FBA93A",
  apSkyBlue: "#18A4DF",
  apPurple: "#8950A1",
  apGreen: "#1BAA58"
};

const getSubCatColor = (stateName, index) => {
  if (stateName === "Telangana") {
    return [COLORS.tsBlue, COLORS.tsRed, COLORS.tsGreen, COLORS.tsCyan][index];
  }
  return [
    COLORS.apOrange,
    COLORS.apSkyBlue,
    COLORS.apPurple,
    COLORS.apGreen
  ][index];
};

export default function CategoryDetailsScreen({ route, navigation }) {
  const {
    sect_id,
    section_name,
    cat_id,
    year,
    state_id,
    state_name,
    lang_id
  } = route.params;

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Language toggle state
  const [selectedLanguage, setSelectedLanguage] = useState(
    lang_id === 1 ? "English" : "Telugu"
  );

  useEffect(() => {
    fetchSubCategories();
  }, [selectedLanguage]); // re-fetch when language changes

  const fetchSubCategories = async () => {
    try {
      setLoading(true);

      const body = {
        device_id: 123,
        sect_id,
        stateid: state_id,
        lang_id: selectedLanguage === "English" ? 1 : 2,
        year,
        cat_id
      };

      console.log("📤 CATEGORY API BODY:", body);

      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const json = await response.json();
      console.log("📥 CATEGORY API RESPONSE:", json);

      const item = json.latest_Notification?.[0];
      if (!item) return;

      const total = Number(item.sub_cat_count);
      const arr = [];

      for (let i = 1; i <= total; i++) {
        arr.push({
          sub_cat_id: item[`sub_cat_id_${i}`],
          sub_cat_name: item[`sub_cat_name_${i}`]
        });
      }

      setSubCategories(arr);
    } catch (err) {
      console.log("❌ CATEGORY FETCH ERROR:", err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(7)} color="#003977" />
        </TouchableOpacity>

        {/* TITLE */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>{section_name}</Text>
          <Text style={styles.headerSub}>{state_name}</Text>
        </View>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() =>
            setSelectedLanguage(
              selectedLanguage === "English" ? "Telugu" : "English"
            )
          }
        >
          <Text style={styles.langText}>
            {selectedLanguage === "English" ? "EN" : "TE"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4) }}>
        <View style={styles.grid}>
          {subCategories.map((item, index) => (
            <TouchableOpacity
              key={item.sub_cat_id}
              style={[
                styles.card,
                { backgroundColor: getSubCatColor(state_name, index) }
              ]}
              onPress={() => {
                navigation.navigate("SubjectBooksScreen", {
                  sect_id,
                  section_name,
                  sub_cat_id: item.sub_cat_id,
                  sub_cat_name: item.sub_cat_name,
                  cat_id,
                  year,
                  state_id,
                  state_name,
                  lang_id: selectedLanguage === "English" ? 1 : 2
                });
              }}
            >
              <Text style={styles.cardText}>{item.sub_cat_name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: hp(3) }} />
      </ScrollView>

    </SafeAreaView>
  );
}

/* -----------------------------------------
    STYLES
------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: "#fff",
    elevation: 4,
    marginBottom: hp(1)
  },

  headerTitle: {
    fontSize: wp(5.2),
    fontWeight: "700",
    color: "#003977"
  },

  headerSub: {
    fontSize: wp(3.5),
    color: "#666",
    marginTop: hp(0.4)
  },

  langToggle: {
    width: wp(12),
    height: hp(4),
    backgroundColor: "#0054A6",
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center"
  },

  langText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "700"
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "47%",
    paddingVertical: hp(2.8),
    marginBottom: hp(2),
    borderRadius: wp(3),
    elevation: 6,
    justifyContent: "center",
    alignItems: "center"
  },

  cardText: {
    fontSize: wp(4.4),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center"
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  loadingText: {
    marginTop: hp(1),
    fontSize: wp(4),
    fontWeight: "600",
    color: "#003977"
  }
});
