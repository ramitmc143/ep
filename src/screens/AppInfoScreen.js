import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const AppInfoScreen = ({user}) => {
  // Assuming 'user' is passed as a prop or from context
  const [appInfo, setAppInfo] = useState({
    uniqueId: '',
    name: '', // This will hold the person's name
    brand: '',
    appName: '',
    systemName: '',
    readableVersion: '',
  });

  useEffect(() => {
    const fetchAppInfo = async () => {
      const uniqueId = DeviceInfo.getUniqueId(); // Unique ID
      const brand = DeviceInfo.getBrand(); // Brand
      const appName = DeviceInfo.getApplicationName(); // App Name
      const systemName = DeviceInfo.getSystemName(); // System Name
      const readableVersion = DeviceInfo.getReadableVersion(); // Readable Version

      // Assuming 'user' has a 'name' field with the person's name
      const name = user ? user.name : 'Unknown'; // Get the user's name if available

      setAppInfo({
        uniqueId,
        name,
        brand,
        appName,
        systemName,
        readableVersion,
      });
    };

    fetchAppInfo();
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>App Information</Text>

      <View style={styles.card}>
        <InfoRow label="Unique ID" value={appInfo.uniqueId} />
        <InfoRow label="Name" value={appInfo.name} />
        <InfoRow label="Brand" value={appInfo.brand} />
        <InfoRow label="App Name" value={appInfo.appName} />
        <InfoRow label="System Name" value={appInfo.systemName} />
        <InfoRow label="Readable Version" value={appInfo.readableVersion} />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5', // light grey background
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});

export default AppInfoScreen;
