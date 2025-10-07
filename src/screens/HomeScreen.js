import React, {useState} from 'react';
import {View, ActivityIndicator} from 'react-native'; // Ensure View is imported correctly
import ReusableScreen from './ReusableScreen'; // Ensure this import path is correct
import {useSelector} from 'react-redux';
import {getDeviceId} from '../deviceDetails/DeviceId';

const HomeScreen = ({route}) => {
  const {api_link} = route?.params || {}; // Destructure route params
  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );
  const [isAdVisible, setIsAdVisible] = useState(true);

  const device_id = getDeviceId();

  if (!device_id) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const params = {
    device_id: device_id,
    lang_id: langId,
  };

  return (
    <View style={{flex: 1}}>
      <ReusableScreen
        apiLink={api_link}
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
        shouldDispatch={false} // just a boolean passed as a prop
        params={params}
         isAdVisible={isAdVisible}
        setIsAdVisible={setIsAdVisible}
      />
    </View>
  );
};

export default HomeScreen;
