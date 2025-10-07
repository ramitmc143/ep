import React from 'react';
import { WebView } from 'react-native-webview';

const TermsOfUseScreen = ({ route }) => {
  const { api_link } = route.params;

  return <WebView source={{ uri: api_link }} />;
};

export default TermsOfUseScreen;
