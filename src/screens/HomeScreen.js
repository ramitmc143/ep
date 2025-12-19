import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import ReusableScreen from './ReusableScreen';
import Header from '../components/Header'; // YOUR EXISTING HEADER
import {getDeviceId} from '../deviceDetails/DeviceId';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

/* ---- BottomTab overlay style (no layout shift) ---- */
const BASE_TAB_BAR_STYLE = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: hp('8%'),
  borderTopWidth: 0,
  elevation: 0,
  zIndex: 1000,
};

const HomeScreen = ({route}) => {
  const {api_link} = route?.params || {};

  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );

  const navigation = useNavigation();
  const device_id = getDeviceId();

  const [isAdVisible, setIsAdVisible] = useState(true);

  /* ----- Floating chrome state ----- */
  const [showChrome, setShowChrome] = useState(true);
  const chromeAnim = useSharedValue(1);

  /* ----- Auto-hide timer ----- */
  const autoHideTimer = useRef(null);

  const params = {
    device_id,
    lang_id: langId,
  };

  /* ---- Ensure navigator chrome never takes layout space ---- */
  useEffect(() => {
    const drawerNav = navigation.getParent();

    if (drawerNav) {
      drawerNav.setOptions({headerShown: false});
    }

    navigation.setOptions({
      tabBarStyle: {
        ...BASE_TAB_BAR_STYLE,
        opacity: 1,
      },
    });

    return () => {
      if (drawerNav) {
        drawerNav.setOptions({headerShown: true});
      }

      navigation.setOptions({
        tabBarStyle: {
          ...BASE_TAB_BAR_STYLE,
          opacity: 1,
        },
      });
    };
  }, [navigation]);

  /* ---- Animate chrome + control tab opacity ---- */
  useEffect(() => {
    chromeAnim.value = withTiming(showChrome ? 1 : 0, {duration: 220});

    navigation.setOptions({
      tabBarStyle: {
        ...BASE_TAB_BAR_STYLE,
        opacity: showChrome ? 1 : 0, // opacity only → NO resize
      },
    });
  }, [showChrome, chromeAnim, navigation]);

  /* ---- Auto-hide after 2 seconds ---- */
  const startAutoHide = useCallback(() => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }

    autoHideTimer.current = setTimeout(() => {
      setShowChrome(false);
    }, 2000);
  }, []);

  /* ---- Called from ReusableScreen tap ---- */
  const handleToggleChromeFromChild = useCallback(
    nextVisible => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }

      setShowChrome(nextVisible);

      if (nextVisible) {
        startAutoHide();
      }
    },
    [startAutoHide],
  );

  /* ---- Cleanup ---- */
  useEffect(() => {
    return () => {
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
    };
  }, []);

  /* ---- Header animation style ---- */
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chromeAnim.value,
    transform: [
      {
        translateY: interpolate(
          chromeAnim.value,
          [0, 1],
          [-20, 0],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  if (!device_id) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ---- FULL SCREEN FLIP CONTENT ---- */}
      <ReusableScreen
        apiLink={api_link}
        langId={langId}
        responseKey="latest_Notification"
        dataKeyMap={{
          id: 'lt_notif_id',
          title: 'lt_notif_title',
          shortDesc: 'lt_notif_short_desc',
          longDesc: 'lt_notif_long_desc',
          image: 'lt_notif_thumb_image',
          date: 'lt_ntif_cret_date',
          share_link: 'share_link',
        }}
        shouldDispatch={false}
        params={params}
        isAdVisible={isAdVisible}
        setIsAdVisible={setIsAdVisible}
        controlledShowChrome={showChrome}
        onToggleChrome={handleToggleChromeFromChild}
      />

      {/* ---- FLOATING HEADER (YOUR EXISTING COMPONENT) ---- */}
      <Animated.View
        style={[styles.headerOverlay, headerAnimatedStyle]}
        pointerEvents={showChrome ? 'auto' : 'none'}>
        <Header />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1200,
  },
});

export default HomeScreen;
  