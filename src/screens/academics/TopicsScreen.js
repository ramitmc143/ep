import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function TopicsScreen({ route, navigation }) {
  const {
    sect_id,
    sub_cat_id,
    cat_id,
    state_id,
    lang_id,
    year: initialYear,
    topic_id,
    sub_topic_id,
    sub_topic_name
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [pdfTypes, setPdfTypes] = useState([]);
  const [noPdfModal, setNoPdfModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // 🔵 Language Toggle State
  const [selectedLanguage, setSelectedLanguage] = useState(
    lang_id === 1 ? "English" : "Telugu"
  );

  /* ------------------------------------------------------
      ON YEAR OR LANGUAGE CHANGE -> REFRESH
  ------------------------------------------------------ */
  useEffect(() => {
    fetchPdfTypes();
  }, [selectedYear, selectedLanguage]);

  const showNoPdf = () => {
    setPdfTypes([]);
    setLoading(false);
    setNoPdfModal(true);
  };

  /* ------------------------------------------------------
      FETCH PDF TYPES
  ------------------------------------------------------ */
  const fetchPdfTypes = async () => {
    try {
      setLoading(true);
      setPdfTypes([]);
      setNoPdfModal(false);

      const body = {
        device_id: 123,
        sect_id,
        lang_id: selectedLanguage === "English" ? 1 : 2,
        stateid: state_id,
        year: selectedYear,
        cat_id,
        sub_cat_id,
        topic_id,
        sub_topic_id,
        pdfetype: 2
      };

      console.log("📤 TOPICS API BODY:", body);

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

      if (!item) return showNoPdf();

      const total = Number(item.pdfetype_total_count || 0);

      const exact = [];
      const fallback = [];

      for (let i = 1; i <= total; i++) {
        const yr = Number(item[`pdf_year_${i}`]);
        const pdfLang = Number(item[`pdf_language_${i}`]);

        if (yr !== Number(selectedYear)) continue;

        const pdfItem = {
          label: item[`pdfetype_label_${i}`],
          id: item[`pdf_id_${i}`],
          index: i,
          raw: item
        };

        if (pdfLang === (selectedLanguage === "English" ? 1 : 2))
          exact.push(pdfItem);
        else
          fallback.push(pdfItem);
      }

      if (exact.length > 0) {
        setPdfTypes(exact);
      } else if (fallback.length > 0) {
        setPdfTypes(fallback);
      } else {
        return showNoPdf();
      }
    } catch (e) {
      console.log("❌ ERROR:", e);
      return showNoPdf();
    }

    setLoading(false);
  };

  /* ------------------------------------------------------
      OPEN PDF IMAGES
  ------------------------------------------------------ */
  const openPdf = (item) => {
    const raw = item.raw;
    const idx = item.index;

    const total = Number(raw[`pdf_${idx}_image_count`] || 0);
    const images = [];

    for (let i = 1; i <= total; i++) {
      const url = raw[`pdf_${idx}_image_${i}_url`];
      if (url) images.push(url);
    }

    if (images.length === 0) return showNoPdf();

    navigation.navigate("FlipBookScreen", {
      images,
      title: item.label
    });
  };

  /* ------------------------------------------------------
      LOADER
  ------------------------------------------------------ */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  /* ------------------------------------------------------
      MAIN UI
  ------------------------------------------------------ */
  return (
    <SafeAreaView style={styles.container}>

      {/* 🔵 HEADER WITH LANGUAGE TOGGLE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(7)} color="#003977" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{sub_topic_name}</Text>

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

      {/* YEAR DROPDOWN */}
      <View style={styles.yearCard}>
        <Text style={styles.yearLabel}>Select Year:</Text>
        <View style={styles.yearPickerBox}>
          <Picker
            selectedValue={selectedYear}
            dropdownIconColor="#003977"
            style={styles.yearPicker}
            onValueChange={(v) => setSelectedYear(v)}
          >
            <Picker.Item label="2026" value={2026} />
            <Picker.Item label="2025" value={2025} />
            <Picker.Item label="2024" value={2024} />
          </Picker>
        </View>
      </View>

      {/* PDF LIST */}
      <FlatList
        data={pdfTypes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: wp(4) }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pdfCard}
            onPress={() => openPdf(item)}
          >
            <Text style={styles.pdfLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* NO PDF MODAL */}
      <Modal transparent visible={noPdfModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>PDF Not Available</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setNoPdfModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ------------------------------------------------------
      STYLES
------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },

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
    fontSize: wp(5),
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

  /* Year Dropdown */
  yearCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    elevation: 3,
    marginBottom: hp(2)
  },

  yearLabel: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#003977",
    marginBottom: hp(0.7),
  },

  yearPickerBox: {
    backgroundColor: "#fff",
    borderWidth: 1.2,
    borderColor: "#d0d7de",
    borderRadius: wp(2),
    height: hp(6.5),
    justifyContent: "center",
    paddingHorizontal: wp(2),
  },

  yearPicker: {
    width: "100%",
    height: hp(6.5),
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
  },

  pdfCard: {
    backgroundColor: "#ED2532",
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    elevation: 6
  },

  pdfLabel: {
    color: "#fff",
    fontSize: wp(4.6),
    fontWeight: "700"
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },

  modalBox: {
    width: wp(70),
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(5),
    alignItems: "center"
  },

  modalText: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#003977",
    marginBottom: hp(2)
  },

  modalButton: {
    backgroundColor: "#187DC1",
    paddingVertical: hp(1),
    paddingHorizontal: wp(9),
    borderRadius: wp(2)
  },

  modalButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "700"
  }
});
