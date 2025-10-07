
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SendFcmToBackend } from '../sendFcmToBackend/SendFcmToBackend';

// export const getFcmToken = async () => {
//   try {
//     // Get stored token
//     const storedToken = await AsyncStorage.getItem('fcmToken');
    
//     // Get new token from Firebase
//     const newToken = await messaging().getToken();

//     if (!storedToken) {
//       console.log('🚀 First-time install: Sending token to backend...');
//     } else if (storedToken !== newToken) {
//       console.log('🔄 Token changed: Updating backend...');
//     } else {
//       console.log('✅ Token is up-to-date:', storedToken);
//     }

//     // Always store and send token to backend
//     await AsyncStorage.setItem('fcmToken', newToken);
//     await SendFcmToBackend(newToken); // Always send to backend

//     return newToken;
//   } catch (error) {
//     console.log('❌ Error handling FCM Token:', error);
//     return null;
//   }
// };








// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SendFcmToBackend } from '../sendFcmToBackend/SendFcmToBackend';

// export const getFcmToken = async () => {
//   try {
//     // Get stored token
//     let storedToken = await AsyncStorage.getItem('fcmToken');
    
//     // Get new token from Firebase
//     const newToken = await messaging().getToken();

//     if (!storedToken) {
//       console.log('🚀 First-time install: Sending token to backend...');
//       await AsyncStorage.setItem('fcmToken', newToken);
//       await SendFcmToBackend(newToken); // Send to backend
//       return newToken;
//     } else if (storedToken == newToken) {
//       console.log('🔄 Token changed: Updating backend...');
//       await AsyncStorage.setItem('fcmToken', newToken);
//       await SendFcmToBackend(newToken); // Send to backend
//       return newToken;
//     } else if (storedToken !== newToken) {
//       console.log('🔄 Token changed: Updating backend...');
//       await AsyncStorage.setItem('fcmToken', newToken);
//       await SendFcmToBackend(newToken); // Send to backend
//       return newToken;
    
//      } else {
//       console.log('✅ Token is up-to-date:', storedToken);
//     }

//     return storedToken;
//   } catch (error) {
//     console.log('❌ Error handling FCM Token:', error);
//   }
// };
// import DeviceDetails from '../deviceDetails/DeviceDetails';
// import { SendFcmToBackend } from '../sendFcmToBackend/SendFcmToBackend';

// const getFcmToken = async () => {
//   try {
//     const token = await messaging().getToken();
//     console.log('FCM Token:', token);

//     const deviceInfo = await DeviceDetails();
//     const result = await SendFcmToBackend(token, deviceInfo);
//     console.log('SendFcmToBackend result:', result); // See if this logs 'Data sent successfully'

//     return token;
//   } catch (error) {
//     console.log('Error in generateFcmToken:', error);
//   }
// };
