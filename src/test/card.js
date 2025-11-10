import React from 'react';
import { SafeAreaView } from 'react-native';
import ReusableScreen from '../screens/ReusableScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ReusableScreen
        front={require('../Assets/pratibha-logo.png')}
        back={require('../Assets/maskImage.png')}
      />
    </SafeAreaView>
  );
}
  // pdfUrl = 'https://www.sldttc.org/allpdf/21583473018.pdf'