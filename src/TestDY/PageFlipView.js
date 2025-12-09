// Way2NewsMixedUIFlipRefinedFixedSwapped_Inertia_Responsive.js
import React, {useState, useRef, memo} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

const {height, width} = Dimensions.get('window');
const HALF = Dimensions.get('window').height / 2;

const data = [
  {
    title: 'Global Market Trends',
    image: 'https://picsum.photos/800/600?random=1',
    shortDesc: 'Stocks rally as investors react to new policy updates.',
    longDesc:
      'Markets opened higher as traders anticipate easing monetary policies across global economies. Analysts suggest volatility may continue through Q4.',
  },
  {
    title: 'AI Reshapes Industries',
    image: 'https://picsum.photos/800/600?random=2',
    shortDesc: 'Automation boom leads to new opportunities and challenges.',
    longDesc:
      'From manufacturing to media, artificial intelligence is changing workflows. Experts predict 40% efficiency gains across key sectors by 2030.',
  },
  {
    title: 'SpaceX Mission Success',
    image: 'https://picsum.photos/800/600?random=3',
    shortDesc: 'Falcon 9 deploys 22 new Starlink satellites into orbit.',
    longDesc:
      'The mission marks SpaceX’s 95th successful flight this year, setting a record for rapid reuse of booster stages and efficient turnaround operations.',
  },
];

export default function Way2NewsMixedUIFlipRefinedFixedSwapped() {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [snap, setSnap] = useState({
    active: false,
    dir: null,
    current: null,
    next: null,
    prev: null,
  });

  const progress = useSharedValue(0);
  const direction = useSharedValue(null);
  const textFade = useSharedValue(1);

  // Locks
  const lockedPrevRef = useRef(null);
  const lockedBottomRef = useRef(null);

  const currentItem = snap.active && snap.current ? snap.current : data[index];
  const upcomingItem = snap.active && snap.next ? snap.next : data[nextIndex];
  const previousItem =
    snap.active && snap.prev
      ? snap.prev
      : data[(index - 1 + data.length) % data.length];

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

          if (direction.value === 'down') {
            lockedPrevRef.current =
              data[(index - 1 + data.length) % data.length];
            lockedBottomRef.current = data[index];
          } else {
            lockedPrevRef.current = null;
            lockedBottomRef.current = null;
          }
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
      if (direction.value === 'up' || direction.value === 'down') {
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
          if (dir === 'up') textFade.value = withTiming(0, {duration: 150});

          progress.value = withTiming(
            dir === 'up' ? 1 : -1,
            {duration: 400, easing: Easing.out(Easing.cubic)},
            finished => {
              if (finished) {
                progress.value = withDelay(
                  60,
                  withTiming(0, {duration: 0}, () => {
                    runOnJS(updateIndex)(dir);

                    // ✅ FIX: delay clearing direction/snap to stop flicker
                    runOnJS(() => {
                      setTimeout(() => {
                        direction.value = null;
                        setSnap(prev => ({...prev, active: false, dir: null}));
                        lockedPrevRef.current = null;
                        lockedBottomRef.current = null;
                      }, 120);
                    });

                    textFade.value = withTiming(1, {
                      duration: 400,
                      easing: Easing.out(Easing.cubic),
                    });
                  }),
                );
              }
            },
          );
        } else {
          progress.value = withTiming(
            0,
            {
              duration: 300 + Math.abs(velocity) / 10,
              easing: Easing.out(Easing.quad),
            },
            () => {
              direction.value = null;
              runOnJS(setSnap)(prev => ({...prev, active: false, dir: null}));
              lockedPrevRef.current = null;
              lockedBottomRef.current = null;
            },
          );
        }
      } else {
        progress.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        direction.value = null;
        lockedPrevRef.current = null;
        lockedBottomRef.current = null;
      }
    });

  const topAnimated = useAnimatedStyle(() => {
    let rotateX = 0;
    if (direction.value === 'up') {
      rotateX = interpolate(
        progress.value,
        [0.5, 1],
        [-90, 0],
        Extrapolate.CLAMP,
      );
    } else if (direction.value === 'down') {
      rotateX = interpolate(
        progress.value,
        [0, -1],
        [0, -180],
        Extrapolate.CLAMP,
      );
    }
    return {
      transform: [
        {perspective: 70000},
        {translateY: HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: -HALF / 2},
      ],
      backfaceVisibility: 'visible',
      zIndex: 5,
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
    } else if (direction.value === 'down') {
      rotateX = 0;
    }
    return {
      transform: [
        {perspective: 10000},
        {translateY: -HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: HALF / 2},
      ],
      backfaceVisibility: 'visible',
      zIndex: 4,
    };
  });

  const textAnimated = useAnimatedStyle(() => ({opacity: textFade.value}));

  const bgTopCurrentStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  const bgTopUpcomingStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));

  const bgBottomCurrentStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));

  const bgBottomUpcomingStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  const topBackContentOpacity = useAnimatedStyle(() => {
    if (direction.value === 'down') {
      return {
        opacity: interpolate(
          progress.value,
          [-0.5, -1],
          [0, 1],
          Extrapolate.CLAMP,
        ),
      };
    }
    return {opacity: 0};
  });

  const bottomBackContentOpacity = useAnimatedStyle(() => {
    if (direction.value === 'up') {
      return {
        opacity: interpolate(
          progress.value,
          [0.5, 1],
          [0, 1],
          Extrapolate.CLAMP,
        ),
      };
    }
    return {opacity: 0};
  });

  const topFrontImageCurrentOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));

  const topFrontImageUpcomingOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  if (!currentItem || !upcomingItem)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: '#fff'}}>Loading...</Text>
      </View>
    );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetector gesture={pan}>
        <View style={styles.container}>
          <StatusBar hidden />

          {/* Backgrounds */}
          <Animated.View
            style={[styles.half, styles.topHalf, bgTopCurrentStyle]}>
            <MixedCard
              item={snap.active && snap.current ? snap.current : currentItem}
              half="top"
            />
          </Animated.View>

          <Animated.View
            style={[styles.half, styles.topHalf, bgTopUpcomingStyle]}>
            <MixedCard
              item={snap.active && snap.next ? snap.next : upcomingItem}
              half="top"
            />
          </Animated.View>

          <Animated.View
            style={[styles.half, styles.bottomHalf, bgBottomCurrentStyle]}>
            <MixedCard
              item={
                lockedBottomRef.current
                  ? lockedBottomRef.current
                  : snap.active && snap.current
                  ? snap.current
                  : currentItem
              }
              half="bottom"
            />
          </Animated.View>

          <Animated.View
            style={[styles.half, styles.bottomHalf, bgBottomUpcomingStyle]}>
            <MixedCard
              item={snap.active && snap.next ? snap.next : upcomingItem}
              half="bottom"
            />
          </Animated.View>

          {/* Animated Faces */}
          <Animated.View style={[styles.half, styles.topHalf, topAnimated]}>
            <Animated.View
              style={[styles.absoluteFill, topFrontImageUpcomingOpacity]}>
              <MixedCard
                item={snap.active && snap.next ? snap.next : upcomingItem}
                half="top"
              />
            </Animated.View>

            <Animated.View
              style={[styles.absoluteFill, topFrontImageCurrentOpacity]}>
              <MixedCard
                item={snap.active && snap.current ? snap.current : currentItem}
                half="top"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.flipBackContent,
                styles.flipBackFace,
                topBackContentOpacity,
              ]}>
              <MixedCard
                item={
                  lockedPrevRef.current
                    ? lockedPrevRef.current
                    : direction.value === 'down'
                    ? previousItem
                    : snap.active && snap.prev
                    ? snap.prev
                    : previousItem
                }
                half="bottom"
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[styles.half, styles.bottomHalf, bottomAnimated]}>
            <Animated.View>
              <MixedCard
                item={snap.active && snap.current ? snap.current : currentItem}
                half="bottom"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.flipBackContent,
                styles.flipBackFace,
                bottomBackContentOpacity,
              ]}>
              <MixedCard
                item={snap.active && snap.next ? snap.next : upcomingItem}
                half="top"
              />
            </Animated.View>
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const MixedCard = memo(function MixedCard({item, half, animatedStyle}) {
  if (!item) return null;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: half === 'top' ? '#000' : '#fff',
          justifyContent: half === 'top' ? 'flex-end' : 'flex-start',
        },
      ]}>
      {half === 'top' ? (
        item.image ? (
          <Image source={{uri: item.image}} style={styles.image} />
        ) : null
      ) : (
        <Animated.View style={[styles.textContainer, animatedStyle]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.short}>{item.shortDesc}</Text>
          <Text style={styles.long}>{item.longDesc}</Text>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  half: {
    position: 'absolute',
    width: wp('100%'),
    height: '50%',
    overflow: 'hidden',
  },
  topHalf: {top: 0},
  bottomHalf: {bottom: 0},
  card: {width: '100%', height: '100%'},
  absoluteFill: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  flipBackContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  flipBackFace: {transform: [{rotateX: '180deg'}]},
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
  textContainer: {
    padding: moderateScale(20),
    backgroundColor: '#fff',
    height: '100%',
  },
  title: {
    fontSize: scale(17),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  short: {
    fontSize: scale(15),
    color: '#333',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  long: {
    fontSize: scale(14),
    color: '#555',
    textAlign: 'center',
    marginTop: verticalScale(6),
    lineHeight: verticalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
