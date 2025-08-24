// Cấu hình quảng cáo AdMob
export const AD_CONFIG = {
  // Ad Unit IDs
  adUnitIds: {
    banner: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-4926910693822363/2119847901',
    interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-4926910693822363/5471516543',
    rewardedInterstitial: __DEV__ ? 'ca-app-pub-3940256099942544/5354046379' : 'ca-app-pub-4926910693822363/5471516543',
  },

  // Cài đặt hiển thị quảng cáo
  displaySettings: {
    // Hiển thị quảng cáo xen kẽ có tặng thưởng sau mỗi N lần giải
    rewardedInterstitialFrequency: 5,
    
    // Hiển thị quảng cáo xen kẽ thường sau mỗi N lần giải
    interstitialFrequency: 3,
    
    // Thời gian chờ giữa các quảng cáo (ms)
    adCooldown: 30000, // 30 giây
    
    // Số lần giải tối thiểu trước khi hiển thị quảng cáo
    minSolvesBeforeAds: 2,
  },

  // Cài đặt phần thưởng
  rewards: {
    defaultReward: {
      amount: '1',
      type: 'điểm thưởng',
      description: 'Điểm thưởng để mở khóa tính năng mới'
    },
    
    // Các loại phần thưởng khác nhau
    rewardTypes: [
      { amount: '1', type: 'điểm thưởng', description: 'Điểm cơ bản' },
      { amount: '2', type: 'điểm thưởng', description: 'Điểm thưởng gấp đôi' },
      { amount: '5', type: 'điểm thưởng', description: 'Điểm thưởng đặc biệt' },
    ]
  },

  // Cài đặt quyền riêng tư
  privacy: {
    // Yêu cầu quảng cáo không cá nhân hóa
    requestNonPersonalizedAds: true,
    
    // Từ khóa để nhắm mục tiêu quảng cáo
    keywords: ['puzzle', 'game', 'timer', 'rubik', 'speedcubing'],
  },

  // Cài đặt hiệu suất
  performance: {
    // Preload quảng cáo khi app khởi động
    preloadOnStartup: true,
    
    // Tự động tải lại quảng cáo sau khi hiển thị
    autoReloadAfterShow: true,
    
    // Cài đặt retry cho network errors
    networkErrorRetry: {
      enabled: true,
      maxRetries: 3,
      baseDelay: 2000, // 2 giây
      maxDelay: 10000, // 10 giây
    },
  },

  // Cài đặt trải nghiệm người dùng
  userExperience: {
    // Hiển thị intro screen trước quảng cáo có tặng thưởng
    showIntroBeforeRewarded: true,
    
    // Cho phép bỏ qua quảng cáo
    allowSkipAds: true,
    
    // Fallback khi ads không load được
    fallbackOnAdFailure: true,
  },

  // Cài đặt tuân thủ chính sách
  compliance: {
    // Tuân thủ chính sách AdMob
    followAdMobPolicies: true,
    
    // Tuân thủ GDPR (nếu áp dụng)
    gdprCompliant: false,
    
    // Tuân thủ CCPA (nếu áp dụng)
    ccpaCompliant: false,
    
    // Tuân thủ quy định về quảng cáo cho trẻ em
    childDirected: false,
  }
};

// Hàm để lấy cấu hình dựa trên môi trường
export const getAdConfig = (environment = 'production') => {
  if (environment === 'development' || __DEV__) {
    console.log('🔧 [AdConfig] Development mode - Using TEST ad unit IDs');
    return {
      ...AD_CONFIG,
      adUnitIds: {
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
      }
    };
  }
  
  console.log('🚀 [AdConfig] Production mode - Using REAL ad unit IDs');
  return AD_CONFIG;
};

// Hàm để kiểm tra môi trường hiện tại
export const getCurrentEnvironment = () => {
  const env = __DEV__ ? 'development' : 'production';
  const config = getAdConfig(env);
  
  console.log(`🌍 [AdConfig] Current environment: ${env}`);
  console.log(`📱 [AdConfig] Banner ID: ${config.adUnitIds.banner}`);
  console.log(`🎯 [AdConfig] Interstitial ID: ${config.adUnitIds.interstitial}`);
  console.log(`🎁 [AdConfig] Rewarded ID: ${config.adUnitIds.rewardedInterstitial}`);
  
  return {
    environment: env,
    isTestMode: __DEV__,
    adUnitIds: config.adUnitIds
  };
};

// Hàm để kiểm tra xem có nên hiển thị quảng cáo không
export const shouldShowAd = (solveCount, lastAdTime) => {
  const config = getAdConfig();
  const { minSolvesBeforeAds, adCooldown } = config.displaySettings;
  
  // Kiểm tra số lần giải tối thiểu
  if (solveCount < minSolvesBeforeAds) {
    return false;
  }
  
  // Kiểm tra thời gian chờ giữa các quảng cáo
  if (lastAdTime && Date.now() - lastAdTime < adCooldown) {
    return false;
  }
  
  return true;
};

// Hàm để lấy loại quảng cáo nên hiển thị
export const getAdTypeToShow = (solveCount) => {
  const config = getAdConfig();
  const { rewardedInterstitialFrequency, interstitialFrequency } = config.displaySettings;
  
  if (solveCount % rewardedInterstitialFrequency === 0) {
    return 'rewardedInterstitial';
  } else if (solveCount % interstitialFrequency === 0) {
    return 'interstitial';
  }
  
  return null;
};

export default AD_CONFIG;
