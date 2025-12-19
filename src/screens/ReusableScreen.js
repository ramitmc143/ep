import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import {
  ScaledSheet,
  moderateScale,
  verticalScale,
  scale,
} from 'react-native-size-matters';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { fetchDataOfCategory } from '../redux/slices/dataSlice';
import { useNavigation } from '@react-navigation/native';
import { getDeviceId } from '../deviceDetails/DeviceId';
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
  cancelAnimation,
} from 'react-native-reanimated';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

// overlay heights remain numeric
const HEADER_OVERLAY_HEIGHT = 120; // px – matches your header
const FOOTER_OVERLAY_HEIGHT = SCREEN_H * 0.08; // 8% screen height
const FLOATING_TAB_HEIGHT = hp('8%');

const ReusableScreen = ({
  apiLink,
  responseKey,
  readMoreTextLang = { 1: 'Read More', 2: 'మరిన్నివివరాలు' },
  dataKeyMap,
  langId,
  shouldDispatch,
  params,
  controlledShowChrome,
  onToggleChrome,
  topRatio = 0.45, // NEW: proportion for top half (0..1). default 40%
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // compute heights from ratio so every dependent value is consistent
  const TOP_HEIGHT = SCREEN_H * topRatio;
  const BOTTOM_HEIGHT = SCREEN_H * (1 - topRatio);

  // helpers (now use TOP_HEIGHT)
  const translationYToProgress = ty => {
    'worklet';
    // normalize drag to top section height (flipping originates from top half)
    return ty / -TOP_HEIGHT; // drag up = positive progress
  };
  const clamp = (v, min, max) => {
    'worklet';
    return Math.max(min, Math.min(v, max));
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareImage, setShareImage] = useState(false);

  const readMore_text = readMoreTextLang[langId] || 'Read More';

  // flip state
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

  const viewShotRef = useRef(null);

  // fetch data
  const fetchData = useCallback(async () => {
    if (!apiLink) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(apiLink, params);
      const resultData = response.data?.[responseKey] || [];
      const device_id = getDeviceId();

      setData(resultData);

      if (resultData.length > 0) {
        setIndex(prev => (prev >= resultData.length ? 0 : prev));
        setNextIndex(resultData.length > 1 ? 1 : 0);
      }

      if (shouldDispatch) {
        dispatch(
          fetchDataOfCategory({
            apiLink,
            langId,
            responseKey,
            device_id,
          }),
        );
      }
    } catch (e) {
      console.warn('fetchData error:', e?.message || e);
    } finally {
      setLoading(false);
    }
  }, [apiLink, langId, responseKey, params, shouldDispatch, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentItem = data.length ? data[index] : null;
  const upcomingItem = data.length > 1 ? data[nextIndex] : currentItem;
  const previousItem =
    data.length > 1
      ? data[(index - 1 + data.length) % data.length]
      : currentItem;

  const updateIndex = dir => {
    setIndex(prev => {
      if (!data.length) return 0;
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
    textFade.value = withTiming(0, { duration: 120 });
    const end = dir === 'up' ? 1 : -1;

    progress.value = withTiming(
      end,
      { duration: 350, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) {
          runOnJS(updateIndex)(dir);
          progress.value = withDelay(
            80,
            withTiming(0, { duration: 0 }, () => {
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
    );
  };

  const cancelFlip = (velocityY = 0) => {
    'worklet';
    cancelAnimation(progress);
    const vp = translationYToProgress(velocityY);
    // Small decay then snap back for natural feel
    progress.value = withDecay({
      velocity: vp * 0.5,
      clamp: [-0.25, 0.25],
      rubberBandEffect: false,
    });
    progress.value = withDelay(
      120,
      withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
    );
    direction.value = null;
    runOnJS(setSnap)(prev => ({
      ...prev,
      active: false,
      dir: null,
    }));
    textFade.value = withTiming(1, { duration: 200 });
  };

  const handleShare = async item => {
    try {
      if (!item || !viewShotRef.current) return;
      const shareUrl = item[dataKeyMap.share_link];

      setShareImage(true);
      await new Promise(r => setTimeout(r, 300));

      const uri = await viewShotRef.current.capture();
      const message = `${item[dataKeyMap.title]}\n\n${item[dataKeyMap.longDesc]
        }\n\n- via ఈనాడు ప్రతిభ app${shareUrl ? '\n' + shareUrl : ''
        }`;

      await Share.open({
        url: uri,
        message,
        title: 'Share',
      });

      setTimeout(() => setShareImage(false), 800);
    } catch (e) {
      console.warn('share error:', e?.message || e);
      setShareImage(false);
    }
  };

  // gestures
  const pan = Gesture.Pan()
    .onUpdate(e => {
      if (!data.length) return;

      if (!direction.value) {
        if (e.translationY < -20) direction.value = 'up';
        else if (e.translationY > 20) direction.value = 'down';

        if (direction.value) {
          runOnJS(setSnap)({
            active: true,
            dir: direction.value,
            current: currentItem,
            next: upcomingItem,
            prev: previousItem,
          });
        }
      }

      const p = translationYToProgress(e.translationY);
      progress.value = clamp(p, -1.05, 1.05);
    })
    .onEnd(e => {
      'worklet';
      if (direction.value !== 'up' && direction.value !== 'down') {
        cancelFlip(e.velocityY);
        return;
      }

      cancelAnimation(progress);

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
      const STRONG_FLICK = 1.1; // progress units / sec (roughly ~TOP_HEIGHT per 300ms)
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
            { duration: 280, easing: Easing.out(Easing.cubic) },
            finished => {
              if (finished) {
                runOnJS(updateIndex)(dir);
                progress.value = withDelay(
                  80,
                  withTiming(0, { duration: 0 }, () => {
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
        // Didn't cross half and velocity not enough → go back, but with a bit of inertial feel
        cancelFlip(e.velocityY);
      }
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      const y = e.absoluteY;

      const footerTop = SCREEN_H - FOOTER_OVERLAY_HEIGHT;

      // ignore taps on floating header
      if (y <= HEADER_OVERLAY_HEIGHT) {
        return;
      }

      // ignore taps on floating bottom tab
      if (y >= footerTop) {
        return;
      }

      runOnJS(onToggleChrome)(!controlledShowChrome);
    });

  const composedGesture = Gesture.Simultaneous(pan, tap);

  // animated styles — use TOP_HEIGHT / BOTTOM_HEIGHT consistently
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
        { perspective: 30000 },
        { translateY: TOP_HEIGHT / 2 },
        { rotateX: `${rotateX}deg` },
        { translateY: -TOP_HEIGHT / 2 },
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
        { perspective: 1000 },
        { translateY: -BOTTOM_HEIGHT / 2 },
        { rotateX: `${rotateX}deg` },
        { translateY: BOTTOM_HEIGHT / 2 },
      ],
      backfaceVisibility: 'visible',
      zIndex: 4,
    };
  });

  const textAnimated = useAnimatedStyle(() => ({
    opacity: textFade.value,
  }));

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
    return { opacity: 0 };
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
    return { opacity: 0 };
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
    return { opacity: 1 };
  });

  const topFrontImageCurrentOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 0 : 1,
  }));
  const topFrontImageUpcomingOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: '#fff' }}>No data available</Text>
      </View>
    );
  }

  const pageIndexFor = i =>
    !data.length ? 1 : ((i % data.length) + data.length) % data.length + 1;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.root}>
          {/* BACK TOP HALF */}
          <Animated.View
            style={[
              styles.half,
              { top: 0, height: TOP_HEIGHT },
              bgTopCurrentStyle,
            ]}>
            <NewsCardHalf
              item={currentItem}
              half="top"
              dataKeyMap={dataKeyMap}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.half,
              { top: 0, height: TOP_HEIGHT },
              bgTopUpcomingStyle,
            ]}>
            <NewsCardHalf
              item={
                snap.active
                  ? snap.dir === 'down'
                    ? snap.prev
                    : snap.next
                  : upcomingItem
              }
              half="top"
              dataKeyMap={dataKeyMap}
            />
          </Animated.View>

          {/* BACK BOTTOM HALF */}
          <Animated.View
            style={[
              styles.half,
              { top: TOP_HEIGHT, height: BOTTOM_HEIGHT },
              bgBottomCurrentStyle,
            ]}>
            <NewsCardHalf
              item={currentItem}
              half="bottom"
              dataKeyMap={dataKeyMap}
              animatedStyle={textAnimated}
              readMore_text={readMore_text}
              onShare={() => handleShare(currentItem)}
              shareImage={shareImage}
              pageIndex={pageIndexFor(index)}
              totalPages={data.length}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.half,
              { top: TOP_HEIGHT, height: BOTTOM_HEIGHT },
              bgBottomUpcomingStyle,
            ]}>
            <NewsCardHalf
              item={upcomingItem}
              half="bottom"
              dataKeyMap={dataKeyMap}
              animatedStyle={textAnimated}
              readMore_text={readMore_text}
              onShare={() => handleShare(upcomingItem)}
              shareImage={false}
              pageIndex={pageIndexFor(nextIndex)}
              totalPages={data.length}
            />
          </Animated.View>

          {/* FRONT ANIMATED HALVES (for flip + share screenshot) */}
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 0.9 }}
            style={styles.viewShotWrapper}>
            {/* TOP FRONT */}
            <Animated.View
              style={[styles.half, { top: 0, height: TOP_HEIGHT }, topAnimated]}>
              <Animated.View
                style={[styles.absoluteFill, topFrontImageUpcomingOpacity]}>
                <NewsCardHalf
                  item={
                    snap.active && snap.dir === 'up'
                      ? snap.next
                      : upcomingItem
                  }
                  half="top"
                  dataKeyMap={dataKeyMap}
                />
              </Animated.View>
              <Animated.View
                style={[styles.absoluteFill, topFrontImageCurrentOpacity]}>
                <NewsCardHalf
                  item={currentItem}
                  half="top"
                  dataKeyMap={dataKeyMap}
                />
              </Animated.View>

              {/* Back face when flipping down */}
              <Animated.View
                style={[
                  styles.flipBackContent,
                  styles.flipBackFace,
                  topBackContentOpacity,
                ]}>
                <NewsCardHalf
                  item={
                    snap.active && snap.dir === 'down'
                      ? snap.prev
                      : previousItem
                  }
                  half="bottom"
                  dataKeyMap={dataKeyMap}
                  animatedStyle={textAnimated}
                  readMore_text={readMore_text}
                  onShare={() =>
                    handleShare(
                      snap.active && snap.dir === 'down'
                        ? snap.prev
                        : previousItem,
                    )
                  }
                  shareImage={shareImage}
                  pageIndex={pageIndexFor(
                    (index - 1 + data.length) % data.length,
                  )}
                  totalPages={data.length}
                />
              </Animated.View>
            </Animated.View>

            {/* BOTTOM FRONT */}
            <Animated.View
              style={[
                styles.half,
                { top: TOP_HEIGHT, height: BOTTOM_HEIGHT },
                bottomAnimated,
              ]}>
              <Animated.View style={bottomFrontContentOpacity}>
                <NewsCardHalf
                  item={currentItem}
                  half="bottom"
                  dataKeyMap={dataKeyMap}
                  animatedStyle={textAnimated}
                  readMore_text={readMore_text}
                  onShare={() => handleShare(currentItem)}
                  shareImage={shareImage}
                  pageIndex={pageIndexFor(index)}
                  totalPages={data.length}
                />
              </Animated.View>

              {/* Back face when flipping up */}
              <Animated.View
                style={[
                  styles.flipBackContent,
                  styles.flipBackFace,
                  bottomBackContentOpacity,
                ]}>
                <NewsCardHalf
                  item={upcomingItem}
                  half="bottom"
                  dataKeyMap={dataKeyMap}
                  animatedStyle={textAnimated}
                  readMore_text={readMore_text}
                  onShare={() => handleShare(upcomingItem)}
                  shareImage={false}
                  pageIndex={pageIndexFor(nextIndex)}
                  totalPages={data.length}
                />
              </Animated.View>
            </Animated.View>
          </ViewShot>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// ---------- CARD HALF COMPONENT ----------

const NewsCardHalf = ({
  item,
  half,
  dataKeyMap,
  animatedStyle,
  readMore_text,
  onShare,
  shareImage,
  pageIndex = 1,
  totalPages = 1,
}) => {
  if (!item) return null;

  const navigation = useNavigation();

  // TOP HALF → IMAGE ONLY
  if (half === 'top') {
    return (
      <View style={styles.card}>
        <View style={styles.cardInner}>
          <Image
            source={{
              uri:
                item[dataKeyMap.image] ||
                'https://pratibhaassets.eenadu.net/uploadimages/thumbicon1.png',
            }}
            style={styles.image}
          />
        </View>
      </View>
    );
  }

  // BOTTOM HALF → text + inline meta + actions
  const timeLabel = item[dataKeyMap.date] || '';

  const openDetails = async () => {
    const url = item?.[dataKeyMap.longDesc]; // lt_notif_long_desc
    const title = item?.sect_name || item?.[dataKeyMap.title] || '';

    if (!url) {
      console.warn('openDetails: longDesc/url empty for item', item);
      return;
    }

    // 1. try direct navigator
    try {
      navigation.navigate('CustomWebView', { url, title });
      return;
    } catch (err) {
      console.warn(
        'navigation.navigate(CustomWebView) failed:',
        err?.message || err,
      );
    }

    // 2. try parent navigator
    try {
      const parent = navigation.getParent && navigation.getParent();
      if (parent) {
        parent.navigate('CustomWebView', { url, title });
        return;
      }
    } catch (err) {
      console.warn(
        'parent.navigate(CustomWebView) failed:',
        err?.message || err,
      );
    }

    // 3. fallback: external browser
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('Linking cannot open URL:', url);
      }
    } catch (err) {
      console.warn('Linking.openURL failed:', err?.message || err);
    }
  };

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.cardInner, animatedStyle]}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.cardContent,
            {
              flexGrow: 1,
              paddingBottom: FLOATING_TAB_HEIGHT + verticalScale(12),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {shareImage && (
            <Image
              source={require('../Assets/shareStripImage.png')}
              resizeMode="stretch"
              style={{ height: hp('4%'), width: wp('100%') }}
            />
          )}

          {/* TITLE */}
          <Text
            style={styles.title}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            {item[dataKeyMap.title]}
          </Text>

          {/* SHORT DESCRIPTION */}
          <Text style={styles.description}>
            {item[dataKeyMap.shortDesc]}
          </Text>

          {/* INLINE META (time + page count) */}
          <View style={styles.inlineMetaRow}>
            <View style={styles.metaLeft}>
              <Icon
                name="clock-outline"
                size={moderateScale(14)}
                color="#999"
              />
              <Text style={styles.metaText}>{timeLabel}</Text>
            </View>
            <Text style={styles.metaText}>
              {pageIndex} of {totalPages} Pages
            </Text>
          </View>

          {/* INLINE ACTIONS (share + read more) */}
          <View style={styles.inlineActionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (typeof onShare === 'function') onShare();
              }}>
              <Icon
                name="share-variant"
                size={moderateScale(20)}
                color="#007BFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.readMoreButton}
              activeOpacity={0.8}
              onPress={openDetails}>
              <Text style={styles.readMoreText}>{readMore_text}</Text>
              <Icon
                name="chevron-right"
                size={moderateScale(18)}
                color="#007BFF"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ---------- STYLES ----------
const styles = ScaledSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  viewShotWrapper: { flex: 1, backgroundColor: '#000' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  half: {
    position: 'absolute',
    width: SCREEN_W,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  // topHalf/bottomHalf values are now assigned inline where used
  card: { width: '100%', height: '100%', backgroundColor: '#fff' },
  cardInner: { flex: 1, backgroundColor: '#fff' },

  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  scrollArea: { flex: 1 },
  cardContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
    flexGrow: 1,
  },

  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#111',
    textAlign: 'left',
    marginBottom: verticalScale(8),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#444',
    lineHeight: verticalScale(22),
    textAlign: 'left',
    marginBottom: verticalScale(6),
    flexShrink: 1,
  },

  inlineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: moderateScale(12),
    color: '#999',
    marginLeft: scale(6),
  },

  inlineActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  actionButton: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(4),
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(4),
  },
  readMoreText: {
    fontSize: moderateScale(14),
    color: '#007BFF',
    fontWeight: '600',
    marginRight: scale(4),
  },

  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flipBackContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  flipBackFace: { transform: [{ rotateX: '180deg' }] },
});

export default ReusableScreen;
