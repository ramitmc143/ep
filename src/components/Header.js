import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {changeLanguage} from '../redux/languageSlice/LanguageSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {moderateScale} from 'react-native-size-matters';
import {setSelectedCategoryId} from '../redux/slices/selectedCategorySlice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Header = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const LANGUAGE = useSelector(state => state.language);
  const currentScreen = useSelector(
    state => state.selectedScreen.selectedScreen,
  );
  const {dataAll, filterIcons, Categories} = useSelector(
    state => state.dataOfCategoryOFNotification,
  );
  const {eng_lang_id, tel_lang_id} = useSelector(
    state => state.language_id_status,
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);


  const handleLanguageChange = useCallback(() => {
    const newLanguage = LANGUAGE.data === 'english' ? 'telugu' : 'english';
    dispatch(changeLanguage(newLanguage));
  }, [LANGUAGE.data]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    setIsModalVisible(false);
    setSelectedCategory(null);
    dispatch(setSelectedCategoryId(null));
  }, [currentScreen, dispatch]);

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setSelectedCategory(item.cat_name);
        dispatch(setSelectedCategoryId(item.cat_id));
        toggleModal();
      }}>
      <Text style={styles.categoryText}>{item.cat_name}</Text>
    </TouchableOpacity>
  );

  return (
   <>
     <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{marginLeft: moderateScale(10)}}>
            <Entypo name="menu" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>

          <Image
            source={require('../Assets/pratibha-logo-new.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={{marginRight: moderateScale(10)}}
            onPress={() => navigation.navigate('BellNotification')}>
            <MaterialIcons
              name="notifications"
              size={moderateScale(24)}
              color="red"
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.bottomRow,
            {
              margin: eng_lang_id && tel_lang_id ? wp('2%') : wp('3.4%'),
            },
          ]}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.title}>
              {selectedCategory || currentScreen}
            </Text>

            {(currentScreen === 'Notifications' ||
              currentScreen === 'నోటిఫికేష‌న్స్') &&
              filterIcons?.length > 0 && (
                <TouchableOpacity onPress={toggleModal}>
                  <Image
                    source={{uri: filterIcons[0]}}
                    style={styles.iconNextToTitle}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
          </View>

          <View style={styles.languageToggleWrapper}>
  {eng_lang_id && tel_lang_id ? (
    <View style={styles.languageToggle}>
      <Text style={styles.langText}>
        {LANGUAGE.data === 'english' ? 'ENG' : 'TEL'}
      </Text>
      <Switch
        value={LANGUAGE.data === 'english'}
        onValueChange={handleLanguageChange}
        trackColor={{false: '#ccc', true: '#1DA1F2'}}
        thumbColor="#fff"
        style={styles.switch}
      />
    </View>
  ) : (
    // Invisible placeholder to maintain layout
    <View style={styles.languageTogglePlaceholder} />
  )}
</View>

        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>

              <FlatList
                data={Categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.cat_id.toString()}
              />

              <TouchableOpacity
                onPress={toggleModal}
                style={styles.modalCloseButton}>
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
  safeArea: {
    backgroundColor: '#fff',
  },
  wrapper: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#c7eafb',
  },
  logo: {
    width: wp('50%'),
    height: hp('5%'),
    opacity: 0.9,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#000',
    height: hp('3%'),
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('1%'),
  },
  langText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: wp('2%'),
    fontSize: moderateScale(12),
  },
  switch: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
     marginHorizontal:wp(2),
  },
  iconNextToTitle: {
    width: moderateScale(15),
    height: moderateScale(15),
    marginLeft: wp('2%'),
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#1DA1F2',
    padding: 10,
    borderRadius: 5,
  },
  modalCloseText: {
    color: 'white',
    textAlign: 'center',
  },
  languageToggleWrapper: {
    minWidth: wp('20%'),
    alignItems: 'flex-end',
  },
  languageTogglePlaceholder: {
    height: hp('3%'),
    width: wp('18%'),
  },
  
});

export default Header;
