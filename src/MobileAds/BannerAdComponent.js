import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import {BannerAd, TestIds} from 'react-native-google-mobile-ads';
import {verticalScale} from 'react-native-size-matters';

const BannerAdComponent = ({ADDetails, onAdLoaded, onAdFailedToLoad}) => {
  const isAndroid = Platform.OS === 'android';

  const adData = isAndroid
    ? ADDetails?.StickyAds?.Native_Ads?.AndroidAds
    : ADDetails?.StickyAds?.Native_Ads?.IosAds;

  const adUnitId = adData?.adUnitId;
  const adSizesRaw = adData?.adSizes;
  const adType = adData?.adType;

  const isAdAvailable =
    ADDetails?.StickyAds?.Native_Ads && adUnitId && adSizesRaw;

  // const isAdAvailable = "";

  // unitId={TestIds.BANNER} testing purpose

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdFailed, setIsAdFailed] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(true); // Start as loading

  if (!isAdAvailable) {
    onAdFailedToLoad?.(); // 👈 Trigger failure callback
    return null;
  }
  // Parse ad size
  let adSizeArray = [];
  try {
    const parsedSizes = JSON.parse(adSizesRaw);
    if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
      adSizeArray = parsedSizes[0];
    }
  } catch (error) {
    // console.error('Failed to parse adSizes:', error);
    return null;
  }

  const customSize =
    adSizeArray.length === 2 ? `${adSizeArray[0]}x${adSizeArray[1]}` : null;

  // If ad failed or invalid size, render nothing
  if (isAdFailed || !customSize) return null;

  return (
    <View style={styles.adContainer}>
      {isAdLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Loading Ad...</Text>
        </View>
      )}
      
      <BannerAd
        unitId={adUnitId}
        size={customSize}
        requestOptions={{requestNonPersonalizedAdsOnly: true}}
        adType={adType}
        onAdLoaded={() => {
          // console.log('✅ Banner Ad loaded');
          setIsAdLoaded(true);
          setIsAdLoading(false);
          onAdLoaded?.(); // 👈 Notify parent
        }}
        onAdFailedToLoad={error => {
          // console.log('❌ Banner Ad failed to load:', error?.message || error);
          setIsAdFailed(true);
          setIsAdLoading(false);
          onAdFailedToLoad?.(); // 👈 Notify parent
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    //height: verticalScale(60), // ✅ Responsive height// ✅ Fixed height to prevent layout shift
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // height: verticalScale(50), // ✅ Responsive height
    width: '100%',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#000',
  },
});

export default BannerAdComponent;
