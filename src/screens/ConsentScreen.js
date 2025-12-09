
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeviceId } from '../deviceDetails/DeviceId';

const ConsentScreen = ({ navigation }) => {
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);

  const insets = useSafeAreaInsets();

  const handleCheckBoxChange = () => {
    setIsChecked(!isChecked);
  };

  const fetchTermsContent = async () => {
    setLoadingTerms(true);
    try {
      const device_id = getDeviceId();
      const response = await fetch('https://pratibhaapp.eenadu.net/pratibhamobileapp/v1/terms_conditions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id }),
      });
      const json = await response.json();
      if (json.status === 1 && json.latest_Notification?.length > 0) {
        setTermsContent(json.latest_Notification[0].lt_notif_long_desc);
      } else {
        setTermsContent('No terms content available.');
      }
    } catch (error) {
      setTermsContent('Failed to load Terms and Conditions.');
    } finally {
      setLoadingTerms(false);
    }
  };

  const fetchPrivacyContent = async () => {
    setLoadingPrivacy(true);
    try {
      const device_id = getDeviceId();
      const response = await fetch('https://pratibhaapp.eenadu.net/pratibhamobileapp/v1/privacy_policy.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id }),
      });
      const json = await response.json();
      if (json.status === 1 && json.latest_Notification?.length > 0) {
        setPrivacyContent(json.latest_Notification[0].lt_notif_long_desc);
      } else {
        setPrivacyContent('No privacy policy content available.');
      }
    } catch (error) {
      setPrivacyContent('Failed to load Privacy Policy.');
    } finally {
      setLoadingPrivacy(false);
    }
  };

  const togglePrivacy = () => {
    if (!privacyVisible) {
      fetchPrivacyContent();
    }
    setPrivacyVisible(!privacyVisible);
    setTermsVisible(false); // collapse terms
  };
  
  const toggleTerms = () => {
    if (!termsVisible) {
      fetchTermsContent();
    }
    setTermsVisible(!termsVisible);
    setPrivacyVisible(false); // collapse privacy
  };

  const handleContinue = async () => {
    if (!isChecked) return;
    await AsyncStorage.setItem('isFirstLaunch', 'false');
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { marginBottom: insets.bottom }]}>
      <View style={styles.container}>
        {/* Top Content */}
        <View style={styles.topContent}>
          <Image
            source={require('../Assets/pratibha-logo-splash.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>
            Please read the following before proceed
          </Text>
        </View>

        {/* Scrollable Terms & Privacy Section */}
        <View style={styles.expandableContainer}>
          {/* Terms */}
          <TouchableOpacity style={styles.item} onPress={toggleTerms}>
            <Icon name="description" size={24} color="#2196F3" />
            <Text style={styles.itemText}>Terms and Conditions</Text>
            <Icon name={termsVisible ? 'expand-less' : 'expand-more'} size={24} />
          </TouchableOpacity>
          {termsVisible && (
            loadingTerms ? (
              <ActivityIndicator size="small" color="#2196F3" style={{ marginVertical: 10 }} />
            ) : (
              <ScrollView style={styles.scrollBox}>
                <Text style={styles.contentText}>{termsContent}</Text>
              </ScrollView>
            )
          )}

          {/* Privacy */}
          <TouchableOpacity style={styles.item} onPress={togglePrivacy}>
            <Icon name="info" size={24} color="#2196F3" />
            <Text style={styles.itemText}>Privacy Policy</Text>
            <Icon name={privacyVisible ? 'expand-less' : 'expand-more'} size={24} />
          </TouchableOpacity>
          {privacyVisible && (
            loadingPrivacy ? (
              <ActivityIndicator size="small" color="#2196F3" style={{ marginVertical: 10 }} />
            ) : (
              <ScrollView style={styles.scrollBox}>
                <Text style={styles.contentText}>{privacyContent}</Text>
              </ScrollView>
            )
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={handleCheckBoxChange}>
            <Icons
              name={isChecked ? 'check-square' : 'square-o'}
              size={24}
              color={isChecked ? '#fe697c' : '#808080'}
            />
            <View style={styles.textContainer}>
              <Text style={styles.checkboxLabel}>
                I agree{' '}
                <Text style={styles.linkText} onPress={toggleTerms}>
                  Terms and Conditions
                </Text>{' '}
                and{' '}
                <Text style={styles.linkText} onPress={togglePrivacy}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isChecked ? '#2196F3' : '#ccc' },
            ]}
            disabled={!isChecked}
            onPress={handleContinue}>
            <Text style={[
              styles.buttonText,
              { color: isChecked ? '#fff' : '#888' },
            ]}>
              {isChecked ? 'Continue' : 'Please agree To Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ConsentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  topContent: {
    alignItems: 'center',
    padding: wp('5%'),
  },
  logo: {
    height: hp('10%'),
    width: wp('30%'),
    marginBottom: hp('2%'),
  },
  heading: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  expandableContainer: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingVertical: hp('1.2%'),
    justifyContent: 'space-between',
  },
  itemText: {
    fontWeight: 'bold',
    fontSize: wp('4%'),
    flex: 1,
    marginHorizontal: wp('2%'),
    textAlign: 'center',
  },
  scrollBox: {
    maxHeight: hp('65%'),
    marginVertical: hp('1%'),
  },
  contentText: {
    fontSize: wp('3.7%'),
    color: 'black',
  },
  bottomSection: {
    padding: wp('5%'),
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1%'),
  },
  textContainer: {
    marginLeft: wp('3.5%'),
    flex: 1,
  },
  checkboxLabel: {
    fontSize: wp('3.7%'),
    color: '#000',
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  button: {
    padding: hp('1.5%'),
    width: '100%',
    borderRadius: wp('7%'),
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
});

