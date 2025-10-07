import React from 'react';
import {WebView} from 'react-native-webview';

const PrivacyPolicyScreen = ({route}) => {
  const {api_link} = route.params;

  return <WebView source={{uri: api_link}} />;
};

export default PrivacyPolicyScreen;
