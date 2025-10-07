import React, {useLayoutEffect, useState, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  BackHandler,
  Linking,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CustomWebView = ({navigation, route}) => {
  const {url, title, nextScreen} = route.params;
  const [headerTitle, setHeaderTitle] = useState(title);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({title: headerTitle});
  }, [navigation, headerTitle]);

  useEffect(() => {
    // Clear cookies to prevent redirect loop
    CookieManager.clearAll(true).then(() => {
      console.log('Cookies cleared before WebView load');
    });
    

    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      } else {
        handleClose();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, [canGoBack]);

  const handleClose = () => {
    if (nextScreen) {
      navigation.navigate(nextScreen);
    } else {
      navigation.navigate('MainTabs'); // 👈 Change 'Home' if needed
    }
  };
  

  const onNavigationStateChange = navState => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <View style={{flex: 1}}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={{width:'10%'}}>
          <Text style={styles.cancelButton}>X</Text>
        </TouchableOpacity>
        <Text style={styles.titleText} numberOfLines={10}>
          {headerTitle}
        </Text>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{
          uri: url,
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }}
        style={{flex: 1}}
        startInLoadingState={true}
        onNavigationStateChange={onNavigationStateChange}
        onError={(e) => {
          console.log("Redirect error, opening in browser.",e);
          Linking.openURL(url);
        }}
        onHttpError={e => console.log('HTTP error:', e.nativeEvent)}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        cacheEnabled={false}
        domStorageEnabled={true}
        incognito={true}
        javaScriptEnabled={true}
        useWebKit={true}
        userAgent="Mozilla/5.0 (Linux; Android 11; Mobile; rv:102.0) Gecko/20100101 Firefox/102.0"
      />
    </View>
  );
};

const styles = {
  header: {
    // height: hp('7%'),
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cancelButton: {
    color: 'black',
    fontSize: wp('6%'),
    marginLeft: wp('2%'),
  },
  titleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: wp('4.5%'),
    flexShrink: 1,
    textAlign: 'right',
    flex: 1,
    marginHorizontal: wp('3%'),
  },
};

export default CustomWebView;
