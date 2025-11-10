
import React, { useState, useEffect } from 'react';
import { View ,ActivityIndicator } from 'react-native';
import ReusableScreen from './ReusableScreen';
import { useSelector } from 'react-redux';
import { getDeviceId } from '../deviceDetails/DeviceId';


const LatestNotification = ({ route }) => {
  const [isAdVisible, setIsAdVisible] = useState(true);

  const { api_link } = route?.params || {};
  console.log("api_link",api_link)

  const deviceId = getDeviceId();

  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );

  const selectedCategoryId = useSelector(
    state => state.selectedCategory.selectedCategoryId
  );

 

  // Wait for deviceId to load before rendering
  if (!deviceId) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const params = {
    device_id: deviceId,
    lang_id: langId,
    cat_id: selectedCategoryId,
  };

  return (
    <View style={{ flex: 1 }}>
      <ReusableScreen
        apiLink={`${api_link}?category=${selectedCategoryId ?? 27}`}
        langId={langId}
        responseKey="latest_Notification"
        dataKeyMap={{
          id: 'lt_notif_id',
          title: 'lt_notif_title',
          shortDesc: 'lt_notif_short_desc',
          longDesc: 'lt_notif_long_desc',
          image: 'lt_notif_thumb_image',
          date: 'lt_ntif_cret_date',
          share_link: 'share_link',
        }}
        shouldDispatch={true}
        params={params}
        isAdVisible={isAdVisible}
        setIsAdVisible={setIsAdVisible}
      />
    </View>
  );
};

export default LatestNotification;

