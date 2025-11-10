import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import PageCurlView from './PageCurlView';

const {width, height} = Dimensions.get('window');

const CurlScreen = () => {
  return (
    <View style={styles.container}>
      <PageCurlView
        style={styles.curlView}
        imageUri="https://picsum.photos/400/600" // test image
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  curlView: {
    width: width * 0.8,
    height: height * 0.6,
  },
});

export default CurlScreen;
