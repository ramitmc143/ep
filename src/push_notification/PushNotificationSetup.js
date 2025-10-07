import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import {navigationRef} from '../navigation/NavigationService';
import DeviceDetails from '../deviceDetails/DeviceDetails';
import {SendFcmToBackend} from '../sendFcmToBackend/SendFcmToBackend';

const PushNotificationSetup = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      await createNotificationChannel();
      await requestUserPermission();
      handleInitialNotification();
    };

    init();

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground FCM Message Received:', remoteMessage);

      const {newstitle} = remoteMessage.data || {};
      const {body} = remoteMessage.notification || {};
      const newslink =
      remoteMessage.data?.newslink ||
      remoteMessage.notification?.android?.clickAction || ''; // fallback
      const image =
      remoteMessage.data?.image ||
      remoteMessage.notification?.android?.imageUrl || '';
      
      await notifee.cancelAllNotifications();
      await notifee.displayNotification({
        title: newstitle || 'Notification',
        body: body || 'Tap to view',
        android: {
          channelId: 'default',
          largeIcon: image,
          style: {
            type: AndroidStyle.BIGPICTURE,
            picture: image,
          },
          pressAction: {
            id: 'default',
          },
        },
        data: {newslink},
      });
    });

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📥 Notification opened from background:', remoteMessage);
        const {newslink} = remoteMessage.data || {};
        if (newslink) {
          navigation.navigate('CustomWebView', {url: newslink});
        }
      });

   let isNavigating = false;

const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
  async ({ type, detail }) => {
    console.log('📲 Foreground Notification Tap Event:', { type, detail });

    if (
      type === EventType.PRESS &&
      detail.notification?.data?.newslink &&
      !isNavigating
    ) {
      isNavigating = true;
      try {
        await navigation.navigate('CustomWebView', {
          url: detail.notification.data.newslink,
        });
      } catch (error) {
        console.log('Navigation error:', error);
      } finally {
        setTimeout(() => {
          isNavigating = false;
        }, 1000); // Slight delay to prevent rapid repeat navigation
      }
    }
  }
);


    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeNotifeeForeground();
    };
  }, [navigation]);

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await getFcmToken();
    }
  };

  const getFcmToken = async () => {
    try {
      const fcm_id = await messaging().getToken();
      const deviceInfo = await DeviceDetails();
      await SendFcmToBackend(fcm_id, deviceInfo);
    } catch (error) {
      console.log('❌ Error in getFcmToken:', error);
    }
  };
  const handleInitialNotification = async () => {
    // FCM initial notification (app launched from killed state)
    const fcmInitialNotification = await messaging().getInitialNotification();

    if (fcmInitialNotification?.data?.newslink) {
      console.log(
        '🚀 Opened from FCM Notification (killed state):',
        fcmInitialNotification,
      );
      setTimeout(() => {
        navigationRef.current?.navigate('CustomWebView', {
          url: fcmInitialNotification.data.newslink,
        });
      }, 100);
      return;
    }

    // Notifee initial notification (app launched from killed state)
    const notifeeInitialNotification = await notifee.getInitialNotification();

    if (notifeeInitialNotification?.notification?.data?.newslink) {
      console.log(
        '🚀 Opened from Notifee Notification (killed state):',
        notifeeInitialNotification,
      );
      setTimeout(() => {
        navigationRef.current?.navigate('CustomWebView', {
          url: notifeeInitialNotification.notification.data.newslink,
        });
      }, 100);
    }
  };

  return null;
};

export default PushNotificationSetup;
