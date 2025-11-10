import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

const DeviceDetails = async () => {
  const deviceId = await DeviceInfo.getUniqueId();
  const deviceName = await DeviceInfo.getDeviceName();
  const deviceType = DeviceInfo.getSystemName(); // "Android" or "iOS"
  const deviceVersion = DeviceInfo.getSystemVersion(); // OS version
  const appVerName = DeviceInfo.getVersion(); // App version name
  const appVerCode = DeviceInfo.getBuildNumber(); // App version code
  // const networkType = await NetInfo.fetch().then(state => state.type); // Wifi/Cellular
  // ✅ Await the network info properly
  const netInfo = await NetInfo.fetch();
  const networkType = netInfo.type; // Should be 'wifi', 'cellular', etc.

  const userDetails = {
    device_id: deviceId,
    device_name: deviceName,
    network_type: networkType, 
    app_ver_name: appVerName,
    app_ver_code: appVerCode,
    device_type: deviceType,
    deviceversion: deviceVersion,
    ca_time: new Date().toISOString(), // Example current timestamp
    ca_value: '0',
    json: 'true',
  };

  return userDetails;
};

export default DeviceDetails;
