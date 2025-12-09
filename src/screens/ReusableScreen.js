import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  InteractionManager,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import {
  ScaledSheet,
  moderateScale,
  verticalScale,
  scale,
} from 'react-native-size-matters';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import {RefreshControl} from 'react-native-gesture-handler';
import {fetchDataOfCategory} from '../redux/slices/dataSlice';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getDeviceId} from '../deviceDetails/DeviceId';

const ReusableScreen = ({
  apiLink,
  responseKey,
  readMoreTextLang = {1: 'Read More', 2: 'మరిన్నివివరాలు'},
  dataKeyMap,
  langId,
  shouldDispatch,
  params,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImage, setLoadingImage] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shareImage, setShareImage] = useState(false);
  const [shareItemIndex, setShareItemIndex] = useState(null);

  const flatListRef = useRef(null);
  const lastScrollIndex = useRef(0);

  const insets = useSafeAreaInsets();

  let handleHasNotchStyle = 'noCutout';
  if (insets.top > 30) {
    handleHasNotchStyle = 'notch';
  } else if (insets.top > 10) {
    handleHasNotchStyle = 'holePunch';
  }

  const marginBottomValue = (() => {
    // Using the "no ad" margins you had earlier
    switch (handleHasNotchStyle) {
      case 'notch':
        return verticalScale(200);
      case 'holePunch':
        return verticalScale(160);
      case 'noCutout':
      default:
        return verticalScale(150);
    }
  })();

  const readMore_text = readMoreTextLang[langId];
  const viewShotRefs = useRef([]);

  const fetchData = useCallback(async () => {
    if (!apiLink) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(apiLink, params);
      console.log('response', response);

      const resultData = response.data?.[responseKey] || [];
      const device_id = getDeviceId();

      setData(resultData);

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
    } catch (error) {
      // console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiLink, langId, responseKey, params, shouldDispatch, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleShare = async (item, index) => {
    try {
      const EenaduAppShareLinkUrl = item[dataKeyMap.share_link];

      setShareItemIndex(index);
      setShareImage(true);

      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise(requestAnimationFrame);
      await InteractionManager.runAfterInteractions();

      const viewShotRef = viewShotRefs.current[index];
      if (!viewShotRef) {
        return;
      }

      const uri = await viewShotRef.capture();

      const message = `${item[dataKeyMap.title]}\n\n${
        item[dataKeyMap.longDesc]
      }\n\n- via ఈనాడు ప్రతిభ app\n${EenaduAppShareLinkUrl}`;

      await Share.open({
        url: uri,
        message,
        title: 'Share',
      });

      setTimeout(() => {
        setShareImage(false);
        setShareItemIndex(null);
      }, 1000);
    } catch (error) {
      // console.log('Error during sharing:', error);
      setShareImage(false);
      setShareItemIndex(null);
    }
  };

  const onMomentumScrollEnd = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const itemHeight = hp('100%');
    const index = Math.round(offsetY / itemHeight);
    const lastIndex = data.length - 1;

    // Determine scroll direction
    const direction = index > lastScrollIndex.current ? 'down' : 'up';

    // Loop from last to first (based on your original logic)
    if (index >= lastIndex && direction === 'up') {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({index: 0, animated: false});
        lastScrollIndex.current = 0;
      }, 10);
    }
    // Loop from first to last
    else if (index <= 0 && direction === 'down') {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({index: lastIndex, animated: false});
        lastScrollIndex.current = lastIndex;
      }, 10);
    } else {
      lastScrollIndex.current = index;
    }
  };

  const renderItem = useCallback(
    ({item, index}) => (
      <View style={styles.card}>
        <View style={styles.cardInner}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.cardContent}>
            <ViewShot
              ref={ref => (viewShotRefs.current[index] = ref)}
              options={{format: 'jpg', quality: 0.9}}
              style={{backgroundColor: 'white'}}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('CustomWebView', {
                    url: item[dataKeyMap.longDesc],
                    title: item.sect_name,
                  })
                }>
                <View style={styles.imageContainer}>
                  {loadingImage && (
                    <Image
                      source={require('../Assets/maskImage.png')}
                      style={[styles.image, {opacity: 0.2}]}
                    />
                  )}
                  <Image
                    source={{
                      uri:
                        item[dataKeyMap.image] ||
                        'https://pratibhaassets.eenadu.net/uploadimages/thumbicon1.png',
                    }}
                    style={[styles.image, loading && styles.hiddenImage]}
                    onLoadStart={() => setLoadingImage(true)}
                    onLoadEnd={() => setLoadingImage(false)}
                  />
                </View>
              </TouchableOpacity>

              {shareImage && shareItemIndex === index && (
                <Image
                  source={require('../Assets/shareStripImage.png')}
                  resizeMode="stretch"
                  style={{height: hp('4%'), width: wp('100%')}}
                />
              )}

              <View style={styles.fixedContainer}>
                <View style={styles.titleDescriptionWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('CustomWebView', {
                        url: item[dataKeyMap.longDesc],
                        title: item.sect_name,
                      })
                    }>
                    <Text
                      style={styles.title}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}>
                      {item[dataKeyMap.title]}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('CustomWebView', {
                        url: item[dataKeyMap.longDesc],
                        title: item.sect_name,
                      })
                    }>
                    <Text style={styles.description} numberOfLines={5}>
                      {item[dataKeyMap.shortDesc]}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ViewShot>
          </ScrollView>

          {/* Fixed Footer at bottom of card */}
          <View
            style={[
              styles.footerRowFixed,
              {
                marginBottom: marginBottomValue,
              },
            ]}>
            <View style={styles.footerButton}>
              <Icon
                name="clock-outline"
                size={moderateScale(16)}
                color="#007BFF"
              />
              <Text style={styles.footerButtonText}>
                {item[dataKeyMap.date]}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleShare(item, index)}
              style={styles.footerButton}>
              <Icon
                name="share-variant"
                size={moderateScale(16)}
                color="#007BFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CustomWebView', {
                  url: item[dataKeyMap.longDesc],
                  title: item.sect_name,
                })
              }
              style={styles.footerButton}>
              <Icon
                name="link-variant"
                size={moderateScale(16)}
                color="#007BFF"
              />
              <Text style={styles.footerButtonText}> {readMore_text}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [readMore_text, loadingImage, shareImage, shareItemIndex, navigation, dataKeyMap],
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        ref={flatListRef}
        renderItem={renderItem}
        extraData={shareItemIndex}
        keyExtractor={(item, index) =>
          item[dataKeyMap.id]?.toString() || index.toString()
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={hp('100%')}
        decelerationRate="normal"
        bounces={false}
        disableIntervalMomentum={true}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: hp('100%'),
          offset: hp('100%') * index,
          index,
        })}
        initialNumToRender={5}
        removeClippedSubviews
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    height: hp('100%'),
    width: wp('100%'),
    backgroundColor: '#fff',
  },
  cardInner: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  cardContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  fixedContainer: {
    marginTop: verticalScale(5),
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(15),
  },
  imageContainer: {
    height: hp('34%'),
    marginHorizontal: scale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    marginTop: verticalScale(10),
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  titleDescriptionWrapper: {
    flex: 1,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(5),
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#555',
    lineHeight: verticalScale(22),
    textAlign: 'left',
    width: '100%',
  },
  footerRowFixed: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    backgroundColor: '#e0e0e0',
    borderRadius: moderateScale(30),
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: moderateScale(5),
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: moderateScale(13),
    color: '#007BFF',
    fontWeight: '600',
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default ReusableScreen;
