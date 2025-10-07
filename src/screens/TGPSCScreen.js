import React from 'react';
import { WebView } from 'react-native-webview';

const TGPSCScreen = ({ route }) => {
  const { api_link } = route.params;

  return <WebView source={{ uri: api_link }}
    javaScriptEnabled={false}
    domStorageEnabled={false} />;
};

export default TGPSCScreen;
