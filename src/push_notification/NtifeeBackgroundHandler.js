// src/push_notification/NotifeeBackgroundHandler.js
import notifee, { EventType } from '@notifee/react-native';

/**
 * Simple in-memory store that any other module can read.
 */
let initialNotification = null;
export const consumeInitialNotification = () => {
  const tmp = initialNotification;
  initialNotification = null;
  return tmp;
};

/**
 * This top-level registration is executed as soon as the
 * file is imported – even in a headless background run.
 * 
 */

console.log('✅ Background handler registered');
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[NOTIFEE BACKGROUND EVENT]', type, detail);

  if (
    type === EventType.PRESS &&
    detail.notification?.data?.newslink
  ) {
    // Persist the data for the UI thread to use later
    initialNotification = detail.notification;
  }
});


// // src/notifeeBackgroundHandler.js
// import notifee, { EventType } from '@notifee/react-native';
// import { navigationRef } from '../navigation/NavigationService'; // Ensure this exists

// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification?.data?.newslink) {
//     // Save the link to a global variable or async storage to be used after navigation is ready
//     global.newslinkFromKilledState = detail.notification.data.newslink;
//   }
// });
