import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Text,
  View,
  Image,
  Share,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import HomeScreen from '../screens/HomeScreen';
import PdfViewer from '../screens/PdfViewer';
import SplashScreen from '../components/SplashScreen';
import Header from '../components/Header';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import DSC from '../screens/DSC';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedScreen} from '../redux/selectedScreenSlice/selectedScreenSlice';
import LatestNotification from '../screens/LatestNotification';
import BellNotification from '../screens/BellNotification';
import EducationalInformation from '../screens/EducationalInformation';
import {setLanguageStatus} from '../redux/language_id_status_slice/language_id_status_Slice';
import TGPSCScreen from '../screens/TGPSCScreen';
import APPSCScreen from '../screens/APPSCScreen';
import CurrentAffairsScreen from '../screens/CurrentAffairsScreen';
import CareerAndCoursesScreen from '../screens/CareerAndCoursesScreen';
import CustomWebView from '../screens/CustomWebView';
import {getCrashlytics, log} from '@react-native-firebase/crashlytics';
import {navigationRef} from './NavigationService';
import ConsentScreen from '../screens/ConsentScreen';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationSetup from '../push_notification/PushNotificationSetup';
import notifee from '@notifee/react-native';
import LoginScreen from '../components/LoginScreen';
import RegistrationScreen from '../components/RegistrationScreen';
import AcademicScreen from '../screens/academics/AcademicScreen';
import SubjectBooksScreen from '../screens/academics/SubjectBooksScreen';
import CategoryDetailScreen from '../screens/academics/CategoryDetailsScreen';
import PapersScreen from '../screens/academics/PaperScreen';
import FlipBookScreen from '../screens/academics/FlipBookScreen';

const RootStack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  const {drawerMenuItems = [], navigation} = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{flex: 1, paddingBottom: hp('2%')}}>
      <View style={{flex: 1}}>
        {/* Regular Screens */}
        <DrawerItemList {...props} />

        {/* Add Share item */}
        {drawerMenuItems.map((item, index) => {
          if (item.type === 'Share') {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  Share.share({
                    message:
                      'Check out this amazing app: https://pratibha.eenadu.net/',
                    title: 'Share App',
                  }).catch(err => console.log('Error sharing app:', err));                     
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 30,
                  paddingVertical: 12,
                }}>
                <Image
                  source={{uri: item.icon}}
                  style={{width: 20, height: 20, marginRight: 8}}
                  resizeMode="contain"
                />
                <Text style={{fontSize: 16}}>{item.short_name}</Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.copyrightText}>
          © <Text style={styles.sitename}>Eenadu Pratibha </Text> All Rights
          Reserved
        </Text>
        <Text style={styles.credits}>
          Powered by <Text style={styles.link}>Margadarsi Computers</Text>
        </Text>
      </View>
    </DrawerContentScrollView>
  );
};

const screenComponentMap = {
  //common id and screen name
  1: HomeScreen,
  2: EducationalInformation,
  3: LatestNotification,
  4: DSC,
  6: AcademicScreen,
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
  return props => (
    <ScreenComponent {...props} route={{...props.route, params: {api_link}}} />
  );
};

const fetchMenu = async langId => {
  try {
    const response = await axios.post(
      'https://pratibha.eenadu.net/pratibhamobileapp/v1/stickymenu.php',
      {language_id: langId},
    );
    return response.data.menu || [];
  } catch (err) {
    console.log('Error loading bottom tab menu:', err);
    return [];
  }
};

const fetchDrawerMenu = async langId => {
  try {
    const response = await axios.post(
      'https://pratibha.eenadu.net/pratibhamobileapp/v1/navmenu.php',
      {language_id: langId},
    );
    return response.data.menu || [];
  } catch (err) {
    console.log('Error loading drawer menu:', err);
    return [];
  }
};

const BottomTabScreens = ({allTabItems, drawerMenuItems}) => {
  const drawerNames = drawerMenuItems.map(item => item.short_name);
  const dispatch = useDispatch();
  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          textAlign: 'center',
        },
        tabBarItemStyle: {
          width: wp('22%'),
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#555',
      }}>
      {allTabItems.map((item, index) => {
        const isHiddenInTab = drawerNames.includes(item.short_name);
        const WrappedComponent = props => {
          useFocusEffect(
            useCallback(() => {
              const screenName =
                index === 0
                  ? langId === 1
                    ? 'Latest Updates'
                    : 'లేటెస్ట్ ‌అప్‌డేట్స్‌'
                  : item.short_name;

              dispatch(setSelectedScreen(screenName));

              dispatch(
                setLanguageStatus({
                  eng_lang_id: item.eng_lang_id,
                  tel_lang_id: item.tel_lang_id,
                }),
              );

              if (item.type === 'External Browser') {
                props.navigation.navigate('CustomWebView', {
                  url: item.api_link,
                  title: item.short_name || 'Web Page',
                  nextScreen: allTabItems[0]?.short_name,
                });
              }
            }, [dispatch]),
          );

          if (item.type === 'External Browser') return null;
          const Component = getComponentByName(item.api_link, item.common_id);
          return <Component {...props} />;
        };

        return (
          <BottomTab.Screen
            key={item.id}
            name={item.short_name}
            component={WrappedComponent}
            options={{
              title: item.short_name,
              tabBarLabel: () => null, // Hide default label
              tabBarIcon: ({color, focused}) => (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: wp('22%'),
                    height: hp('8%'),
                    paddingHorizontal: wp('1%'),
                    paddingVertical: wp('4%'),
                    // borderRadius: 10,
                    backgroundColor: '#00aeef',
                    // backgroundColor: focused ? '' : '#00008b', // highlight background when focused
                  }}>
                  <Image
                    source={{
                      uri: item.icon,
                    }}
                    style={{
                      width: wp('4.5%'),
                      height: wp('4.5%'),
                      margin: hp('0.5%'),
                      // tintColor: focused ? '#007bff' : '#555', // optional: color tint change
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: focused ? '#ff0' : 'white',
                      //color:"white",
                      fontSize: wp('3%'),
                      // fontWeight: focused ? 'bold' : 'normal',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      lineHeight: hp('2%'),
                      paddingHorizontal: wp('1%'),
                      width: wp('30%'),
                    }}
                    numberOfLines={2}>
                    {item.short_name}
                  </Text>
                </View>
              ),

              tabBarButton: isHiddenInTab ? () => null : undefined,
            }}
          />
        );
      })}
    </BottomTab.Navigator>
  );
};

const DrawerNavigator = ({allTabItems, drawerMenuItems}) => {
  const dispatch = useDispatch();
  const tabNames = allTabItems.map(item => item.short_name);
  const tabId = allTabItems.filter(item => item.common_id === 3);
  const NullComponent = () => null;

  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );

  return (
    <Drawer.Navigator
      drawerContent={props => (
        <CustomDrawerContent {...props} drawerMenuItems={drawerMenuItems} />
      )}
      screenOptions={({route}) => ({
        header: () => <Header tabId={tabId} />,
        drawerStyle: {backgroundColor: '#fff'},
      })}
      screenListeners={({navigation, route}) => ({
        drawerItemPress: e => {
          const screenName = e.target?.split('-')[0];

          if (screenName?.includes('separator')) {
            e.preventDefault();
            navigation.closeDrawer();
            return;
          }

          if (tabNames.includes(screenName)) {
            e.preventDefault();
            navigation.navigate('MainTabs', {screen: screenName});
          }
        },
      })}>
      <Drawer.Screen
        name="MainTabs"
        children={() => (
          <BottomTabScreens
            allTabItems={allTabItems}
            drawerMenuItems={drawerMenuItems}
          />
        )}
        options={{
          title: langId === 1 ? 'Eenadu Pratibha' : 'ఈనాడు ప్రతిభ',
          drawerLabelStyle: {
            fontWeight: 'bold',
            fontSize: wp('4%'),
          },
        }}
      />
      {drawerMenuItems
        .filter(item => item.type !== 'Share') // ⛔ Exclude Share here
        .map((item, index) => {
          const WrappedDrawerComponent = props => {
            useFocusEffect(
              useCallback(() => {
                dispatch(setSelectedScreen(item.short_name));
              }, [dispatch]),
            );

            const Component = getComponentByName(item.api_link, item.common_id);
            return <Component {...props} />;
          };

          return (
            <React.Fragment key={item.id}>
              <Drawer.Screen
                name={item.short_name}
                component={WrappedDrawerComponent}
                options={{
                  drawerLabel: () => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                      }}>
                      <Image
                        source={{
                          uri:
                            item.icon ||
                            'https://default-icon-url.com/icon.png',
                        }}
                        style={{width: 20, height: 20, marginRight: 8}}
                        resizeMode="contain"
                      />
                      <Text style={{fontSize: 16}}>{item.short_name}</Text>
                    </View>
                  ),
                }}
              />

              {index === 3 && (
                <Drawer.Screen
                  name={`separator-after-${index}`}
                  component={NullComponent}
                  options={{
                    drawerLabel: () => (
                      <View
                        style={{
                          backgroundColor: '#D1D5DB',
                          marginHorizontal: -40,
                          borderTopWidth: 1,
                          borderColor: 'grey',
                        }}
                      />
                    ),
                  }}
                />
              )}
              {index === 6 && (
                <Drawer.Screen
                  name={`separator-after-${index}`}
                  component={() => null}
                  options={{
                    drawerLabel: () => (
                      <View
                        style={{
                          backgroundColor: '#D1D5DB',
                          marginHorizontal: -40,
                          borderTopWidth: 1,
                          borderColor: 'grey',
                        }}
                      />
                    ),
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
    </Drawer.Navigator>
  );
};

const RouteApp = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [drawerMenuItems, setDrawerMenuItems] = useState([]);
  const [allTabItems, setAllTabItems] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  // New state to hold the initial notification URL if app launched from killed notification
  const [initialNotificationUrl, setInitialNotificationUrl] = useState(null);

  const crashlytics = getCrashlytics();
  const LANGUAGE = useSelector(state => state.language);
  const langId = LANGUAGE.data === 'english' ? 1 : 2;

  const getActiveRouteName = state => {
    if (!state || !state.routes) return null;
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isFirstLaunchValue = await AsyncStorage.getItem('isFirstLaunch');

        if (isFirstLaunchValue === null) {
          // First launch, show consent screen
          setIsFirstLaunch(true);
        } else {
          // If value is 'true' or 'false', handle accordingly
          setIsFirstLaunch(isFirstLaunchValue === 'true');
        }

        // Load menus
        const [menu, drawer] = await Promise.all([
          fetchMenu(langId),
          fetchDrawerMenu(langId),
        ]);

        const combined = [...menu, ...drawer];
        const unique = combined.filter(
          (item, index, self) =>
            index === self.findIndex(t => t.short_name === item.short_name),
        );

        setMenuItems(menu);
        setDrawerMenuItems(drawer);
        setAllTabItems(unique);

        const fcmInitialNotification =
          await messaging().getInitialNotification();
        console.log('FCM Initial Notification:', fcmInitialNotification);

        if (fcmInitialNotification?.data?.newslink) {
          console.log(
            'FCM notification newslink:',
            fcmInitialNotification.data.newslink,
          );
          setInitialNotificationUrl(fcmInitialNotification.data.newslink);
        } else {
          const notifeeInitialNotification =
            await notifee.getInitialNotification();
          console.log(
            'Notifee Initial Notification:',
            notifeeInitialNotification,
          );

          if (notifeeInitialNotification?.notification?.data?.newslink) {
            console.log(
              'Notifee notification newslink:',
              notifeeInitialNotification.notification.data.newslink,
            );
            setInitialNotificationUrl(
              notifeeInitialNotification.notification.data.newslink,
            );
          }
        }
      } catch (err) {
        console.log('Error during initialization:', err);
        setIsFirstLaunch(false); // fallback to main tabs
      } finally {
        setLoadingMenus(false);
        setTimeout(() => {
          setIsSplash(false);
        }, 1000);
      }
    };

    initializeApp();
  }, [langId]);

  // 2. Background (app in background, notification tapped)
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background:', remoteMessage);
      if (remoteMessage?.data?.newslink) {
        setInitialNotificationUrl(remoteMessage.data.newslink);
      }
    });
    return unsubscribe;
  }, []);

  // 3. Foreground notifications (optional)
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      // show your in-app notification UI here if needed
    });
    return unsubscribe;
  }, []);

  // if (loadingMenus || isFirstLaunch === null) {
  //   // Show loader while loading menus or waiting for first launch flag
  //   return (
  //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <ActivityIndicator size="large" color="#007bff" />
  //     </View>
  //   );
  // }

  if (isSplash) {
    // Show splash screen after loader is done
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={state => {
        if (!state) return;
        const currentRoute = getActiveRouteName(state);
        log(crashlytics, `Navigated to: ${currentRoute}`);
      }}>
      <PushNotificationSetup />
      <RootStack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={
          initialNotificationUrl   
            ? 'CustomWebView'
            : isFirstLaunch
            ? 'ConsentScreen'
            : 'MainTabs'
        }>
        <RootStack.Screen name="ConsentScreen" component={ConsentScreen} />

        <RootStack.Screen
          name="MainTabs"
          children={() => (
            <DrawerNavigator
              allTabItems={allTabItems}
              drawerMenuItems={drawerMenuItems}
            />
          )}
        />

        <RootStack.Screen
          name="PdfViewer"
          component={PdfViewer}
          options={{headerShown: false, title: 'PDF'}}
        />
        <RootStack.Screen
          name="BellNotification"
          component={BellNotification}
          options={{headerShown: false}}
        />
          <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
            <RootStack.Screen
          name="Register"
          component={RegistrationScreen}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="CustomWebView"
          component={CustomWebView}
          options={{headerShown: false}}
          initialParams={{url: initialNotificationUrl}} // pass url as param
        />
   
        <RootStack.Screen
          name="SubjectBooksScreen"
          component={SubjectBooksScreen}
        />
        <RootStack.Screen
          name="CategoryDetailScreen"
          component={CategoryDetailScreen}
        />
          <RootStack.Screen
          name="PapersScreen"
          component={PapersScreen}
        />
           <RootStack.Screen
          name="FlipBookScreen"
          component={FlipBookScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    padding: wp('4%'),
    borderTopWidth: 1,
    borderColor: 'grey',
    backgroundColor: '#f8f8f8',
  },
  copyrightText: {
    fontSize: wp('3%'),
    color: '#555',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
  },
  sitename: {
    fontWeight: 'bold',
  },
  credits: {
    fontSize: wp('3%'),
    color: '#555',
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
export default RouteApp;
