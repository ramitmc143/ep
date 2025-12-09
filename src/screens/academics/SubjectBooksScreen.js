import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

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

/* Get card color */
const getCardColor = (stateName, index) => {
  const ts = [COLORS.tsBlue, COLORS.tsRed, COLORS.tsGreen, COLORS.tsCyan];
  const ap = [COLORS.apOrange, COLORS.apSkyBlue, COLORS.apPurple, COLORS.apGreen];
  return (stateName === "Telangana" ? ts : ap)[index % 4];
};

export default function SubjectBooksScreen({ route, navigation }) {
  const {
    sect_id,
    sub_cat_id,
    sub_cat_name,
    cat_id,
    year,
    state_id,
    state_name,
    lang_id
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [topicId, setTopicId] = useState(null);

  // 🔵 Language Toggle State
  const [selectedLanguage, setSelectedLanguage] = useState(
    lang_id === 1 ? "English" : "Telugu"
  );

  useEffect(() => {
    fetchTopicId();
  }, [selectedLanguage]); // 🔄 Refresh on language change

  /* ----------------------- FETCH TOPIC ID ----------------------- */
  const fetchTopicId = async () => {
    try {
      setLoading(true);

      const body = {
        device_id: 123,
        sect_id,
        stateid: state_id,
        lang_id: selectedLanguage === "English" ? 1 : 2,
        year,
        cat_id,
        sub_cat_id,
        pdfetype: 2
      };

      const res = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const json = await res.json();
      const item = json.latest_Notification?.[0];

      if (!item) return;

      const topic_id = item.topic_id_1 || item.topic_id;
      setTopicId(topic_id);

      fetchSubjects(topic_id);
    } catch (err) {
      console.log("❌ TOPIC ERROR:", err);
    }
  };

  /* ----------------------- FETCH SUBJECTS ----------------------- */
  const fetchSubjects = async (topic_id) => {
    try {
      const body = {
        device_id: 123,
        sect_id,
        stateid: state_id,
        lang_id: selectedLanguage === "English" ? 1 : 2,
        year,
        cat_id,
        sub_cat_id,
        topic_id
      };

      const res = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const json = await res.json();
      const item = json.latest_Notification?.[0];

      const total = Number(item?.sub_topic_count) || 0;
      const arr = [];

      for (let i = 1; i <= total; i++) {
        arr.push({
          id: item[`sub_topic_id_${i}`],
          name: item[`sub_topic_name_${i}`],
          image: item[`sub_topic_image_${i}`]
        });
      }

      setSubjects(arr);
    } catch (err) {
      console.log("❌ SUBJECT ERROR:", err);
    }

    setLoading(false);
  };

  /* ----------------------- LOADING ----------------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text style={styles.loadingText}>Loading Subjects...</Text>
      </View>
    );
  }

  /* ----------------------- MAIN UI ----------------------- */
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER WITH LANGUAGE TOGGLE */}
      <View style={styles.header}>

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(7)} color="#003977" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>{sub_cat_name}</Text>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() =>
            setSelectedLanguage(prev => prev === "English" ? "Telugu" : "English")
          }
        >
          <Text style={styles.langText}>
            {selectedLanguage === "English" ? "EN" : "TE"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* SUBJECT GRID */}
      <FlatList
        data={subjects}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: wp(4),
          paddingBottom: hp(2)
        }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: getCardColor(state_name, index) }
            ]}
            onPress={() =>
              navigation.navigate("TopicsScreen", {
                sect_id,
                sub_cat_id,
                cat_id,
                state_id,
                state_name,
                lang_id: selectedLanguage === "English" ? 1 : 2,
                year,
                topic_id: topicId,
                sub_topic_id: item.id,
                sub_topic_name: item.name,
                sub_topic_image: item.image
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.subjectName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

    </SafeAreaView>
  );
}

/* ----------------------- STYLES ----------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    backgroundColor: "#fff",
    elevation: 4,
    marginBottom: hp(1)
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: wp(5.2),
    fontWeight: "700",
    color: "#003977"
  },

  /* Language Toggle */
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  loadingText: {
    marginTop: hp(1),
    fontSize: wp(4),
    fontWeight: "500",
    color: "#003977"
  },

  card: {
    width: "47%",
    borderRadius: wp(3),
    elevation: 6,
    marginBottom: hp(2),
    overflow: "hidden",
    paddingBottom: hp(1)
  },

  image: {
    width: "100%",
    height: hp(24),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3)
  },

  subjectName: {
    marginTop: hp(1),
    fontSize: wp(4),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center"
  }
});
