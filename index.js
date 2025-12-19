import 'react-native-gesture-handler'; // ✅ keep this early as well
import 'react-native-reanimated'; // ✅ must be FIRST (before any React import)
import {AppRegistry, LogBox, BackHandler} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import crashlytics from '@react-native-firebase/crashlytics';
// import notifee, {EventType} from '@notifee/react-native';
import './src/push_notification/NtifeeBackgroundHandler';
// import {navigationRef} from '../eenaduPratibha/src/navigation/NavigationService';

// let initialNotification = null;

// // Ignore harmless warnings
// LogBox.ignoreAllLogs(true);

// // Catch fatal errors globally
// ErrorUtils.setGlobalHandler(error => {
//   console.error('Global Error:', error);
//   BackHandler.exitApp(); // Exit the app silently
// });

// // Handle JS Errors
// const handleGlobalError = (error, isFatal) => {
//   console.log('Global error caught:', error);

//   crashlytics().recordError(error);

//   if (isFatal) {
//     crashlytics().crash();
//   }
// };

// global.ErrorUtils.setGlobalHandler(handleGlobalError);

// crashlytics().setCrashlyticsCollectionEnabled(true);
// console.log('Crashlytics enabled');

// notifee.onBackgroundEvent(async ({type, detail}) => {
//   console.log('[NOTIFEE BACKGROUND EVENT]', type, detail);
//   const data = detail.notification?.data;

//   if (type === EventType.PRESS && data?.newslink) {
//     // Store it or handle it later
//     initialNotification = {data};
//     navigationRef.current?.navigate('CustomWebView', {
//       url: data.newslink,
//       title: 'Notifications',
//     });
//   }
// });

AppRegistry.registerComponent(appName, () => App);