// InitialNotificationHandler.js
import { navigationRef } from '../navigation/NavigationService';

let initialNotificationData = null;

export const setInitialNotification = (data) => {
  initialNotificationData = data;
};

export const tryProcessInitialNotification = () => {
  if (navigationRef.current?.isReady() && initialNotificationData) {
    const { data, notification } = initialNotificationData;

    navigationRef.current.navigate('CustomWebView', {
      url: data.newslink,
      title: 'Notifications',
    });

    initialNotificationData = null;
  } else {
    // Retry after 300ms if navigation not ready
    setTimeout(tryProcessInitialNotification, 300);
  }
};



