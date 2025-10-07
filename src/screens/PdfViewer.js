import React from 'react';
import {View, Dimensions, StyleSheet ,ActivityIndicator} from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewer = ({route}) => {
  const {pdfUrl} = route.params;
  console.log("pdf",pdfUrl)

  return (
    <View style={styles.container}>
      <Pdf
        trustAllCerts={false}
        source={{uri: pdfUrl}}
        style={{flex: 1}}
        onLoadComplete={numberOfPages =>
          console.log(`Loaded PDF with ${numberOfPages} pages`)
        }
        onError={error => console.log(error)}
        activityIndicator={<ActivityIndicator size="large" color="#ff6b3d" />}
      />
    </View>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});
