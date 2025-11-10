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

export default function CategoryDetailScreen({ route, navigation }) {
  const { sect_id } = route.params;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);  // ✅ year filter state

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/getModelPapers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: 123,
            sect_id: parseInt(sect_id)
          })
        }
      );

      const json = await response.json();
      const list = json.latest_Notification || [];

      const grouped = {};

      list.forEach(item => {
        const year = item.year;
        const state = item.doc_path?.includes("TG") ? "Telangana" : "Andhra Pradesh";
        const category = item.cat_name;
        const categoryTel = item.cat_name_telugu;
        const subcat = item.sub_cat_name.trim();
        const subcatTel = item.sub_cat_name_telugu;
        const medium = item.doc_language === "1" ? "English Medium" : "Telugu Medium";
        const mediumTel = item.doc_language === "1" ? "ఆంగ్ల మాధ్యమం" : "తెలుగు మాధ్యమం";

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][state]) grouped[year][state] = {};
        if (!grouped[year][state][category]) grouped[year][state][category] = { tel: categoryTel, subs: {} };
        if (!grouped[year][state][category].subs[subcat])
          grouped[year][state][category].subs[subcat] = { tel: subcatTel, mediums: [] };

        grouped[year][state][category].subs[subcat].mediums.push({
          medium,
          mediumTel,
        });
      });

      setData(grouped);
    } catch (error) {
      console.log("Error fetching details:", error);
    }
    setLoading(false);
  };

  const toggleYear = (year) => {
    setSelectedYear(prev => prev === year ? null : year);
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" color="#0054A6" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const years = Object.keys(data).sort((a,b)=>b-a);

  return (
    <ScrollView style={styles.container}>

      {/* ✅ Year Filter Buttons */}
      <View style={styles.yearFilterContainer}>
        {years.map(year => (
          <TouchableOpacity
            key={year}
            style={[styles.yearBtn, selectedYear === year && styles.yearBtnActive]}
            onPress={() => toggleYear(year)}
          >
            <Text style={[styles.yearBtnText, selectedYear === year && styles.yearBtnTextActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {years
        .filter(year => !selectedYear || selectedYear === year)  // ✅ Year filter logic
        .map(year => (
        <View key={year}>
          
          <Text style={styles.year}>{year}</Text>

          {["Telangana","Andhra Pradesh"].map(state => (
            data[year][state] && (
              <View key={state} style={styles.block}>
                <Text style={styles.state}>{state}</Text>

                {Object.keys(data[year][state]).map(category => {
                  const catItem = data[year][state][category];
                  return (
                    <View key={category} style={{paddingBottom:hp(1)}}>

                      <Text style={styles.section}>
                        {category}
                      </Text>
                      <Text style={styles.sectionTel}>
                        {catItem.tel}
                      </Text>

                      {Object.keys(catItem.subs).map(sub => {
                        const subObj = catItem.subs[sub];
                        return (
                          <View key={sub}>
                            <Text style={styles.subcat}>{sub}</Text>
                            <Text style={styles.subcatTel}>{subObj.tel}</Text>

                            <View style={styles.grid}>
                              {subObj.mediums.map((m, i) => (
                                <TouchableOpacity
                                  key={i}
                                  style={styles.card}
                                  onPress={() =>
                                    navigation.navigate("SubjectBooksScreen", {
                                      sect_id,
                                      year,
                                      state,
                                      category,
                                      categoryTel: catItem.tel,
                                      sub,
                                      subTel: subObj.tel,
                                      medium: m.medium
                                    })
                                  }
                                >
                                  <Text style={styles.cardText}>{sub}</Text>
                                  <Text style={styles.cardTextSmall}>({m.medium})</Text>

                                  <Text style={styles.cardTextTel}>{subObj.tel}</Text>
                                  <Text style={styles.cardTextSmallTel}>({m.mediumTel})</Text>

                                  <Text style={styles.stateSmall}>{state}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>

                          </View>
                        );
                      })}

                    </View>
                  );
                })}

              </View>
            )
          ))}

        </View>
      ))}

      <View style={{height:hp(3)}}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:wp(3), backgroundColor:"#fff" },

  /* ✅ Year Filter Styles */
  yearFilterContainer:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"center",
    marginBottom:hp(2)
  },
  yearBtn:{
    paddingVertical:hp(0.8),
    paddingHorizontal:wp(4),
    borderRadius:wp(2),
    borderWidth:1.5,
    borderColor:"#0054A6",
    marginHorizontal:wp(1),
    marginBottom:hp(1),
    backgroundColor:"#fff"
  },
  yearBtnActive:{ backgroundColor:"#0054A6" },
  yearBtnText:{ fontSize:wp(3.6), fontWeight:"600", color:"#0054A6" },
  yearBtnTextActive:{ color:"#fff" },

  year:{ fontSize:wp(6), fontWeight:"800", color:"#D32F2F", textAlign:"center", marginVertical:hp(2) },
  block:{ borderWidth:1, borderColor:"#ccc", borderRadius:wp(2), marginBottom:hp(2) },
  state:{ backgroundColor:"#0054A6", color:"#fff", fontWeight:"700", fontSize:wp(4.6), textAlign:"center", paddingVertical:hp(1), borderTopLeftRadius:wp(2), borderTopRightRadius:wp(2) },
  section:{ fontSize:wp(4.5), fontWeight:"700", textAlign:"center", marginTop:hp(1) },
  sectionTel:{ fontSize:wp(4), fontWeight:"600", textAlign:"center", color:"#008000" },
  subcat:{ fontSize:wp(4), fontWeight:"600", textAlign:"center", marginTop:hp(1) },
  subcatTel:{ fontSize:wp(3.8), fontWeight:"600", textAlign:"center", color:"#008000", marginBottom:hp(1) },
  grid:{ flexDirection:"row", flexWrap:"wrap", justifyContent:"space-between", paddingHorizontal:wp(2) },
  card:{ width:"48%", backgroundColor:"#E6F0FA", paddingVertical:hp(2), marginBottom:hp(2), borderRadius:wp(2), borderWidth:1.5, borderColor:"#0054A6" },
  cardText:{ textAlign:"center", fontWeight:"700", fontSize:wp(3.5), color:"#0054A6" },
  cardTextSmall:{ textAlign:"center", fontWeight:"500", fontSize:wp(3), color:"#333" },
  cardTextTel:{ textAlign:"center", fontWeight:"700", fontSize:wp(3.4), color:"#008000", marginTop:3 },
  cardTextSmallTel:{ textAlign:"center", fontWeight:"500", fontSize:wp(3), color:"#008000" },
  stateSmall:{ textAlign:"center", fontSize:wp(3), marginTop:5, color:"#555" }
});
