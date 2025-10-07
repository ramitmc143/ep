import DeviceInfo from 'react-native-device-info';

let deviceId = null;

export const initDeviceId = async () => {
  deviceId = await DeviceInfo.getUniqueId();
};

export const getDeviceId = () => deviceId;