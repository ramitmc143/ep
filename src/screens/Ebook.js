import React, {useRef, useState} from 'react';
import {Dimensions, StyleSheet, View, PanResponder} from 'react-native';
import Pdf from 'react-native-pdf';

const {width, height} = Dimensions.get('window');

export default function EbookView() {
  const pdfRef = useRef(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const swipeHandledRef = useRef(false);

  const source = {uri: 'bundle-assets://book.pdf'};

  const handleNext = () => {
    if (page < totalPages) {
      pdfRef.current.setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      pdfRef.current.setPage(page - 1);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const {dx, dy} = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2;
      },
      onPanResponderGrant: () => {
        swipeHandledRef.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        if (swipeHandledRef.current) return;
        const {dx} = gestureState;
        if (dx <= -2) {
          swipeHandledRef.current = true;
          handleNext();
        } else if (dx >= 2) {
          swipeHandledRef.current = true;
          handlePrev();
        }
      },
      onPanResponderRelease: () => {
        swipeHandledRef.current = false;
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View
        style={styles.pdfWrapper}
        {...panResponder.panHandlers} // detect tiny horizontal gestures
      >
        <Pdf
          ref={pdfRef}
          source={source}
          horizontal={true} // allow smooth native horizontal swipe
          enablePaging={true} // enable native page snapping
          enableScroll={true} // allow smooth scroll
          onLoadComplete={n => setTotalPages(n)}
          onPageChanged={(p, n) => setPage(p)}
          style={styles.pdf}
          page={page}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  pdfWrapper: {flex: 1},
  pdf: {width: width, height: height},
});
