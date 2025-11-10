import 'react-native-gesture-handler'; // ✅ keep this early as well
import 'react-native-reanimated'; // ✅ must be FIRST (before any React import)
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Store } from './src/redux/store/Store';
import ErrorBoundary from './src/errorBoundary/ErrorBoundary';
import RouteApp from './src/navigation/RouteApp';
// import PushNotificationSetup from './src/push_notification/PushNotificationSetup';
import { StatusBar, View, Platform, Text } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';
import mobileAds from 'react-native-google-mobile-ads';
import { initDeviceId } from './src/deviceDetails/DeviceId';
import FullScreenBook from './src/screens/FullScreenBook';
import Way2NewsBendWorking from './src/screens/Way2NewsBendWorking';


const AppContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,

      }}
    >
      <StatusBar
        hidden={false}
        barStyle="dark-content"
        backgroundColor="#c7eafb"
      />
      <Provider store={Store}>
        <ErrorBoundary>
          <RouteApp />
        </ErrorBoundary>
      </Provider>
    </View>
  );
};

const App = () => {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('Google Mobile Ads initialized');
      });

    // In-app update logic for Android
    const checkForUpdates = async () => {
      if (Platform.OS === 'android') {
        const inAppUpdates = new SpInAppUpdates(false); // false = production mode

        try {
          const result = await inAppUpdates.checkNeedsUpdate();

          if (result.shouldUpdate) {
            const updateOptions = {
              updateType: IAUUpdateKind.FLEXIBLE, // or IAUUpdateKind.IMMEDIATE
            };

            await inAppUpdates.startUpdate(updateOptions);
          }
        } catch (error) {
          console.warn('In-app update check failed:', error);
        }
      }
    };

    checkForUpdates();
  }, []);

  useEffect(() => {
    initDeviceId()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;


