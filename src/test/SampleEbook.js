// import React from 'react';
// import {View, StyleSheet, requireNativeComponent, Text} from 'react-native';

// const NativePageFlip = requireNativeComponent('NativePageFlip');

// const SampleEbook = () => {
//   return (
//     <View style={styles.container}>
//       {/* <Text style={{color: 'white', position: 'absolute', top: 50, zIndex: 1}}>
//         Loading Native View...
//       </Text> */}

//       <NativePageFlip
//         style={styles.flipView}
//         pdfUrl="https://www.sldttc.org/allpdf/21583473018.pdf"
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: 'black'},
//   flipView: {flex: 1},
// });

// export default SampleEbook;

import React from 'react';
import {requireNativeComponent, StyleSheet, View} from 'react-native';

const NativePageFlip = requireNativeComponent('NativePageFlip');

export default function SampleEbook() {
  const images = [
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

  return (
    <View style={styles.container}>
      <NativePageFlip style={styles.nativeView} imageUrls={images} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  nativeView: {flex: 1},
});
