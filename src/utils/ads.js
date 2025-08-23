import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Mock implementation cho Google Mobile Ads để tránh vấn đề Kotlin version
// Khi app được approve và publish, thay thế bằng implementation thực tế

// Ad unit IDs thực tế từ AdMob
export const adUnitIds = {
  banner: 'ca-app-pub-4926910693822363/2119847901',
  interstitial: 'ca-app-pub-4926910693822363/2119847901',
  rewardedInterstitial: 'ca-app-pub-4926910693822363/2119847901',
};

// Mock quảng cáo xen kẽ có tặng thưởng
export const loadRewardedInterstitial = () => {
  console.log('Mock: Loading rewarded interstitial ad...');
  return Promise.resolve();
};

export const showRewardedInterstitial = () => {
  console.log('Mock: Showing rewarded interstitial ad...');
  // Trong tương lai, thay thế bằng implementation thực tế
  return Promise.resolve();
};

// Mock quảng cáo xen kẽ thường
export const loadInterstitial = () => {
  console.log('Mock: Loading interstitial ad...');
  return Promise.resolve();
};

export const showInterstitial = () => {
  console.log('Mock: Showing interstitial ad...');
  // Trong tương lai, thay thế bằng implementation thực tế
  return Promise.resolve();
};

// Component Banner Ad Mock
export const BannerAdComponent = () => {
  return (
    <View style={styles.adContainer}>
      <TouchableOpacity 
        style={styles.mockBanner}
        onPress={() => console.log('Mock banner ad clicked')}
      >
        <Text style={styles.mockBannerText}>Ad Space</Text>
        <Text style={styles.mockBannerSubtext}>Tap to interact</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  mockBanner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mockBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  mockBannerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  }
});
