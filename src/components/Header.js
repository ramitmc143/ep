import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { changeLanguage } from "../redux/languageSlice/LanguageSlice";
import { moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { setSelectedCategoryId } from "../redux/slices/selectedCategorySlice";

const Header = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const LANGUAGE = useSelector((state) => state.language);
  const currentScreen = useSelector((state) => state.selectedScreen.selectedScreen);
  const { filterIcons, Categories } = useSelector(
    (state) => state.dataOfCategoryOFNotification
  );
  const { eng_lang_id, tel_lang_id } = useSelector(
    (state) => state.language_id_status
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleLanguageChange = useCallback(() => {
    const newLang = LANGUAGE.data === "english" ? "telugu" : "english";
    dispatch(changeLanguage(newLang));
  }, [LANGUAGE.data]);

  const toggleModal = () => setIsModalVisible((prev) => !prev);

  useEffect(() => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    dispatch(setSelectedCategoryId(null));
  }, [currentScreen]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setSelectedCategory(item.cat_name);
        dispatch(setSelectedCategoryId(item.cat_id));
        toggleModal();
      }}
    >
      <Text style={styles.categoryText}>{item.cat_name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.wrapper}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={navigation.openDrawer}
            style={styles.menuButton}
          >
            <Entypo name="menu" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>

          <Image
            source={require("../Assets/pratibha-logo-new.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate("BellNotification")}
          >
            <MaterialIcons
              name="notifications"
              size={moderateScale(24)}
              color="red"
            />
          </TouchableOpacity>
        </View>

        {/* Title + Category + Language Switch */}
        <View style={styles.bottomRow}>
          <View style={styles.titleWithIcon}>
            <Text numberOfLines={1} style={styles.title}>
              {selectedCategory || currentScreen}
            </Text>

            {(currentScreen === "Notifications" ||
              currentScreen === "నోటిఫికేష‌న్స్") &&
              !!filterIcons?.length && (
                <TouchableOpacity onPress={toggleModal}>
                  <Image
                    source={{ uri: filterIcons[0] }}
                    style={styles.iconNextToTitle}
                  />
                </TouchableOpacity>
              )}
          </View>

          {/* Language Switch */}
          <View style={styles.languageToggleWrapper}>
            {eng_lang_id && tel_lang_id ? (
              <View style={styles.languageToggle}>
                <Text style={styles.langText}>
                  {LANGUAGE.data === "english" ? "ENG" : "TEL"}
                </Text>

                <Switch
                  value={LANGUAGE.data === "english"}
                  onValueChange={handleLanguageChange}
                  trackColor={{ false: "#ccc", true: "#1DA1F2" }}
                  thumbColor="#fff"
                  style={styles.switch}
                />
              </View>
            ) : (
              <View style={styles.languageTogglePlaceholder} />
            )}
          </View>
        </View>

        {/* Category Modal */}
        <Modal
          visible={isModalVisible}
          transparent
          onRequestClose={toggleModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>

              <FlatList
                data={Categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.cat_id.toString()}
              />

              <TouchableOpacity
                onPress={toggleModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  /* TOP BAR */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#c7eafb",
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2),
  },

  menuButton: {
    padding: moderateScale(4),
  },

  notificationButton: {
    padding: moderateScale(4),
  },

  logo: {
    width: wp(40),
    maxWidth: 180, // prevents stretching on tablets
    height: hp(4.6),
  },

  /* TITLE BAR */
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.7),
  },

  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: "70%",
  },

  title: {
    fontSize: moderateScale(15),
    fontWeight: "bold",
    color: "#000",
    flexShrink: 1,
  },

  iconNextToTitle: {
    width: moderateScale(16),
    height: moderateScale(16),
    marginLeft: wp(2),
  },

  /* LANGUAGE SWITCH */
  languageToggleWrapper: {
    flexShrink: 1,
    alignItems: "flex-end",
  },

  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1DA1F2",
    borderRadius: 20,
    paddingVertical: hp(0.3),
    paddingHorizontal: wp(2),
  },

  langText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "bold",
    marginRight: wp(1),
  },

  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },

  languageTogglePlaceholder: {
    height: hp(3),
    width: wp(18),
  },

  /* MODAL */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: wp(80),
    maxWidth: 380, // For tablets
  },

  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  categoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: "#ddd",
  },

  categoryText: {
    fontSize: moderateScale(14),
    color: "#333",
  },

  modalCloseButton: {
    marginTop: 12,
    backgroundColor: "#1DA1F2",
    padding: 10,
    borderRadius: 6,
  },

  modalCloseText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});

export default Header;
