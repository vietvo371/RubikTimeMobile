import { View, StyleSheet } from 'react-native';
import mobileAds, {
  BannerAd,
  TestIds,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

// Khởi tạo Mobile Ads SDK
mobileAds()
  .initialize()
  .then(adapterStatuses => {
    // Khởi tạo thành công
    console.log('Initialization complete:', adapterStatuses);
  });

// Test ad unit IDs - Thay thế bằng ID thật khi publish
export const adUnitIds = {
  banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-4926910693822363/1239809256',
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-4926910693822363/5471516543',
};

// Quảng cáo xen kẽ
let interstitial = null;

export const loadInterstitial = () => {
  interstitial = InterstitialAd.createForAdRequest(adUnitIds.interstitial);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial ad loaded');
  });

  interstitial.addAdEventListener(AdEventType.ERROR, error => {
    console.error('Interstitial ad error:', error);
  });

  interstitial.load();
};

export const showInterstitial = () => {
  if (interstitial) {
    interstitial.show();
  }
};

// Component Banner Ad
export const BannerAdComponent = () => {
  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adUnitIds.banner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        style={styles.banner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  banner: {
    width: '100%',
    height: '100%',
  }
});