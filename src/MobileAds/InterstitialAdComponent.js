import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { InterstitialAd, AdEventType , TestIds} from "react-native-google-mobile-ads";

const InterstitialAdComponent = ({ OnHandleCancel_ad, ADDetails }) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdShown, setIsAdShown] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [adFailed, setAdFailed] = useState(false); // prevent loader if ad fails quickly

  useEffect(() => {
    if (!ADDetails) {
      console.warn("ADDetails is missing. Skipping ad.");
      handleCloseAd();
      return;
    }

    const adUnitId = ADDetails?.FullAds?.Native_Ads?.AndroidAds?.adUnitId;
    // const testId = TestIds.INTERSTITIAL

    if (!adUnitId) {
      console.warn("adUnitId is missing inside ADDetails. Skipping ad.");
      handleCloseAd();
      return;
    }

    const ad = InterstitialAd.createForAdRequest(adUnitId);

    let delayTimeout = null;

    const onAdLoaded = () => {
      console.log("✅ Ad Loaded Successfully");
      clearTimeout(delayTimeout);
      setShowLoader(false);
      setIsAdLoaded(true);
      if (!isAdShown) {
        ad.show();
        setIsAdShown(true);
      }
    };

    const onAdClosed = () => {
      console.log("❎ Ad closed by user");
      handleCloseAd();
    };

    const onAdFailedToLoad = (error) => {
      console.log("⚠️ Ad failed to load:", error?.message || error);
      clearTimeout(delayTimeout);
      setAdFailed(true);       // mark failure
      setShowLoader(false);    // do not show loader
      handleCloseAd();
    };

    const loadedListener = ad.addAdEventListener(AdEventType.LOADED, onAdLoaded);
    const closedListener = ad.addAdEventListener(AdEventType.CLOSED, onAdClosed);
    const failedListener = ad.addAdEventListener(AdEventType.ERROR, onAdFailedToLoad);

    ad.load();

    // Delay loader display to avoid showing it briefly on quick failures
    delayTimeout = setTimeout(() => {
      if (!adFailed) setShowLoader(true);
    }, 300); // Only show loader after 300ms if no failure

    return () => {
      clearTimeout(delayTimeout);
      loadedListener();
      closedListener();
      failedListener();
    };
  }, []);

  const handleCloseAd = () => {
    if (OnHandleCancel_ad) {
      OnHandleCancel_ad();
    }
  };

  return (
    <>
      {showLoader && (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="black" />
            <Text style={styles.loaderText}>Loading Ad...</Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  loaderBox: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default InterstitialAdComponent;
