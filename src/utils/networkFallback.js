// Network fallback strategies for ads
import { Platform } from 'react-native';

// Kiểm tra kết nối mạng
export const checkNetworkConnection = async () => {
  try {
    // Kiểm tra kết nối internet cơ bản
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    console.log('Network connection check failed:', error.message);
    return false;
  }
};

// Delay với exponential backoff
export const delayWithBackoff = (attempt, baseDelay = 2000, maxDelay = 10000) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Fallback strategy khi ads không load được
export const handleAdLoadFailure = (adType, error, retryCount = 0) => {
  console.log(`Ad load failure for ${adType}:`, error.message);
  
  // Nếu là lỗi network, thử lại
  if (error.message && error.message.includes('network-error')) {
    if (retryCount < 3) {
      console.log(`Will retry ${adType} ad load in ${retryCount + 1} seconds...`);
      return {
        shouldRetry: true,
        delay: (retryCount + 1) * 2000,
        retryCount: retryCount + 1
      };
    } else {
      console.log(`Max retries reached for ${adType} ad`);
      return {
        shouldRetry: false,
        shouldShowFallback: true,
        message: 'Ads temporarily unavailable due to network issues'
      };
    }
  }
  
  // Các lỗi khác
  return {
    shouldRetry: false,
    shouldShowFallback: true,
    message: 'Ad loading failed'
  };
};

// Kiểm tra xem có nên hiển thị ads không dựa trên network
export const shouldShowAdsBasedOnNetwork = async () => {
  const isConnected = await checkNetworkConnection();
  
  if (!isConnected) {
    console.log('Network not available, skipping ads');
    return false;
  }
  
  return true;
};

// Cài đặt timeout cho ad requests
export const getAdRequestTimeout = () => {
  // Timeout dài hơn cho network chậm
  return Platform.OS === 'ios' ? 15000 : 10000;
};

// Fallback content khi ads không load được
export const getFallbackContent = (adType) => {
  const fallbackMessages = {
    interstitial: 'Ad temporarily unavailable',
    rewardedInterstitial: 'Rewarded ad temporarily unavailable',
    banner: 'Banner ad temporarily unavailable'
  };
  
  return {
    message: fallbackMessages[adType] || 'Ad temporarily unavailable',
    showRetryButton: true,
    retryDelay: 5000
  };
};
