# Google AdMob Setup Guide

## 🎯 Tổng quan

Hướng dẫn tích hợp Google AdMob để kiếm tiền từ quảng cáo thực tế trong app RubikTime.

## 📋 Prerequisites

### 1. **Google AdMob Account**
- Tạo tài khoản tại [AdMob Console](https://admob.google.com/)
- Xác minh tài khoản và thông tin thanh toán
- Tạo app trong AdMob console

### 2. **App Store Accounts**
- Apple Developer Account (cho iOS)
- Google Play Console (cho Android)

## 🔧 Setup Steps

### Step 1: Tạo App trong AdMob Console

1. **Đăng nhập AdMob Console**
   - Truy cập https://admob.google.com/
   - Đăng nhập với Google account

2. **Tạo App mới**
   - Click "Apps" → "Add App"
   - Chọn "No, I don't have an app store listing"
   - Nhập tên app: "RubikTime"
   - Chọn platform: iOS và Android

3. **Lấy App ID**
   - Copy App ID cho iOS: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
   - Copy App ID cho Android: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

### Step 2: Tạo Ad Units

#### Banner Ad Unit
1. Trong AdMob Console → "Ad units" → "Create ad unit"
2. Chọn "Banner"
3. Đặt tên: "RubikTime Banner"
4. Copy Ad Unit ID: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

#### Interstitial Ad Unit (Optional)
1. Tạo ad unit mới → "Interstitial"
2. Đặt tên: "RubikTime Interstitial"
3. Copy Ad Unit ID

#### Rewarded Ad Unit (Optional)
1. Tạo ad unit mới → "Rewarded"
2. Đặt tên: "RubikTime Rewarded"
3. Copy Ad Unit ID

### Step 3: Cập nhật Code

#### 1. Cập nhật AdMob Manager
```javascript
// src/utils/adMobManager.js
export const AD_UNIT_IDS = {
    // Test IDs cho development
    BANNER_TEST: TestIds.BANNER,
    INTERSTITIAL_TEST: TestIds.INTERSTITIAL,
    REWARDED_TEST: TestIds.REWARDED,
    
    // Production IDs - Thay thế bằng ID thực
    BANNER_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    INTERSTITIAL_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    REWARDED_PRODUCTION: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};

export const APP_ID = __DEV__ 
    ? 'ca-app-pub-3940256099942544~3347511713' // Test App ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX'; // Production App ID
```

#### 2. Cập nhật Android Manifest
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

#### 3. Cập nhật iOS Info.plist
```xml
<!-- ios/RubikTime/Info.plist -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>
```

### Step 4: Test và Deploy

#### Testing
```bash
# Test trên development
npx react-native run-android
npx react-native run-ios
```

#### Production Build
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
# Archive trong Xcode
```

## 📊 Analytics và Monitoring

### AdMob Console Metrics
- **Impressions**: Số lần quảng cáo hiển thị
- **Clicks**: Số lần user nhấn vào quảng cáo
- **CTR**: Click-through rate
- **Revenue**: Doanh thu từ quảng cáo
- **eCPM**: Effective cost per mille

### Code Analytics
```javascript
// Track ad events
trackAdEvent('impression', 'banner', { unitId: 'banner_ad' });
trackAdEvent('click', 'banner', { unitId: 'banner_ad' });
```

## 💰 Monetization Strategy

### 1. **Banner Ads**
- **Vị trí**: Khung hình màu đen trong TimerBox
- **Frequency**: Hiển thị liên tục
- **Revenue**: Thấp nhưng ổn định

### 2. **Interstitial Ads** (Future)
- **Vị trí**: Sau khi save time
- **Frequency**: Mỗi 5-10 times saved
- **Revenue**: Cao hơn banner

### 3. **Rewarded Ads** (Future)
- **Vị trí**: Để unlock premium features
- **Frequency**: Theo user request
- **Revenue**: Cao nhất

## 🚀 Advanced Features

### 1. **Ad Targeting**
```javascript
const requestOptions = {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['timer', 'speedcubing', 'puzzle'],
    contentUrl: 'https://rubiktime.app',
};
```

### 2. **Ad Load Optimization**
```javascript
// Preload ads
const preloadInterstitial = async () => {
    const interstitialManager = new InterstitialAdManager();
    await interstitialManager.loadInterstitial(getAdUnitId('interstitial'));
};
```

### 3. **User Experience**
```javascript
// Don't show ads for premium users
const shouldShowAd = () => {
    return !isPremiumUser && Math.random() > 0.3;
};
```

## 📱 Platform Specific

### Android Setup
1. **Permissions**: Đã thêm trong AndroidManifest.xml
2. **Dependencies**: react-native-google-mobile-ads
3. **ProGuard**: Tự động handle

### iOS Setup
1. **Info.plist**: Đã thêm GADApplicationIdentifier
2. **SKAdNetwork**: Đã thêm cho iOS 14+
3. **Privacy**: Đã thêm tracking description

## 🔒 Privacy Compliance

### GDPR Compliance
```javascript
// Request non-personalized ads
requestNonPersonalizedAdsOnly: true
```

### CCPA Compliance
```javascript
// California privacy
requestNonPersonalizedAdsOnly: true
```

### iOS 14+ App Tracking Transparency
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalized ads to you.</string>
```

## 📈 Revenue Optimization

### 1. **Ad Placement**
- **Above the fold**: Banner trong TimerBox
- **High engagement areas**: Gần timer controls
- **Non-intrusive**: Không ảnh hưởng UX

### 2. **Ad Frequency**
- **Banner**: Liên tục (không spam)
- **Interstitial**: 5-10 actions
- **Rewarded**: Theo demand

### 3. **User Segmentation**
- **Free users**: Full ads
- **Premium users**: No ads
- **New users**: Reduced ads

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Ad Not Loading**
```javascript
// Check network
console.log('Network status:', await NetInfo.fetch());

// Check AdMob initialization
console.log('AdMob status:', await mobileAds().isInitialized());
```

#### 2. **Test Ads Not Working**
```javascript
// Use test IDs in development
const adUnitId = __DEV__ ? TestIds.BANNER : PRODUCTION_BANNER_ID;
```

#### 3. **Production Ads Not Loading**
- Kiểm tra App ID và Ad Unit ID
- Đợi 24-48h sau khi tạo ad unit
- Kiểm tra AdMob console status

### Debug Commands
```bash
# Check AdMob logs
adb logcat | grep -i admob

# iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "RubikTime"'
```

## 📋 Checklist

### Setup Complete
- [ ] AdMob account created
- [ ] App created in AdMob console
- [ ] Ad units created
- [ ] App IDs updated in code
- [ ] Android manifest updated
- [ ] iOS Info.plist updated
- [ ] Test ads working
- [ ] Production build tested

### Revenue Tracking
- [ ] AdMob console connected
- [ ] Analytics setup
- [ ] Revenue tracking
- [ ] Performance monitoring

## 🎯 Next Steps

1. **Deploy to App Store/Play Store**
2. **Monitor revenue in AdMob console**
3. **Optimize ad placement based on data**
4. **Add interstitial ads for higher revenue**
5. **Implement rewarded ads for premium features**

Bây giờ app của bạn đã sẵn sàng để kiếm tiền từ Google AdMob! 🎉 