import mobileAds, { 
    BannerAd, 
    BannerAdSize, 
    TestIds,
    InterstitialAd,
    RewardedAd,
    RewardedAdEventType,
    AdEventType
} from 'react-native-google-mobile-ads';

// Ad Unit IDs - Thay thế bằng ID thực của bạn
export const AD_UNIT_IDS = {
    // Test IDs cho development
    BANNER_TEST: TestIds.BANNER,
    INTERSTITIAL_TEST: TestIds.INTERSTITIAL,
    REWARDED_TEST: TestIds.REWARDED,
    
    // Production IDs - Thay thế bằng ID thực từ AdMob console
    BANNER_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    INTERSTITIAL_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    REWARDED_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

// App ID - Thay thế bằng App ID thực của bạn
export const APP_ID = __DEV__ 
    ? 'ca-app-pub-3940256099942544~3347511713' // Test App ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX'; // Production App ID

// Initialize AdMob
export const initializeAdMob = async () => {
    try {
        await mobileAds().initialize();
        console.log('AdMob initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize AdMob:', error);
        return false;
    }
};

// Get appropriate ad unit ID based on environment
export const getAdUnitId = (adType) => {
    const isDev = __DEV__;
    
    switch (adType) {
        case 'banner':
            return isDev ? AD_UNIT_IDS.BANNER_TEST : AD_UNIT_IDS.BANNER_PRODUCTION;
        case 'interstitial':
            return isDev ? AD_UNIT_IDS.INTERSTITIAL_TEST : AD_UNIT_IDS.INTERSTITIAL_PRODUCTION;
        case 'rewarded':
            return isDev ? AD_UNIT_IDS.REWARDED_TEST : AD_UNIT_IDS.REWARDED_PRODUCTION;
        default:
            return isDev ? AD_UNIT_IDS.BANNER_TEST : AD_UNIT_IDS.BANNER_PRODUCTION;
    }
};

// Banner Ad Manager
export class BannerAdManager {
    constructor() {
        this.isLoaded = false;
        this.error = null;
    }

    loadAd(adUnitId) {
        return new Promise((resolve, reject) => {
            const bannerAd = BannerAd.createForAdRequest(adUnitId, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['timer', 'speedcubing', 'puzzle'],
            });

            const unsubscribeLoaded = bannerAd.addAdEventListener(AdEventType.LOADED, () => {
                this.isLoaded = true;
                this.error = null;
                console.log('Banner ad loaded');
                resolve(bannerAd);
            });

            const unsubscribeFailed = bannerAd.addAdEventListener(AdEventType.ERROR, (error) => {
                this.isLoaded = false;
                this.error = error;
                console.log('Banner ad failed to load:', error);
                reject(error);
            });

            bannerAd.load();

            // Cleanup listeners after 10 seconds
            setTimeout(() => {
                unsubscribeLoaded();
                unsubscribeFailed();
            }, 10000);
        });
    }
}

// Interstitial Ad Manager
export class InterstitialAdManager {
    constructor() {
        this.interstitial = null;
        this.isLoaded = false;
    }

    loadInterstitial(adUnitId) {
        return new Promise((resolve, reject) => {
            this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['timer', 'speedcubing', 'puzzle'],
            });

            const unsubscribeLoaded = this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
                this.isLoaded = true;
                console.log('Interstitial ad loaded');
                resolve();
            });

            const unsubscribeFailed = this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
                this.isLoaded = false;
                console.log('Interstitial ad failed to load:', error);
                reject(error);
            });

            this.interstitial.load();

            // Cleanup listeners after 10 seconds
            setTimeout(() => {
                unsubscribeLoaded();
                unsubscribeFailed();
            }, 10000);
        });
    }

    showInterstitial() {
        if (this.interstitial && this.isLoaded) {
            this.interstitial.show();
            this.isLoaded = false;
            return true;
        }
        return false;
    }
}

// Rewarded Ad Manager
export class RewardedAdManager {
    constructor() {
        this.rewarded = null;
        this.isLoaded = false;
    }

    loadRewarded(adUnitId) {
        return new Promise((resolve, reject) => {
            this.rewarded = RewardedAd.createForAdRequest(adUnitId, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['timer', 'speedcubing', 'puzzle'],
            });

            const unsubscribeLoaded = this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
                this.isLoaded = true;
                console.log('Rewarded ad loaded');
                resolve();
            });

            const unsubscribeFailed = this.rewarded.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
                this.isLoaded = false;
                console.log('Rewarded ad failed to load:', error);
                reject(error);
            });

            this.rewarded.load();

            // Cleanup listeners after 10 seconds
            setTimeout(() => {
                unsubscribeLoaded();
                unsubscribeFailed();
            }, 10000);
        });
    }

    showRewarded(onRewarded) {
        if (this.rewarded && this.isLoaded) {
            const unsubscribeEarned = this.rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
                console.log('User earned reward:', reward);
                if (onRewarded) {
                    onRewarded(reward);
                }
            });

            this.rewarded.show();
            this.isLoaded = false;

            // Cleanup listener after 30 seconds
            setTimeout(() => {
                unsubscribeEarned();
            }, 30000);

            return true;
        }
        return false;
    }
}

// Analytics tracking
export const trackAdEvent = (eventType, adType, data = {}) => {
    console.log('Ad Event:', eventType, adType, data);
    // Có thể thêm analytics service ở đây
    // Firebase Analytics, Google Analytics, etc.
};

// Ad display logic
export const shouldShowAd = () => {
    // Logic để quyết định có hiển thị ad không
    // Ví dụ: không hiển thị cho premium users
    return Math.random() > 0.3; // 70% chance
};

export const getAdDisplayInterval = () => {
    // Interval giữa các lần hiển thị ad
    return 60000; // 1 phút
}; 