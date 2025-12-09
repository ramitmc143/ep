import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const SUBJECTS = [
  "Maths",
  "Science",
  "Social Studies",
  "English",
  "Telugu",
  "Hindi",
];

const CategoryCard = ({ title, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

export default function EighthGradeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>8th Grade Subjects</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SUBJECTS.map((subject, index) => (
            <CategoryCard
              key={index}
              title={subject}
              onPress={() =>
                navigation?.navigate("EighthGradeSubject", { subject })
              }
            />
          ))}
        </View>

        <View style={{ height: hp(3) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  header: {
    fontSize: wp(5.5),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: hp(2),
    color: "#1A237E",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    paddingVertical: hp(3),
    borderRadius: wp(2),
    marginBottom: hp(2),
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#263238",
    textAlign: "center",
  },
});
