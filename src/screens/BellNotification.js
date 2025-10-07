import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

import { getDeviceId } from '../deviceDetails/DeviceId';

const {width, height} = Dimensions.get('window');

const BellNotification = ({navigation}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const device_id = getDeviceId();

        const response = await axios.post(
          'https://pratibhaapp.eenadu.net/pratibhamobileapp/v1/push_notifications.php',
          {
            device_id:device_id, // Replace with actual device ID
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('response from bell', response);

        const data = response.data;
        setNotifications(data.latest_Notification);
        console.log('response bell', data.latest_Notification);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={width * 0.06} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>నోటిఫికేషన్స్</Text>
        {/* <TouchableOpacity>
          <Icon name="filter-variant" size={width * 0.06} color="#000" />
        </TouchableOpacity> */}
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={{marginTop: height * 0.03}}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.lt_notif_id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.notificationItem}
              onPress={() =>
                navigation.navigate('CustomWebView', {
                  url: item.lt_notif_url,
                  title: 'Notifications',
                })
              }>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.lt_notif_title.trim()}</Text>
                <Text style={styles.time}>{item.created_at}</Text>
              </View>
              <Image
                source={{uri: item.lt_notif_thumb_image}}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: width * 0.05,
    color: '#000',
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    paddingRight: width * 0.03,
  },
  title: {
    fontSize: width * 0.04,
    color: '#000',
  },
  time: {
    fontSize: width * 0.03,
    color: '#555',
    marginTop: height * 0.005,
  },
  image: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: 5,
  },
});

export default BellNotification;
