import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Mock implementations for Google Mobile Ads
const mobileAds = () => ({
  initialize: () => Promise.resolve({}),
});

const TestIds = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
};

const BannerAdSize = {
  BANNER: 'BANNER',
};

const AdEventType = {
  LOADED: 'loaded',
  ERROR: 'error',
};

// Mock BannerAd component
const BannerAd = ({ style }) => (
  <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#666' }}>Ad Space</Text>
  </View>
);

// Mock InterstitialAd
const InterstitialAd = {
  createForAdRequest: () => ({
    addAdEventListener: () => {},
    load: () => {},
    show: () => {},
  }),
};

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