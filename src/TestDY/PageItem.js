// // Way2NewsMixedUIFlipRefinedFixedSwapped.js
// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import {
//   Gesture,
//   GestureDetector,
//   GestureHandlerRootView,
// } from 'react-native-gesture-handler';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   runOnJS,
// } from 'react-native-reanimated';
// import {Easing, withDelay} from 'react-native-reanimated';

// const {height, width} = Dimensions.get('window');
// const HALF = height / 2;

// const data = [
//   {
//     title: 'Global Market Trends',
//     image: 'https://picsum.photos/800/600?random=1',
//     shortDesc: 'Stocks rally as investors react to new policy updates.',
//     longDesc:
//       'Markets opened higher as traders anticipate easing monetary policies across global economies. Analysts suggest volatility may continue through Q4.',
//   },
//   {
//     title: 'AI Reshapes Industries',
//     image: 'https://picsum.photos/800/600?random=2',
//     shortDesc: 'Automation boom leads to new opportunities and challenges.',
//     longDesc:
//       'From manufacturing to media, artificial intelligence is changing workflows. Experts predict 40% efficiency gains across key sectors by 2030.',
//   },
//   {
//     title: 'SpaceX Mission Success',
//     image: 'https://picsum.photos/800/600?random=3',
//     shortDesc: 'Falcon 9 deploys 22 new Starlink satellites into orbit.',
//     longDesc:
//       'The mission marks SpaceX’s 95th successful flight this year, setting a record for rapid reuse of booster stages and efficient turnaround operations.',
//   },
// ];

// export default function Way2NewsMixedUIFlipRefinedFixedSwapped() {
//   const [index, setIndex] = useState(0);
//   const [nextIndex, setNextIndex] = useState(1);
//   const [snap, setSnap] = useState({
//     active: false,
//     dir: null,
//     current: null,
//     next: null,
//     prev: null,
//   });

//   const progress = useSharedValue(0);
//   const direction = useSharedValue(null);
//   const textFade = useSharedValue(1);
//   // Index will only update after full flip completes to avoid mid-animation content jitter

//   const currentItem = data[index];
//   const upcomingItem = data[nextIndex];
//   const previousItem = data[(index - 1 + data.length) % data.length];

//   const updateIndex = dir => {
//     setIndex(prev => {
//       let newIndex;
//       if (dir === 'up') newIndex = (prev + 1) % data.length;
//       else newIndex = (prev - 1 + data.length) % data.length;

//       const next =
//         dir === 'up'
//           ? (newIndex + 1) % data.length
//           : (newIndex - 1 + data.length) % data.length;

//       setNextIndex(next);
//       return newIndex;
//     });
//   };

//   const pan = Gesture.Pan()
//     .onUpdate(e => {
//       if (!direction.value) {
//         if (e.translationY < -20) direction.value = 'up';
//         else if (e.translationY > 20) direction.value = 'down';
//         if (direction.value) {
//           runOnJS(setSnap)({
//             active: true,
//             dir: direction.value,
//             current: data[index],
//             next: data[(index + 1) % data.length],
//             prev: data[(index - 1 + data.length) % data.length],
//           });
//         }
//       }

//       if (direction.value === 'up') {
//         progress.value = interpolate(
//           e.translationY,
//           [0, -HALF],
//           [0, 1],
//           Extrapolate.CLAMP,
//         );
//       } else if (direction.value === 'down') {
//         progress.value = interpolate(
//           e.translationY,
//           [0, HALF],
//           [0, -1],
//           Extrapolate.CLAMP,
//         );
//       }
//     })
//     .onEnd(() => {
//       if (direction.value === 'up' || direction.value === 'down') {
//         const dir = direction.value;
//         const threshold = 0.5; // halfway (90 degrees)

//         const shouldFlip =
//           (dir === 'up' && progress.value > threshold) ||
//           (dir === 'down' && progress.value < -threshold);

//         if (shouldFlip) {
//           // Crossed halfway → complete flip and change item
//           if (dir === 'up') textFade.value = withTiming(0, {duration: 150});

//           progress.value = withTiming(
//             dir === 'up' ? 1 : -1,
//             {duration: 400, easing: Easing.out(Easing.cubic)},
//             finished => {
//               if (finished) {
//                 runOnJS(updateIndex)(dir);
//                 progress.value = withDelay(
//                   100,
//                   withTiming(0, {duration: 0}, () => {
//                     direction.value = null;
//                     runOnJS(setSnap)(prev => ({
//                       ...prev,
//                       active: false,
//                       dir: null,
//                     }));
//                     textFade.value = withTiming(1, {
//                       duration: 400,
//                       easing: Easing.out(Easing.cubic),
//                     });
//                   }),
//                 );
//               }
//             },
//           );
//         } else {
//           // Didn’t cross halfway → revert to original
//           progress.value = withTiming(
//             0,
//             {duration: 400, easing: Easing.out(Easing.cubic)},
//             () => {
//               direction.value = null;
//               runOnJS(setSnap)(prev => ({
//                 ...prev,
//                 active: false,
//                 dir: null,
//               }));
//             },
//           );
//         }
//       } else {
//         // Not enough gesture movement
//         progress.value = withTiming(0, {
//           duration: 250,
//           easing: Easing.out(Easing.cubic),
//         });
//         direction.value = null;
//       }
//     });


//   // ---- TOP HALF (was bottom’s logic) ----
//   const topAnimated = useAnimatedStyle(() => {
//     let rotateX = 0;

//     if (direction.value === 'up') {
//       // previously bottom unfolds up (0.5→1, −90→0)
//       rotateX = interpolate(
//         progress.value,
//         [0.5, 1],
//         [-90, 0],
//         Extrapolate.CLAMP,
//       );
//     } else if (direction.value === 'down') {
//       // Extend rotation to -180° so the back face becomes visible after 90°
//       rotateX = interpolate(
//         progress.value,
//         [0, -1],
//         [0, -180],
//         Extrapolate.CLAMP,
//       );
//     }

//     return {
//       transform: [
//         {perspective: 30000},
//         {translateY: HALF / 2},
//         {rotateX: `${rotateX}deg`},
//         {translateY: -HALF / 2},
//       ],
//       backfaceVisibility: 'visible',
//       zIndex: 5,
//     };
//   });

//   // ---- BOTTOM HALF (was top’s logic) ----
//   const bottomAnimated = useAnimatedStyle(() => {
//     let rotateX = 0;

//     if (direction.value === 'up') {
//       // previously top folds down first (0→0.5, 0→90)
//       rotateX = interpolate(
//         progress.value,
//         [0, 0.5],
//         [0, 90],
//         Extrapolate.CLAMP,
//       );
//     } else if (direction.value === 'down') {
//       // Keep bottom half fixed during downward scroll; only top rotates
//       rotateX = 0;
//     }

//     return {
//       transform: [
//         {perspective: 1000},
//         {translateY: -HALF / 2},
//         {rotateX: `${rotateX}deg`},
//         {translateY: HALF / 2},
//       ],
//       backfaceVisibility: 'visible',
//       zIndex: 4,
//     };
//   });

//   const textAnimated = useAnimatedStyle(() => ({
//     opacity: textFade.value,
//   }));

//   // Keep top background as current image during bottom-to-top scroll to avoid early change
//   const bgTopCurrentStyle = useAnimatedStyle(() => {
//     return {opacity: direction.value === 'up' ? 1 : 0};
//   });
//   const bgTopUpcomingStyle = useAnimatedStyle(() => {
//     return {opacity: direction.value === 'up' ? 0 : 1};
//   });

//   // Keep bottom background as current text during top-to-bottom scroll to avoid early change
//   const bgBottomCurrentStyle = useAnimatedStyle(() => {
//     // Keep current bottom visible by default and during downward scroll
//     return {opacity: direction.value === 'up' ? 0 : 1};
//   });
//   const bgBottomUpcomingStyle = useAnimatedStyle(() => {
//     // Only show upcoming bottom during upward scroll
//     return {opacity: direction.value === 'up' ? 1 : 0};
//   });

//   // Animated style for top half back content (previous item text)
//   const topBackContentOpacity = useAnimatedStyle(() => {
//     if (direction.value === 'down') {
//       // Show when rotation passes 90 degrees (progress < -0.5)
//       return {
//         opacity: interpolate(
//           progress.value,
//           [-0.5, -1],
//           [0, 1],
//           Extrapolate.CLAMP,
//         ),
//       };
//     }
//     return {opacity: 0};
//   });

//   // Animated style for bottom half back content (next item image)
//   const bottomBackContentOpacity = useAnimatedStyle(() => {
//     if (direction.value === 'up') {
//       // Show when rotation passes 90 degrees (progress > 0.5)
//       return {
//         opacity: interpolate(
//           progress.value,
//           [0.5, 1],
//           [0, 1],
//           Extrapolate.CLAMP,
//         ),
//       };
//     }
//     return {opacity: 0};
//   });

//   // Animated style for top half front content (current image)
//   const topFrontContentOpacity = useAnimatedStyle(() => {
//     if (direction.value === 'down') {
//       // Hide when rotation passes 90 degrees (progress < -0.5)
//       return {
//         opacity: interpolate(
//           progress.value,
//           [0, -0.5],
//           [1, 0],
//           Extrapolate.CLAMP,
//         ),
//       };
//     }
//     return {opacity: 1};
//   });

//   // Animated style for bottom half front content (current text)
//   const bottomFrontContentOpacity = useAnimatedStyle(() => ({
//     opacity: 1,
//   }));

//   // During bottom-to-top ('up'), ensure the top half shows the upcoming image
//   // consistently during its rotation phase and after completion.
//   const topFrontImageCurrentOpacity = useAnimatedStyle(() => ({
//     opacity: direction.value === 'up' ? 0 : 1,
//   }));
//   const topFrontImageUpcomingOpacity = useAnimatedStyle(() => ({
//     opacity: direction.value === 'up' ? 1 : 0,
//   }));

//   if (!currentItem || !upcomingItem)
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{color: '#fff'}}>Loading...</Text>
//       </View>
//     );

//   return (
//     <GestureHandlerRootView style={{flex: 1}}>
//       <GestureDetector gesture={pan}>
//         <View style={styles.container}>
//           <StatusBar hidden />

//           {/* BACK TOP HALF: lock to current image during bottom-to-top scroll */}
//           <Animated.View
//             style={[styles.half, styles.topHalf, bgTopCurrentStyle]}>
//             <MixedCard item={currentItem} half="top" />
//           </Animated.View>
//           <Animated.View
//             style={[styles.half, styles.topHalf, bgTopUpcomingStyle]}>
//             <MixedCard
//               item={
//                 snap.active
//                   ? snap.dir === 'down'
//                     ? snap.prev
//                     : snap.next
//                   : upcomingItem
//               }
//               half="top"
//             />
//           </Animated.View>
//           {/* BACK BOTTOM HALF: lock to current text during top-to-bottom scroll */}
//           <Animated.View
//             style={[styles.half, styles.bottomHalf, bgBottomCurrentStyle]}>
//             <MixedCard
//               item={currentItem}
//               half="bottom"
//               animatedStyle={textAnimated}
//             />
//           </Animated.View>
//           <Animated.View
//             style={[styles.half, styles.bottomHalf, bgBottomUpcomingStyle]}>
//             <MixedCard
//               item={upcomingItem}
//               half="bottom"
//               animatedStyle={textAnimated}
//             />
//           </Animated.View>

//           {/* FRONT (animated) */}
//           <Animated.View style={[styles.half, styles.topHalf, topAnimated]}>
//             {/* Top front image layering: show upcoming image during 'up' rotation, else current */}
//             <Animated.View
//               style={[styles.absoluteFill, topFrontImageUpcomingOpacity]}>
//               <MixedCard
//                 item={
//                   snap.active
//                     ? snap.dir === 'up'
//                       ? snap.next
//                       : snap.current
//                     : upcomingItem
//                 }
//                 half="top"
//               />
//             </Animated.View>
//             <Animated.View
//               style={[styles.absoluteFill, topFrontImageCurrentOpacity]}>
//               <MixedCard item={currentItem} half="top" />
//             </Animated.View>
//             {/* Back: Previous text (used only for 'down' flow via opacity gating) */}
//             <Animated.View
//               style={[
//                 styles.flipBackContent,
//                 styles.flipBackFace,
//                 topBackContentOpacity,
//               ]}>
//               <MixedCard
//                 item={
//                   snap.active && snap.dir === 'down' ? snap.prev : previousItem
//                 }
//                 half="bottom"
//                 animatedStyle={textAnimated}
//               />
//             </Animated.View>
//           </Animated.View>

//           <Animated.View
//             style={[styles.half, styles.bottomHalf, bottomAnimated]}>
//             {/* Front: Current text (0-90°) */}
//             <Animated.View style={bottomFrontContentOpacity}>
//               <MixedCard
//                 item={currentItem}
//                 half="bottom"
//                 animatedStyle={textAnimated}
//               />
//             </Animated.View>
//             {/* Back: Next image (90-180°) */}
//             <Animated.View
//               style={[
//                 styles.flipBackContent,
//                 styles.flipBackFace,
//                 bottomBackContentOpacity,
//               ]}>
//               <MixedCard item={upcomingItem} half="top" />
//             </Animated.View>
//           </Animated.View>
//         </View>
//       </GestureDetector>
//     </GestureHandlerRootView>
//   );
// }

// function MixedCard({item, half, animatedStyle}) {
//   if (!item) return null;
//   return (
//     <View
//       style={[
//         styles.card,
//         {
//           backgroundColor: half === 'top' ? '#000' : '#fff',
//           justifyContent: half === 'top' ? 'flex-end' : 'flex-start',
//         },
//       ]}>
//       {half === 'top' ? (
//         item.image ? (
//           <Image source={{uri: item.image}} style={styles.image} />
//         ) : null
//       ) : (
//         <Animated.View style={[styles.textContainer, animatedStyle]}>
//           <Text style={styles.title}>{item.title}</Text>
//           <Text style={styles.short}>{item.shortDesc}</Text>
//           <Text style={styles.long}>{item.longDesc}</Text>
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#000'},
//   half: {
//     position: 'absolute',
//     width,
//     height: HALF,
//     overflow: 'hidden',
//     backgroundColor: '#000',
//   },
//   topHalf: {
//     top: 0,
//     height: HALF, // slight overlap
//   },
//   bottomHalf: {
//     // bottom: 0,
//     // height: HALF + 0.5, // slight overlap
//     bottom: 0, // tiny upward overlap to remove visible seam
//     height:471.45 // ensures overlap fills gap
//   },
//   card: {
//     width: '100%',
//     height: '100%',
//   },
//   absoluteFill: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   flipBackContent: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     top: 0,
//     left: 0,
//   },
//   flipBackFace: {
//     transform: [{rotateX: '180deg'}],
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   textContainer: {
//     padding: 20,
//     backgroundColor: '#fff',
//     height: '100%',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },
//   short: {
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   long: {
//     fontSize: 15,
//     color: '#555',
//     textAlign: 'center',
//     marginTop: 6,
//     lineHeight: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
// });










// Way2NewsMixedUIFlipInertia.js
import React, {useState} from 'react';
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
  withDelay,
  withDecay,
  interpolate,
  Extrapolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const {height, width} = Dimensions.get('window');
const HALF = height / 2;

/**
 * Map pan translation Y to "flip progress" in [-1,1].
 *  0 -> rest,  0.5 -> crossed mid (up),  1 -> full (up)
 *  0 -> rest, -0.5 -> crossed mid (down), -1 -> full (down)
 */
const translationYToProgress = ty => {
  'worklet';
  // HALF translation = 1 unit of progress
  return ty / -HALF; // negative ty (drag up) -> positive progress
};

// Clamp helper
const clamp = (v, min, max) => {
  'worklet';
  return Math.max(min, Math.min(v, max));
};

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

export default function Way2NewsMixedUIFlipInertia() {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [snap, setSnap] = useState({
    active: false,
    dir: null,
    current: null,
    next: null,
    prev: null,
  });

  const progress = useSharedValue(0); // -1..1 (flip progress)
  const direction = useSharedValue(null); // 'up' | 'down' | null
  const textFade = useSharedValue(1);

  const currentItem = data[index];
  const upcomingItem = data[nextIndex];
  const previousItem = data[(index - 1 + data.length) % data.length];

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
      return newIndex;
    });
  };

  const finishFlipAndCommit = dir => {
    'worklet';
    textFade.value = withTiming(0, {duration: 120});
    const end = dir === 'up' ? 1 : -1;

    progress.value = withTiming(
      end,
      {duration: 350, easing: Easing.out(Easing.cubic)},
      finished => {
        if (finished) {
          runOnJS(updateIndex)(dir);
          progress.value = withDelay(
            80,
            withTiming(0, {duration: 0}, () => {
              direction.value = null;
              runOnJS(setSnap)(prev => ({...prev, active: false, dir: null}));
              textFade.value = withTiming(1, {
                duration: 380,
                easing: Easing.out(Easing.cubic),
              });
            }),
          );
        }
      },
    );
  };

  const cancelFlip = () => {
    'worklet';
    progress.value = withTiming(0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
    direction.value = null;
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
        }
      }
      // live map translation to progress
      const p = translationYToProgress(e.translationY);
      // Clamp lightly beyond bounds to allow tiny elastic look; we’ll clamp strictly onEnd
      progress.value = clamp(p, -1.05, 1.05);
    })
    .onEnd(e => {
      if (direction.value !== 'up' && direction.value !== 'down') {
        cancelFlip();
        return;
      }

      // Convert pixel velocity to progress velocity (units per second)
      const vp = translationYToProgress(e.velocityY);

      // If the gesture already crossed the halfway OR velocity is strong toward it,
      // we let a decay take it toward the appropriate end, then we "finishFlip".
      const dir = direction.value; // 'up' | 'down'
      const halfway = dir === 'up' ? 0.5 : -0.5;

      const crossedHalf =
        (dir === 'up' && progress.value >= halfway) ||
        (dir === 'down' && progress.value <= halfway);

      // Tuning numbers:
      const STRONG_FLICK = 1.1; // progress units / sec (roughly ~HALF screen per 300ms)
      const velocityHelps =
        (dir === 'up' && vp > STRONG_FLICK) ||
        (dir === 'down' && vp < -STRONG_FLICK);

      if (crossedHalf || velocityHelps) {
        // Let decay push further in the same direction, but clamp to the end
        progress.value = withDecay({
          velocity: vp,
          clamp: dir === 'up' ? [0.5, 1.15] : [-1.15, -0.5],
          rubberBandEffect: false,
        });

        // After a short delay, force-complete to ±1 so we can commit index cleanly
        // (decay does not have "onComplete" — we nudge into a timing end)
        progress.value = withDelay(
          140,
          withTiming(
            dir === 'up' ? 1 : -1,
            {duration: 280, easing: Easing.out(Easing.cubic)},
            finished => {
              if (finished) {
                runOnJS(updateIndex)(dir);
                progress.value = withDelay(
                  80,
                  withTiming(0, {duration: 0}, () => {
                    direction.value = null;
                    runOnJS(setSnap)(prev => ({
                      ...prev,
                      active: false,
                      dir: null,
                    }));
                    textFade.value = withTiming(1, {
                      duration: 380,
                      easing: Easing.out(Easing.cubic),
                    });
                  }),
                );
              }
            },
          ),
        );
      } else {
        // Didn’t cross half and velocity not enough → go back, but with a bit of inertial feel
        // Small decay then snap back
        progress.value = withDecay({
          velocity: vp * 0.5,
          clamp: [-0.25, 0.25],
          rubberBandEffect: false,
        });
        progress.value = withDelay(
          120,
          withTiming(0, {duration: 220, easing: Easing.out(Easing.cubic)}),
        );
        direction.value = null;
      }
    });

  // ---- TOP HALF (mirrored logic) ----
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
        {perspective: 30000},
        {translateY: HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: -HALF / 2},
      ],
      backfaceVisibility: 'visible',
      zIndex: 5,
    };
  });

  // ---- BOTTOM HALF ----
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
      rotateX = 0; // fixed while top rotates down
    }

    return {
      transform: [
        {perspective: 1000},
        {translateY: -HALF / 2},
        {rotateX: `${rotateX}deg`},
        {translateY: HALF / 2},
      ],
      backfaceVisibility: 'visible',
      zIndex: 4,
    };
  });

  const textAnimated = useAnimatedStyle(() => ({opacity: textFade.value}));

  // Background lock layers
  const bgTopCurrentStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));
  const bgTopUpcomingStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));
  const bgBottomCurrentStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'down' ? 1 : 0,
  }));
  const bgBottomUpcomingStyle = useAnimatedStyle(() => ({
    opacity: direction.value === 'down' ? 0 : 1,
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

  const bottomFrontContentOpacity = useAnimatedStyle(() => {
    if (direction.value === 'up') {
      return {
        opacity: interpolate(
          progress.value,
          [0, 0.5],
          [1, 0],
          Extrapolate.CLAMP,
        ),
      };
    }
    return {opacity: 1};
  });

  const topFrontImageCurrentOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));
  const topFrontImageUpcomingOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  if (!currentItem || !upcomingItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: '#fff'}}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetector gesture={pan}>
        <View style={styles.container}>
          <StatusBar hidden />

          {/* BACK TOP HALF */}
          <Animated.View
            style={[styles.half, styles.topHalf, bgTopCurrentStyle]}>
            <MixedCard item={currentItem} half="top" />
          </Animated.View>
          <Animated.View
            style={[styles.half, styles.topHalf, bgTopUpcomingStyle]}>
            <MixedCard
              item={
                snap.active
                  ? snap.dir === 'down'
                    ? snap.prev
                    : snap.next
                  : upcomingItem
              }
              half="top"
            />
          </Animated.View>

          {/* BACK BOTTOM HALF */}
          <Animated.View
            style={[styles.half, styles.bottomHalf, bgBottomCurrentStyle]}>
            <MixedCard
              item={currentItem}
              half="bottom"
              animatedStyle={textAnimated}
            />
          </Animated.View>
          <Animated.View
            style={[styles.half, styles.bottomHalf, bgBottomUpcomingStyle]}>
            <MixedCard
              item={upcomingItem}
              half="bottom"
              animatedStyle={textAnimated}
            />
          </Animated.View>

          {/* FRONT (animated halves) */}
          <Animated.View style={[styles.half, styles.topHalf, topAnimated]}>
            {/* upcoming image during UP flip */}
            <Animated.View
              style={[styles.absoluteFill, topFrontImageUpcomingOpacity]}>
              <MixedCard
                item={
                  snap.active && snap.dir === 'up' ? snap.next : upcomingItem
                }
                half="top"
              />
            </Animated.View>
            {/* current image otherwise */}
            <Animated.View
              style={[styles.absoluteFill, topFrontImageCurrentOpacity]}>
              <MixedCard item={currentItem} half="top" />
            </Animated.View>
            {/* backface: previous text (down flow) */}
            <Animated.View
              style={[
                styles.flipBackContent,
                styles.flipBackFace,
                topBackContentOpacity,
              ]}>
              <MixedCard
                item={
                  snap.active && snap.dir === 'down' ? snap.prev : previousItem
                }
                half="bottom"
                animatedStyle={textAnimated}
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[styles.half, styles.bottomHalf, bottomAnimated]}>
            {/* front: current text */}
            <Animated.View style={bottomFrontContentOpacity}>
              <MixedCard
                item={currentItem}
                half="bottom"
                animatedStyle={textAnimated}
              />
            </Animated.View>
            {/* back: next image */}
            <Animated.View
              style={[
                styles.flipBackContent,
                styles.flipBackFace,
                bottomBackContentOpacity,
              ]}>
              <MixedCard item={upcomingItem} half="top" />
            </Animated.View>
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

function MixedCard({item, half, animatedStyle}) {
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    backfaceVisibility: 'hidden',
  },
  half: {
    position: 'absolute',
    width,
    height: HALF + 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  topHalf: {
    top: 0,
    height: HALF, // slight overlap
  },
  bottomHalf: {
    // bottom: 0,
    // height: HALF + 0.5, // slight overlap
    bottom: 0, // tiny upward overlap to remove visible seam
    height: 471.45, // ensures overlap fills gap
  },
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

  textContainer: {padding: 20, backgroundColor: '#fff', height: '100%'},
  title: {fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center'},
  short: {fontSize: 16, color: '#333', textAlign: 'center', marginTop: 8},
  long: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

