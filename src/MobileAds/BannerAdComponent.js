// import React, {useState} from 'react';
// import {
//   View,
//   StyleSheet,
//   Platform,
//   ActivityIndicator,
//   Text,
// } from 'react-native';
// import {BannerAd, TestIds} from 'react-native-google-mobile-ads';
// import {verticalScale} from 'react-native-size-matters';

// const BannerAdComponent = ({ADDetails, onAdLoaded, onAdFailedToLoad}) => {
//   const isAndroid = Platform.OS === 'android';

//   const adData = isAndroid
//     ? ADDetails?.StickyAds?.Native_Ads?.AndroidAds
//     : ADDetails?.StickyAds?.Native_Ads?.IosAds;

//   const adUnitId = adData?.adUnitId;
//   const adSizesRaw = adData?.adSizes;
//   const adType = adData?.adType;

//   const isAdAvailable =
//     ADDetails?.StickyAds?.Native_Ads && adUnitId && adSizesRaw;

//   // const isAdAvailable = "";

//   // unitId={TestIds.BANNER} testing purpose

//   const [isAdLoaded, setIsAdLoaded] = useState(false);
//   const [isAdFailed, setIsAdFailed] = useState(false);
//   const [isAdLoading, setIsAdLoading] = useState(true); // Start as loading

//   if (!isAdAvailable) {
//     onAdFailedToLoad?.(); // 👈 Trigger failure callback
//     return null;
//   }
//   // Parse ad size
//   let adSizeArray = [];
//   try {
//     const parsedSizes = JSON.parse(adSizesRaw);
//     if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
//       adSizeArray = parsedSizes[0];
//     }
//   } catch (error) {
//     console.error('Failed to parse adSizes:', error);
//     return null;
//   }

//   const customSize =
//     adSizeArray.length === 2 ? `${adSizeArray[0]}x${adSizeArray[1]}` : null;

//   // If ad failed or invalid size, render nothing
//   if (isAdFailed || !customSize) return null;

//   return (
//     <View style={styles.adContainer}>
//       {isAdLoading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="small" color="#0000ff" />
//           <Text style={styles.loadingText}>Loading Ad...</Text>
//         </View>
//       )}
//       <BannerAd
//         unitId={adUnitId}
//         size={customSize}
//         requestOptions={{requestNonPersonalizedAdsOnly: true}}
//         adType={adType}
//         onAdLoaded={() => {
//           console.log('✅ Banner Ad loaded');
//           setIsAdLoaded(true);
//           setIsAdLoading(false);
//           onAdLoaded?.(); // 👈 Notify parent
//         }}
//         onAdFailedToLoad={error => {
//           console.log('❌ Banner Ad failed to load:', error?.message || error);
//           setIsAdFailed(true);
//           setIsAdLoading(false);
//           onAdFailedToLoad?.(); // 👈 Notify parent
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   adContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     //height: verticalScale(60), // ✅ Responsive height// ✅ Fixed height to prevent layout shift
//     width: '100%',
//   },
//   loadingContainer: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // height: verticalScale(50), // ✅ Responsive height
//     width: '100%',
//     zIndex: 1,
//   },
//   loadingText: {
//     fontSize: 14,
//     color: '#000',
//   },
// });

// export default BannerAdComponent;



import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import {BannerAd} from 'react-native-google-mobile-ads';
import {verticalScale} from 'react-native-size-matters';

const parseAdSize = adSizesRaw => {
  if (!adSizesRaw) {
    return null;
  }

  try {
    // 1) Already array / object
    if (Array.isArray(adSizesRaw)) {
      // expected: [[320, 50]] OR [320, 50]
      if (adSizesRaw.length === 2 && typeof adSizesRaw[0] === 'number') {
        return [adSizesRaw[0], adSizesRaw[1]];
      }
      if (
        Array.isArray(adSizesRaw[0]) &&
        adSizesRaw[0].length === 2 &&
        typeof adSizesRaw[0][0] === 'number'
      ) {
        return [adSizesRaw[0][0], adSizesRaw[0][1]];
      }
    }

    // 2) String
    if (typeof adSizesRaw === 'string') {
      const trimmed = adSizesRaw.trim();

      // "undefined" / "null" / khali -> invalid
      if (
        trimmed === 'undefined' ||
        trimmed === 'null' ||
        trimmed.length === 0
      ) {
        return null;
      }

      // JSON string format: "[[320,50]]" or "[320,50]"
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          if (
            parsed.length === 2 &&
            typeof parsed[0] === 'number' &&
            typeof parsed[1] === 'number'
          ) {
            return [parsed[0], parsed[1]];
          }
          if (
            Array.isArray(parsed[0]) &&
            parsed[0].length === 2 &&
            typeof parsed[0][0] === 'number'
          ) {
            return [parsed[0][0], parsed[0][1]];
          }
        }
      }

      // "320x50" type ka format
      if (trimmed.includes('x')) {
        const [wStr, hStr] = trimmed.split('x');
        const w = Number(wStr);
        const h = Number(hStr);
        if (!isNaN(w) && !isNaN(h)) {
          return [w, h];
        }
      }
    }

    // koi format samajh nahi aaya
    console.log('Unsupported adSizes format:', adSizesRaw);
    return null;
  } catch (err) {
    console.log('Failed to parse adSizes:', adSizesRaw, err?.message || err);
    return null;
  }
};

const BannerAdComponent = ({ADDetails, onAdLoaded, onAdFailedToLoad}) => {
  const isAndroid = Platform.OS === 'android';

  const adData = isAndroid
    ? ADDetails?.StickyAds?.Native_Ads?.AndroidAds
    : ADDetails?.StickyAds?.Native_Ads?.IosAds;

  const adUnitId = adData?.adUnitId;
  const adSizesRaw = adData?.adSizes;
  const adType = adData?.adType;

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdFailed, setIsAdFailed] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(true);

  // debug: dekhne ke liye actually kya aa raha hai
  // console.log('BannerAd adSizesRaw =>', adSizesRaw);

  const parsedSize = parseAdSize(adSizesRaw);
  const customSize =
    parsedSize && parsedSize.length === 2
      ? `${parsedSize[0]}x${parsedSize[1]}`
      : null;

  const isAdAvailable =
    !!ADDetails?.StickyAds?.Native_Ads && !!adUnitId && !!customSize;

  const hasReportedConfigIssue = useRef(false);

  // config ya parsing issue / fail pe parent ko ek hi baar notify
  useEffect(() => {
    if ((!isAdAvailable || isAdFailed) && !hasReportedConfigIssue.current) {
      hasReportedConfigIssue.current = true;
      onAdFailedToLoad?.();
    }
  }, [isAdAvailable, isAdFailed, onAdFailedToLoad]);

  // agar ad hi nahi ya size valid nahi / fail ho gaya -> kuch mat dikhao
  if (!isAdAvailable || isAdFailed) {
    return null;
  }

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
          console.log('✅ Banner Ad loaded');
          setIsAdLoaded(true);
          setIsAdLoading(false);
          hasReportedConfigIssue.current = false;
          onAdLoaded?.();
        }}
        onAdFailedToLoad={error => {
          console.log('❌ Banner Ad failed to load:', error?.message || error);
          setIsAdFailed(true);
          setIsAdLoading(false);
          // parent ko notify useEffect se ho jayega
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
    // height: verticalScale(60),
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // height: verticalScale(50),
    width: '100%',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#000',
  },
});

export default BannerAdComponent;
