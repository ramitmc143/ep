// ✅ Navigation Root - Optimized & Organized

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, View, Image, Share, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

// ✅ Screens
import HomeScreen from '../screens/HomeScreen';
import PdfViewer from '../screens/PdfViewer';
import SplashScreen from '../components/SplashScreen';
import Header from '../components/Header';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import DSC from '../screens/DSC';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import LatestNotification from '../screens/LatestNotification';
import BellNotification from '../screens/BellNotification';
import EducationalInformation from '../screens/EducationalInformation';
import TGPSCScreen from '../screens/TGPSCScreen';
import APPSCScreen from '../screens/APPSCScreen';
import CurrentAffairsScreen from '../screens/CurrentAffairsScreen';
import CareerAndCoursesScreen from '../screens/CareerAndCoursesScreen';
import ConsentScreen from '../screens/ConsentScreen';
import CustomWebView from '../screens/CustomWebView';
import LoginScreen from '../components/LoginScreen';
import RegistrationScreen from '../components/RegistrationScreen';
import AcademicStack from '../screens/academics/AcademicStack';
import FlipBookScreen from '../screens/academics/FlipBookScreen';
// ✅ Redux / Firebase
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedScreen } from '../redux/selectedScreenSlice/selectedScreenSlice';
import { setLanguageStatus } from '../redux/language_id_status_slice/language_id_status_Slice';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import { navigationRef } from './NavigationService';

// ✅ Notification Setup
import PushNotificationSetup from '../push_notification/PushNotificationSetup';

// ----------------------------------------------------------------------------
// 🔹 MAPPINGS
// ----------------------------------------------------------------------------

const screenComponentMap = {
  1: HomeScreen,
  2: EducationalInformation,
  3: LatestNotification,
  4: DSC,
  6: AcademicStack,
  8: TermsAndConditionsScreen,
  9: TermsOfUseScreen,
  10: PrivacyPolicyScreen,
  11: AppInfoScreen,
  13: CurrentAffairsScreen,
  14: CareerAndCoursesScreen,
  15: APPSCScreen,
  16: TGPSCScreen,
};

const getComponentByName = (api_link, common_id) => {
  const ScreenComponent = screenComponentMap[common_id] || HomeScreen;
  return props => <ScreenComponent {...props} route={{ ...props.route, params: { api_link } }} />;
};

// ----------------------------------------------------------------------------
// 🔹 API Menu Fetch
// ----------------------------------------------------------------------------

const fetchMenu = langId =>
  axios
    .post('https://pratibha.eenadu.net/pratibhamobileapp/v1/stickymenu.php', { language_id: langId })
    .then(r => r.data.menu || [])
    .catch(() => []);

const fetchDrawerMenu = langId =>
  axios
    .post('https://pratibha.eenadu.net/pratibhamobileapp/v1/navmenu.php', { language_id: langId })
    .then(r => r.data.menu || [])
    .catch(() => []);

// ----------------------------------------------------------------------------
// 🔹 Drawer Content
// ----------------------------------------------------------------------------

const CustomDrawerContent = ({ drawerMenuItems, ...props }) => (
  <DrawerContentScrollView contentContainerStyle={{ flex: 1, paddingBottom: hp('2%') }} {...props}>
    <View style={{ flex: 1 }}>
      <DrawerItemList {...props} />

      {/* Share Button */}
      {drawerMenuItems.map(item =>
        item.type === 'Share' ? (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              Share.share({
                message: 'Check out this amazing app: https://pratibha.eenadu.net/',
                title: 'Share App',
              })
            }
            style={styles.shareButton}
          >
            <Image source={{ uri: item.icon }} style={styles.shareIcon} />
            <Text style={styles.shareText}>{item.short_name}</Text>
          </TouchableOpacity>
        ) : null
      )}
    </View>

    {/* Footer */}
    <View style={styles.footerContainer}>
      <Text style={styles.copyrightText}>
        © <Text style={styles.sitename}>Eenadu Pratibha</Text> All Rights Reserved
      </Text>
      <Text style={styles.credits}>
        Powered by <Text style={styles.link}>Margadarsi Computers</Text>
      </Text>
    </View>
  </DrawerContentScrollView>
);

// ----------------------------------------------------------------------------
// 🔹 Bottom Tabs
// ----------------------------------------------------------------------------

const BottomTab = createBottomTabNavigator();

const BottomTabScreens = React.memo(({ allTabItems, drawerMenuItems }) => {
  const dispatch = useDispatch();
  const langId = useSelector(state => (state.language.data === 'english' ? 1 : 2));
  const drawerNames = drawerMenuItems.map(d => d.short_name);

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
        tabBarItemStyle: { width: wp('22%') },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#555',
      }}
    >
      {allTabItems.map((item, index) => {
        const hide = drawerNames.includes(item.short_name);
        const Component = getComponentByName(item.api_link, item.common_id);

        const Wrapper = props => {
          useFocusEffect(
            useCallback(() => {
              const screenName =
                index === 0 ? (langId === 1 ? 'Latest Updates' : 'లేటెస్ట్ ‌అప్‌డేట్స్‌') : item.short_name;

              dispatch(setSelectedScreen(screenName));
              dispatch(setLanguageStatus({ eng_lang_id: item.eng_lang_id, tel_lang_id: item.tel_lang_id }));

              if (item.type === 'External Browser') {
                props.navigation.navigate('CustomWebView', {
                  url: item.api_link,
                  title: item.short_name,
                  nextScreen: allTabItems[0]?.short_name,
                });
              }
            }, [])
          );

          return item.type === 'External Browser' ? null : <Component {...props} />;
        };

        return (
          <BottomTab.Screen
            key={item.id}
            name={item.short_name}
            component={Wrapper}
            options={{
              tabBarButton: hide ? () => null : undefined,
              tabBarLabel: () => null,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconWrap}>
                  <Image source={{ uri: item.icon }} style={styles.tabIcon} />
                  <Text style={[styles.tabText, { color: focused ? '#ff0' : '#fff' }]}>{item.short_name}</Text>
                </View>
              ),
            }}
          />
        );
      })}
    </BottomTab.Navigator>
  );
});

// ----------------------------------------------------------------------------
// 🔹 Drawer Navigator
// ----------------------------------------------------------------------------

const Drawer = createDrawerNavigator();

const DrawerNavigator = React.memo(({ allTabItems, drawerMenuItems }) => {
  const dispatch = useDispatch();
  const tabNames = allTabItems.map(i => i.short_name);
  const tabId = allTabItems.filter(i => i.common_id === 3);
  const langId = useSelector(state => (state.language.data === 'english' ? 1 : 2));

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} drawerMenuItems={drawerMenuItems} />}
      screenOptions={{ header: () => <Header tabId={tabId} />, drawerStyle: { backgroundColor: '#fff' } }}
      screenListeners={({ navigation }) => ({
        drawerItemPress: e => {
          const name = e.target?.split('-')[0];
          if (tabNames.includes(name)) {
            e.preventDefault();
            navigation.navigate('MainTabs', { screen: name });
          }
        },
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        children={() => <BottomTabScreens allTabItems={allTabItems} drawerMenuItems={drawerMenuItems} />}
        options={{ title: langId === 1 ? 'Eenadu Pratibha' : 'ఈనాడు ప్రతిభ' }}
      />

      {drawerMenuItems
        .filter(item => item.type !== 'Share')
        .map(item => {
          const Component = getComponentByName(item.api_link, item.common_id);

          const Wrapper = props => {
            useFocusEffect(() => dispatch(setSelectedScreen(item.short_name)));
            return <Component {...props} />;
          };

          return (
            <Drawer.Screen
              key={item.id}
              name={item.short_name}
              component={Wrapper}
              options={{
                drawerLabel: () => (
                  <View style={styles.drawerItem}>
                    <Image source={{ uri: item.icon }} style={styles.drawerIcon} />
                    <Text style={styles.drawerText}>{item.short_name}</Text>
                  </View>
                ),
              }}
            />
          );
        })}
    </Drawer.Navigator>
  );
});

// ----------------------------------------------------------------------------
// 🔹 Main App
// ----------------------------------------------------------------------------

const RootStack = createNativeStackNavigator();

const RouteApp = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [allTabItems, setAllTabItems] = useState([]);
  const [drawerMenuItems, setDrawerMenuItems] = useState([]);
  const [initialNotificationUrl, setInitialNotificationUrl] = useState(null);
  const langId = useSelector(state => (state.language.data === 'english' ? 1 : 2));
  const crashlytics = getCrashlytics();

  // ✅ Load Menu + Push Data
  useEffect(() => {
    (async () => {
      try {
        const first = await AsyncStorage.getItem('isFirstLaunch');
        setIsFirstLaunch(first === null);

        const [menu, drawer] = await Promise.all([fetchMenu(langId), fetchDrawerMenu(langId)]);
        const merged = [...menu, ...drawer].filter(
          (v, i, a) => a.findIndex(t => t.short_name === v.short_name) === i
        );
        setAllTabItems(merged);
        setDrawerMenuItems(drawer);

        const notif = await messaging().getInitialNotification();
        if (notif?.data?.newslink) setInitialNotificationUrl(notif.data.newslink);

        const notif2 = await notifee.getInitialNotification();
        if (notif2?.notification?.data?.newslink) setInitialNotificationUrl(notif2.notification.data.newslink);
      } finally {
        setTimeout(() => setIsSplash(false), 1000);
      }
    })();
  }, [langId]);

  // ✅ Background Notification
  useEffect(
    () =>
      messaging().onNotificationOpenedApp(msg => {
        if (msg?.data?.newslink) setInitialNotificationUrl(msg.data.newslink);
      }),
    []
  );

  if (isSplash) return <SplashScreen />;

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={state => state && log(crashlytics, `Navigated to: ${state.routes[state.index].name}`)}
    >
      <PushNotificationSetup />

      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch && <RootStack.Screen name="ConsentScreen" component={ConsentScreen} />}

        <RootStack.Screen
          name="MainTabs"
          children={() => <DrawerNavigator allTabItems={allTabItems} drawerMenuItems={drawerMenuItems} />}
        />

        <RootStack.Screen name="PdfViewer" component={PdfViewer} />
        <RootStack.Screen name="BellNotification" component={BellNotification} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegistrationScreen} />
        <RootStack.Screen name="CustomWebView" component={CustomWebView} initialParams={{ url: initialNotificationUrl }} />
        <RootStack.Screen 
  name="FlipBookScreen" 
  component={FlipBookScreen} 
  options={{ headerShown: false }} 
/>

      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// ----------------------------------------------------------------------------
// 🔹 Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  shareButton: { flexDirection: 'row', alignItems: 'center', paddingLeft: 30, paddingVertical: 12 },
  shareIcon: { width: 20, height: 20, marginRight: 8 },
  shareText: { fontSize: 16 },

  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('22%'),
    height: hp('8%'),
    backgroundColor: '#00aeef',
  },
  tabIcon: { width: wp('4.5%'), height: wp('4.5%'), margin: hp('0.5%') },
  tabText: { fontSize: wp('3%'), fontWeight: 'bold', textAlign: 'center', width: wp('30%') },

  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10 },
  drawerIcon: { width: 20, height: 20, marginRight: 8 },
  drawerText: { fontSize: 16 },

  footerContainer: { padding: wp('4%'), borderTopWidth: 1, borderColor: 'grey', backgroundColor: '#f8f8f8' },
  copyrightText: { fontSize: wp('3%'), textAlign: 'center' },
  sitename: { fontWeight: 'bold' },
  credits: { fontSize: wp('3%'), textAlign: 'center' },
  link: { color: '#007bff', textDecorationLine: 'underline' },
});

export default React.memo(RouteApp);
