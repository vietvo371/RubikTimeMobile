import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import mobileAds, {
  BannerAd,
  TestIds,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  RewardedInterstitialAd,
} from 'react-native-google-mobile-ads';
import { getAdConfig, shouldShowAd, getAdTypeToShow } from './adConfig';
import { 
  checkNetworkConnection, 
  delayWithBackoff, 
  handleAdLoadFailure,
  shouldShowAdsBasedOnNetwork,
  getAdRequestTimeout 
} from './networkFallback';

// Khởi tạo Mobile Ads SDK
mobileAds()
  .initialize()
  .then(adapterStatuses => {
    // Khởi tạo thành công
    console.log('Initialization complete:', adapterStatuses);
  })
  .catch(error => {
    console.error('Failed to initialize Mobile Ads SDK:', error);
  });

// Lấy cấu hình quảng cáo
const adConfig = getAdConfig();

// Quảng cáo xen kẽ có tặng thưởng
let rewardedInterstitial = null;
let isRewardedInterstitialLoading = false;
let onRewardEarned = null;
let lastAdShowTime = 0;

export const loadRewardedInterstitial = (callback = null, retryCount = 0) => {
  if (isRewardedInterstitialLoading) {
    console.log('Rewarded interstitial ad is already loading');
    return;
  }

  if (rewardedInterstitial) {
    console.log('Rewarded interstitial ad already loaded');
    if (callback) callback();
    return;
  }

  isRewardedInterstitialLoading = true;
  console.log('Loading rewarded interstitial ad...');

  try {
    console.log('Creating rewarded interstitial ad with unit ID:', adConfig.adUnitIds.rewardedInterstitial);
    
    rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
      adConfig.adUnitIds.rewardedInterstitial, 
      {
        requestNonPersonalizedAdsOnly: adConfig.privacy.requestNonPersonalizedAds,
        keywords: adConfig.privacy.keywords,
      }
    );

    console.log('Rewarded interstitial ad created successfully');

    // Xử lý sự kiện khi quảng cáo được tải
    rewardedInterstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Rewarded interstitial ad loaded successfully');
      isRewardedInterstitialLoading = false;
      if (callback) callback();
    });

    // Xử lý sự kiện khi có lỗi
    rewardedInterstitial.addAdEventListener(AdEventType.ERROR, error => {
      console.error('Rewarded interstitial ad error:', error);
      isRewardedInterstitialLoading = false;
      rewardedInterstitial = null;
      
      // Xử lý lỗi network và retry
      if (error.message && error.message.includes('network-error')) {
        console.log('Network error detected for rewarded interstitial, will retry...');
        if (retryCount < 3) {
          setTimeout(() => {
            console.log(`Retrying rewarded interstitial ad load (attempt ${retryCount + 1})...`);
            loadRewardedInterstitial(callback, retryCount + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          console.log('Max retry attempts reached for rewarded interstitial ad');
          if (callback) callback(error);
        }
      } else {
        if (callback) callback(error);
      }
    });

    // Bắt đầu tải quảng cáo
    console.log('Starting to load rewarded interstitial ad...');
    rewardedInterstitial.load();
    
  } catch (error) {
    console.error('Error creating rewarded interstitial ad:', error);
    isRewardedInterstitialLoading = false;
    rewardedInterstitial = null;
    if (callback) callback(error);
  }
};

export const showRewardedInterstitial = (rewardCallback = null) => {
  console.log('Attempting to show rewarded interstitial ad...');
  
  if (!rewardedInterstitial) {
    console.log('Rewarded interstitial ad not ready. Loading...');
    if (rewardCallback) {
      onRewardEarned = rewardCallback;
    }
    loadRewardedInterstitial(() => {
      if (rewardedInterstitial) {
        showRewardedInterstitial(rewardCallback);
      }
    });
    return;
  }

  // Lưu callback để xử lý phần thưởng
  if (rewardCallback) {
    onRewardEarned = rewardCallback;
  }

  try {
    console.log('Showing rewarded interstitial ad...');
    
    // Hiển thị quảng cáo
    rewardedInterstitial.show();
    
    // Xử lý phần thưởng sau khi quảng cáo được hiển thị
    setTimeout(() => {
      if (onRewardEarned) {
        console.log('Giving reward to user...');
        // Tạo phần thưởng mặc định
        const defaultReward = {
          amount: '1',
          type: 'điểm thưởng'
        };
        onRewardEarned(defaultReward);
        onRewardEarned = null;
      }
      
      // Reset quảng cáo
      rewardedInterstitial = null;
      
      // Tự động tải quảng cáo mới
      setTimeout(() => {
        loadRewardedInterstitial();
      }, 1000);
    }, 1000);
    
  } catch (error) {
    console.error('Error showing rewarded interstitial ad:', error);
    rewardedInterstitial = null;
    // Thử tải lại quảng cáo
    loadRewardedInterstitial();
  }
};

// Kiểm tra xem quảng cáo có sẵn sàng không
export const isRewardedInterstitialReady = () => {
  return rewardedInterstitial !== null;
};

// Quảng cáo xen kẽ thường
let interstitial = null;
let isInterstitialLoading = false;

export const loadInterstitial = (callback = null, retryCount = 0) => {
  if (isInterstitialLoading) {
    console.log('Interstitial ad is already loading');
    return;
  }

  if (interstitial) {
    console.log('Interstitial ad already loaded');
    if (callback) callback();
    return;
  }

  isInterstitialLoading = true;
  console.log('Loading interstitial ad...');

  try {
    console.log('Creating interstitial ad with unit ID:', adConfig.adUnitIds.interstitial);
    
    interstitial = InterstitialAd.createForAdRequest(
      adConfig.adUnitIds.interstitial, 
      {
        requestNonPersonalizedAdsOnly: adConfig.privacy.requestNonPersonalizedAds,
        keywords: adConfig.privacy.keywords,
      }
    );

    console.log('Interstitial ad created successfully');

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded successfully');
      isInterstitialLoading = false;
      if (callback) callback();
    });

    interstitial.addAdEventListener(AdEventType.ERROR, error => {
      console.error('Interstitial ad error:', error);
      isInterstitialLoading = false;
      interstitial = null;
      
      // Xử lý lỗi network và retry
      if (error.message && error.message.includes('network-error')) {
        console.log('Network error detected, will retry...');
        if (retryCount < 3) {
          setTimeout(() => {
            console.log(`Retrying interstitial ad load (attempt ${retryCount + 1})...`);
            loadInterstitial(callback, retryCount + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          console.log('Max retry attempts reached for interstitial ad');
          if (callback) callback(error);
        }
      } else {
        if (callback) callback(error);
      }
    });

    // Bắt đầu tải quảng cáo
    console.log('Starting to load interstitial ad...');
    interstitial.load();
    
  } catch (error) {
    console.error('Error creating interstitial ad:', error);
    isInterstitialLoading = false;
    interstitial = null;
    if (callback) callback(error);
  }
};

export const showInterstitial = (callback = null) => {
  console.log('Attempting to show interstitial ad...');
  
  if (!interstitial) {
    console.log('Interstitial ad not ready. Loading...');
    loadInterstitial(() => {
      if (interstitial) {
        showInterstitial(callback);
      }
    });
    return;
  }

  try {
    console.log('Showing interstitial ad...');
    
    interstitial.show();
    
    // Reset quảng cáo sau khi hiển thị
    setTimeout(() => {
      interstitial = null;
      
      // Tự động tải quảng cáo mới
      setTimeout(() => {
        loadInterstitial();
      }, 1000);
    }, 1000);
    
    if (callback) callback();
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    interstitial = null;
    loadInterstitial();
  }
};

// Kiểm tra xem quảng cáo có sẵn sàng không
export const isInterstitialReady = () => {
  return interstitial !== null;
};

// Preload ads khi app khởi động
export const preloadAds = async () => {
  console.log('Preloading ads...');
  
  // Kiểm tra kết nối mạng trước
  const networkAvailable = await shouldShowAdsBasedOnNetwork();
  if (!networkAvailable) {
    console.log('Network not available, skipping ad preload');
    return;
  }
  
  if (adConfig.performance.preloadOnStartup) {
    console.log('Starting to preload rewarded interstitial ad...');
    loadRewardedInterstitial();
    console.log('Starting to preload interstitial ad...');
    loadInterstitial();
  }
};

// Hàm thông minh để hiển thị quảng cáo dựa trên logic
export const showSmartAd = (solveCount, rewardCallback = null) => {
  // Kiểm tra xem có nên hiển thị quảng cáo không
  if (!shouldShowAd(solveCount, lastAdShowTime)) {
    console.log('Ad should not be shown at this time');
    return false;
  }

  // Lấy loại quảng cáo nên hiển thị
  const adType = getAdTypeToShow(solveCount);
  
  if (adType === 'rewardedInterstitial') {
    showRewardedInterstitial(rewardCallback);
    return true;
  } else if (adType === 'interstitial') {
    showInterstitial();
    return true;
  }

  return false;
};

// Component Banner Ad
export const BannerAdComponent = () => {
  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adConfig.adUnitIds.banner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: adConfig.privacy.requestNonPersonalizedAds,
          keywords: adConfig.privacy.keywords,
        }}
        style={styles.banner}
      />
    </View>
  );
};

// Hook để sử dụng quảng cáo trong components
export const useAds = () => {
  const showRewardedAd = (rewardCallback) => {
    showRewardedInterstitial(rewardCallback);
  };

  const showInterstitialAd = (callback) => {
    showInterstitial(callback);
  };

  const showSmartAdWithLogic = (solveCount, rewardCallback) => {
    return showSmartAd(solveCount, rewardCallback);
  };

  const preloadAllAds = () => {
    preloadAds();
  };

  return {
    showRewardedAd,
    showInterstitialAd,
    showSmartAdWithLogic,
    preloadAllAds,
    isRewardedReady: isRewardedInterstitialReady(),
    isInterstitialReady: isInterstitialReady(),
  };
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