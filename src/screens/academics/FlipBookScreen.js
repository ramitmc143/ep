import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";

import PageFlipper from "@thanhdong272/react-native-page-flipper";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImageZoom from "react-native-image-pan-zoom";

const { width, height } = Dimensions.get("window");

const TOP_HEADER = height * 0.06;
const FOOTER = height * 0.09;
const FLIP_HEIGHT = height - TOP_HEADER - FOOTER;

export default function FlipBookScreen({ route, navigation }) {
  const { images = [], title = "Model Paper" } = route.params || {};

  const totalPages = images?.length || 0;

  return (
    <View style={styles.screen}>

      {/* 🔹 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={height * 0.032} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        {/* Right spacer */}
        <View style={{ width: height * 0.032 }} />
      </View>

      {/* 🔹 FLIPBOOK + ZOOM */}
      <View style={styles.flipArea}>
        <PageFlipper
  data={images}
  pageSize={{ width, height: FLIP_HEIGHT }}
  preRender={2}
  renderPage={(uri) => {
    const pageIndex = images.indexOf(uri); // 0-based
    const pageNumber = pageIndex === -1 ? 0 : pageIndex + 1;

    return (
      <View style={styles.pageWrapper}>
        <ImageZoom
          cropWidth={width}
          cropHeight={FLIP_HEIGHT}
          imageWidth={width}
          imageHeight={FLIP_HEIGHT}
          enableCenterFocus={false}
          minScale={1}
          maxScale={4}
          style={{ backgroundColor: "#fff" }}
        >
          <View style={{ flex: 1 }}>
            <Image
              source={{ uri }}
              style={styles.page}
              resizeMode="contain"
            />

            {/* 🔹 PAGE NUMBER */}
            <View style={styles.pageNumberContainer}>
              <Text style={styles.pageNumberText}>
                {pageNumber} / {totalPages}
              </Text>
            </View>
          </View>
        </ImageZoom>
      </View>
    );
  }}
  portrait
  orientation="horizontal"
  enableTouch={true}
  duration={180}
  curlMode="soft"
/>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: TOP_HEADER,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    borderBottomColor: "#222",
    borderBottomWidth: 1,
  },

  iconBtn: {
    padding: height * 0.004,
  },

  title: {
    fontSize: height * 0.022,
    fontWeight: "600",
    color: "#fff",
  },

  flipArea: {
    width: "100%",
    height: FLIP_HEIGHT,
    backgroundColor: "#fff",
  },

  pageWrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },

  page: {
    width: "100%",
    height: "100%",
  },

  pageNumberContainer: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  pageNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
