import React, { useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const APPSCScreen = ({ route }) => {
  const { api_link } = route.params;
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loader}
        />
      )}
      <WebView
        source={{ uri: api_link }}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default APPSCScreen;
