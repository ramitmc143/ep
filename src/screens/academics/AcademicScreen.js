import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

/* ---------- CONSTANTS ---------- */
const STATES = ["Telangana", "Andhra Pradesh"];

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

/* ---------- LANGUAGE SWITCH ---------- */
const LanguageSwitch = React.memo(({ value, onChange }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onChange(value === "English" ? "Telugu" : "English")}
    style={{
      width: wp(12),
      height: hp(3),
      borderRadius: wp(5),
      backgroundColor: value === "Telugu" ? "#0054A6" : "#aaa",
      justifyContent: "center",
      paddingHorizontal: wp(1)
    }}
  >
    <View
      style={{
        width: hp(2.3),
        height: hp(2.3),
        borderRadius: hp(2),
        backgroundColor: "#fff",
        alignSelf: value === "Telugu" ? "flex-end" : "flex-start"
      }}
    />
  </TouchableOpacity>
));

/* ---------- CATEGORY CARD ---------- */
const CategoryCard = React.memo(({ title, onPress, bgColor }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: bgColor }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
));

/* ---------- HEADER SECTION ---------- */
const HeaderSection = React.memo(
  ({ selectedLanguage, setSelectedLanguage, selectedState, setSelectedState }) => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>📘 Academic Section</Text>

        {/* Language Toggle */}
        <View style={styles.languageWrap}>
          <Text style={styles.langText}>EN</Text>
          <LanguageSwitch value={selectedLanguage} onChange={setSelectedLanguage} />
          <Text style={styles.langText}>TE</Text>
        </View>
      </View>

      {/* State Selection */}
      <Text style={styles.subHeading}>
        {selectedLanguage === "English" ? "Select State" : "రాష్ట్రం ఎంచుకోండి"}
      </Text>

      <View style={styles.stateRow}>
        {STATES.map((state) => (
          <TouchableOpacity
            key={state}
            style={[
              styles.stateBtn,
              selectedState === state && styles.stateBtnActive
            ]}
            onPress={() => setSelectedState(state)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.stateText,
                selectedState === state && styles.stateTextActive
              ]}
            >
              {state}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
);

/* ---------- COLOR LOGIC ---------- */
const getCardColor = (state, index) => {
  if (state === "Telangana") {
    return [COLORS.tsBlue, COLORS.tsRed, COLORS.tsGreen, COLORS.tsCyan][index];
  }
  return [COLORS.apOrange, COLORS.apSkyBlue, COLORS.apPurple, COLORS.apGreen][index];
};

/* ---------- SECTION LIST ---------- */
const SectionListArea = React.memo(
  ({ categories, loadingSections, selectedLanguage, selectedState, navigation }) => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.subHeading, { marginHorizontal: wp(4) }]}>
        {selectedLanguage === "English" ? "Sections" : "విభాగాలు"}
      </Text>

      {loadingSections ? (
        <View style={{ marginTop: hp(5), alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0054A6" />
          <Text>Loading sections...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.sect_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: wp(4),
            paddingBottom: hp(3)
          }}
          renderItem={({ item, index }) => (
            <CategoryCard
              title={item.section_name}
              bgColor={getCardColor(selectedState, index)}
              onPress={() =>
                navigation.navigate("CategoryDetailsScreen", {
                   sect_id: item.sect_id,
  section_name: item.section_name,             // ✅ Add Section name
  cat_id: item.cat_id,
  year: item.year,
  state_id: selectedState === "Telangana" ? 32 : 2,  // ✅ Correct State ID
  state_name: selectedState,                   // ✅ Correct State Name
  lang_id: selectedLanguage === "English" ? 1 : 2
                })
              }
            />
          )}
        />
      )}
    </View>
  )
);

/* ---------- MAIN SCREEN ---------- */
export default function AcademicScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [selectedState, setSelectedState] = useState("Telangana");
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu");

  useEffect(() => {
    fetchSections();
  }, [selectedState, selectedLanguage]);

  const fetchSections = async () => {
    try {
      setLoadingSections(true);

      const stateID = selectedState === "Telangana" ? 32 : 2;
      const langID = selectedLanguage === "English" ? 1 : 2;

      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: 123,
            sect_id: 5,    // MANDATORY
            state_id: stateID,
            year: 2026,
            lang_id: langID
          })
        }
      );

      const json = await response.json();
      const items = json.latest_Notification || [];

      const finalData = items.map((item) => ({
        sect_id: item.section_id,
        section_name: item.section_name,
        cat_id: item.cat_id,
        year: item.year
      }));

      setCategories(finalData);
    } catch (err) {
      console.log("Error fetching sections:", err);
    }

    setLoadingSections(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <HeaderSection
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
      />

      <SectionListArea
        categories={categories}
        loadingSections={loadingSections}
        selectedLanguage={selectedLanguage}
        selectedState={selectedState}
        navigation={navigation}
      />
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    backgroundColor: "#F8FAFC"
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2)
  },

  header: { fontSize: wp(6), fontWeight: "700", color: "#003977" },

  languageWrap: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: wp(1.5)
  },

  langText: { fontSize: wp(4), fontWeight: "600", color: "#003977" },

  subHeading: {
    fontSize: wp(4.5),
    fontWeight: "700",
    marginVertical: hp(1),
    color: "#003977"
  },

  stateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(2)
  },

  stateBtn: {
    width: "48%",
    paddingVertical: hp(1.4),
    borderRadius: wp(2),
    backgroundColor: "#E6EAF0",
    alignItems: "center"
  },

  stateBtnActive: { backgroundColor: "#0054A6" },

  stateText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#003977"
  },

  stateTextActive: { color: "#fff" },

  card: {
    width: "47.5%",
    paddingVertical: hp(3),
    marginBottom: hp(2),
    borderRadius: wp(2),
    alignItems: "center",
    elevation: 5
  },

  cardText: {
    fontSize: wp(4.3),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center"
  }
});
