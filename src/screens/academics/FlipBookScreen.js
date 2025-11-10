import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import PageFlipper from '@thanhdong272/react-native-page-flipper';

const { width, height } = Dimensions.get('window');

const pages = [
  'https://i.postimg.cc/XND1h0bV/e-book-pages-to-jpg-0001.jpg',
  'https://i.postimg.cc/tJV3ww37/e-book-pages-to-jpg-0002.jpg',
  'https://i.postimg.cc/fRsP7fsH/e-book-pages-to-jpg-0003.jpg',
  'https://i.postimg.cc/hvxCTf54/e-book-pages-to-jpg-0004.jpg',
  'https://i.postimg.cc/R0FXGPDh/e-book-pages-to-jpg-0005.jpg',
  'https://i.postimg.cc/fLd7g1j9/e-book-pages-to-jpg-0006.jpg',
  'https://i.postimg.cc/Hx831rH7/e-book-pages-to-jpg-0007.jpg',
  'https://i.postimg.cc/qq8LgWNq/e-book-pages-to-jpg-0008.jpg',
  'https://i.postimg.cc/4yZc2y3N/e-book-pages-to-jpg-0009.jpg',
  'https://i.postimg.cc/zG3gc9qv/e-book-pages-to-jpg-0010.jpg',
];

export default function CurlBook() {
  return (
    <View style={styles.container}>
      <PageFlipper
        data={pages}
        pageSize={{ width, height }}
        renderPage={(uri) => (
          <Image
            source={{ uri }}
            style={styles.pageImage}
          />
        )}
        orientation="horizontal"   // 👈 horizontal flip (can change to 'vertical')
        portrait
        enableTouch={true}         // 👈 user can touch to flip
        duration={100}             // 👈 ultra-fast transition speed
        curlMode="soft"            // 👈 smoother, natural curl
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ccc' },
  pageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
