import React, {useEffect, useState} from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { ActivityIndicator } from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

const SplashScreen = () => {
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await DeviceInfo.getVersion();
      setAppVersion(version);
    };

    fetchVersion();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../Assets/pratibha-logo-splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="small"
        color="#FFFFFF"
        style={{marginTop: verticalScale(20)}}
      />
      <Text style={styles.versionText}>v{appVersion}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E3A55',
  },
  logo: {
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  versionText: {
    position: 'absolute',
    bottom: verticalScale(20),
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    opacity: 0.7,
  },
});

export default SplashScreen;
