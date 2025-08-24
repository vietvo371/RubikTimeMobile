// Test file để kiểm tra hệ thống quảng cáo
import { 
  loadRewardedInterstitial, 
  showRewardedInterstitial, 
  loadInterstitial, 
  showInterstitial,
  preloadAds 
} from './src/utils/ads';

// Test function
export const testAds = () => {
  console.log('=== Testing Ad System ===');
  
  // Test 1: Preload ads
  console.log('Test 1: Preloading ads...');
  preloadAds();
  
  // Test 2: Load rewarded interstitial
  console.log('Test 2: Loading rewarded interstitial...');
  loadRewardedInterstitial((error) => {
    if (error) {
      console.error('Failed to load rewarded interstitial:', error);
    } else {
      console.log('Rewarded interstitial loaded successfully');
      
      // Test 3: Show rewarded interstitial
      console.log('Test 3: Showing rewarded interstitial...');
      showRewardedInterstitial((reward) => {
        console.log('User earned reward:', reward);
      });
    }
  });
  
  // Test 4: Load interstitial
  console.log('Test 4: Loading interstitial...');
  loadInterstitial((error) => {
    if (error) {
      console.error('Failed to load interstitial:', error);
    } else {
      console.log('Interstitial loaded successfully');
      
      // Test 5: Show interstitial
      console.log('Test 5: Showing interstitial...');
      showInterstitial(() => {
        console.log('Interstitial shown successfully');
      });
    }
  });
};

// Export test function
export default testAds;
