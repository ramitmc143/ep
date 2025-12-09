import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import DeviceInfo from 'react-native-device-info';

const HALF = Dimensions.get('window').height / 2;

export default function  HomeScreenFlip ({route}) {
    const { api_link } = route?.params || {};
    
    console.log('Home screen api_link--', api_link);

  const langId = useSelector(state =>
    state.language.data === 'english' ? 1 : 2,
  );

  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [loading, setLoading] = useState(true);

  const progress = useSharedValue(0);
  const direction = useSharedValue(null);

  const [snap, setSnap] = useState({
    active: false,
    dir: null,
    current: null,
    next: null,
    prev: null,
  });

    const device_id = 123;

  // ---------------- API CALL ----------------
    useEffect(() => {
    if (!device_id) return;

    const params = {
      device_id: device_id,
      lang_id: langId,
    };

    fetch(api_link, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params),
    })
      .then(res => res.json())
      .then(json => {
        const list = json?.latest_Notification || [];

        const mapped = list.map(item => ({
          id: item.lt_notif_id,
          title: item.lt_notif_title,
          shortDesc: item.lt_notif_short_desc,
          longDesc: item.lt_notif_long_desc,
          image: item.lt_notif_thumb_image,
          date: item.lt_ntif_cret_date,
          share_link: item.share_link,
        }));

        setData(mapped);

        setSnap({
          active: false,
          dir: null,
          current: mapped[0],
          next: mapped[1],
          prev: mapped[mapped.length - 1],
        });

        setLoading(false);
      })
      .catch(err => console.log(err));
  }, [device_id, api_link]);

  // ---------------- Index Update Logic ----------------
  const updateIndex = dir => {
    setIndex(prev => {
      let newIndex;
      if (dir === 'up') newIndex = (prev + 1) % data.length;
      else newIndex = (prev - 1 + data.length) % data.length;

      const next =
        dir === 'up'
          ? (newIndex + 1) % data.length
          : (newIndex - 1 + data.length) % data.length;

      setNextIndex(next);

      setSnap(prevSnap => ({
        ...prevSnap,
        current: data[newIndex],
        next: data[next],
        prev: data[(newIndex - 1 + data.length) % data.length],
      }));

      return newIndex;
    });
  };

  // ---------------- Gesture ----------------
  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (!direction.value) {
        if (e.translationY < -20) direction.value = 'up';
        else if (e.translationY > 20) direction.value = 'down';

        if (direction.value) {
          runOnJS(setSnap)({
            active: true,
            dir: direction.value,
            current: data[index],
            next: data[(index + 1) % data.length],
            prev: data[(index - 1 + data.length) % data.length],
          });
        }
      }

      if (direction.value === 'up') {
        progress.value = interpolate(
          e.translationY,
          [0, -HALF],
          [0, 1],
          Extrapolate.CLAMP,
        );
      } else if (direction.value === 'down') {
        progress.value = interpolate(
          e.translationY,
          [0, HALF],
          [0, -1],
          Extrapolate.CLAMP,
        );
      }
    })

    .onEnd(e => {
      if (!direction.value) return;

      const dir = direction.value;
      const velocity = e.velocityY;
      const threshold = 0.5;

      const momentum =
        dir === 'up'
          ? progress.value + Math.min(Math.abs(velocity) / 2000, 0.3)
          : progress.value - Math.min(Math.abs(velocity) / 2000, 0.3);

      const shouldFlip =
        (dir === 'up' && momentum > threshold) ||
        (dir === 'down' && momentum < -threshold);

      if (shouldFlip) {
        progress.value = withTiming(
          dir === 'up' ? 1 : -1,
          {duration: 400, easing: Easing.out(Easing.cubic)},
          finished => {
            if (finished) {
              progress.value = withDelay(
                50,
                withTiming(0, {duration: 0}, () => {
                  runOnJS(updateIndex)(dir);

                  runOnJS(() => {
                    setTimeout(() => {
                      direction.value = null;
                      setSnap(prev => ({...prev, active: false, dir: null}));
                    }, 120);
                  });
                }),
              );
            }
          },
        );
      } else {
        progress.value = withTiming(0, {duration: 300}, () => {
          direction.value = null;
          runOnJS(setSnap)(prev => ({...prev, active: false, dir: null}));
        });
      }
    });

  // ---------------- Animations ----------------
  const topAnimated = useAnimatedStyle(() => {
    let rotateX = 0;
    if (direction.value === 'up') {
      rotateX = interpolate(
        progress.value,
        [0.5, 1],
        [-90, 0],
        Extrapolate.CLAMP,
      );
    }
    return {
      transform: [
        {perspective: 10000},
        {translateY: HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: -HALF / 2},
      ],
    };
  });

  const bottomAnimated = useAnimatedStyle(() => {
    let rotateX = 0;
    if (direction.value === 'up') {
      rotateX = interpolate(
        progress.value,
        [0, 0.5],
        [0, 90],
        Extrapolate.CLAMP,
      );
    }
    return {
      transform: [
        {perspective: 10000},
        {translateY: -HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: HALF / 2},
      ],
    };
  });

  // ---------------- SAFE CURRENT ITEM ----------------
  const current = snap.current || data[index] || {};
  const next = snap.next || data[nextIndex] || {};

  if (loading || !current) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetector gesture={pan}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          {/* TOP IMAGE HALF */}
          <Animated.View style={[styles.half, styles.topHalf, topAnimated]}>
            <Image
              source={
                current?.image
                  ? {uri: String(current.image)}
                  : {uri: 'https://dummyimage.com/600x400/000/fff'}
              }
              style={styles.image}
            />
          </Animated.View>

          {/* BOTTOM TEXT HALF */}
          <Animated.View
            style={[styles.half, styles.bottomHalf, bottomAnimated]}>
            <View style={styles.textBox}>
              <Text style={styles.title}>{current.title}</Text>
              <Text style={styles.short}>{current.shortDesc}</Text>
              <Text style={styles.long}>{current.longDesc}</Text>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  half: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    overflow: 'hidden',
  },
  topHalf: {top: 0},
  bottomHalf: {bottom: 0},
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
  textBox: {padding: 20, backgroundColor: '#fff', height: '100%'},
  title: {fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#000'},
  short: {fontSize: 16, color: '#444', marginTop: 8, textAlign: 'center'},
  long: {fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center'},
});
