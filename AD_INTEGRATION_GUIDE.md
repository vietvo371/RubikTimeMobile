# Hướng dẫn tích hợp AdMob Rewarded Interstitial Ads

## Tổng quan

Dự án RubikTime đã được tích hợp thành công Google AdMob Rewarded Interstitial Ads theo hướng dẫn chính thức của Google. Hệ thống quảng cáo được thiết kế để tuân thủ đầy đủ các chính sách AdMob và cung cấp trải nghiệm người dùng tốt nhất.

## Cấu hình AdMob

### App ID
- **iOS**: `ca-app-pub-4926910693822363~9382841397`
- **Android**: Đã được cấu hình trong `strings.xml`

### Ad Unit IDs
- **Banner**: `ca-app-pub-4926910693822363/2119847901`
- **Interstitial**: `ca-app-pub-4926910693822363/5471516543`
- **Rewarded Interstitial**: `ca-app-pub-4926910693822363/5471516543`

## Cấu trúc hệ thống

### 1. File cấu hình (`src/utils/adConfig.js`)
- Quản lý tất cả các thông số quảng cáo
- Cài đặt tần suất hiển thị quảng cáo
- Cấu hình quyền riêng tư và tuân thủ chính sách
- Quản lý phần thưởng và trải nghiệm người dùng

### 2. Hệ thống quảng cáo (`src/utils/ads.js`)
- Khởi tạo và quản lý Mobile Ads SDK
- Xử lý các sự kiện quảng cáo
- Logic thông minh để hiển thị quảng cáo
- Preload và cache quảng cáo

### 3. Component Intro (`src/components/RewardedAdIntro.js`)
- Màn hình giới thiệu trước khi hiển thị quảng cáo có tặng thưởng
- Tuân thủ chính sách AdMob về thông báo phần thưởng
- Cho phép người dùng bỏ qua quảng cáo

### 4. Tích hợp Timer (`src/screens/TimerScreen.js`)
- Hiển thị quảng cáo xen kẽ có tặng thưởng sau mỗi 5 lần giải
- Hiển thị quảng cáo xen kẽ thường sau mỗi 3 lần giải
- Logic thông minh để tránh spam quảng cáo

## Tính năng chính

### Rewarded Interstitial Ads
- **Tần suất**: Sau mỗi 5 lần giải Rubik
- **Phần thưởng**: 1 điểm thưởng
- **Intro Screen**: Hiển thị thông tin phần thưởng trước khi xem quảng cáo
- **Tùy chọn bỏ qua**: Người dùng có thể bỏ qua bất cứ lúc nào

### Interstitial Ads
- **Tần suất**: Sau mỗi 3 lần giải Rubik
- **Mục đích**: Tăng doanh thu quảng cáo
- **Không bắt buộc**: Không yêu cầu tương tác từ người dùng

### Banner Ads
- **Vị trí**: Hiển thị trong TimerBox và LandscapeTimerBox
- **Kích thước**: Banner chuẩn
- **Tối ưu**: Responsive design cho mọi kích thước màn hình

## Tuân thủ chính sách AdMob

### 1. Intro Screen bắt buộc
- Hiển thị thông tin phần thưởng rõ ràng
- Giải thích lợi ích của việc xem quảng cáo
- Cung cấp tùy chọn bỏ qua

### 2. Quyền riêng tư
- Yêu cầu quảng cáo không cá nhân hóa
- Không thu thập dữ liệu vị trí
- Tuân thủ GDPR và CCPA (có thể cấu hình)

### 3. Trải nghiệm người dùng
- Không spam quảng cáo
- Thời gian chờ giữa các quảng cáo
- Preload quảng cáo để giảm độ trễ

## Cách sử dụng

### 1. Khởi tạo quảng cáo
```javascript
import { preloadAds } from './src/utils/ads';

// Trong App.js hoặc component khởi tạo
useEffect(() => {
  preloadAds();
}, []);
```

### 2. Hiển thị quảng cáo thông minh
```javascript
import { useAds } from './src/utils/ads';

const { showSmartAdWithLogic } = useAds();

// Hiển thị quảng cáo dựa trên logic
showSmartAdWithLogic(solveCount, (reward) => {
  console.log('User earned reward:', reward);
});
```

### 3. Tùy chỉnh cấu hình
```javascript
import { AD_CONFIG } from './src/utils/adConfig';

// Thay đổi tần suất hiển thị quảng cáo
AD_CONFIG.displaySettings.rewardedInterstitialFrequency = 10;
AD_CONFIG.displaySettings.interstitialFrequency = 5;
```

## Cài đặt và triển khai

### iOS
1. **Podfile**: Đã cấu hình `react-native-google-mobile-ads`
2. **Info.plist**: Đã thêm `GADApplicationIdentifier` và `SKAdNetworkItems`
3. **AppDelegate.mm**: Đã khởi tạo Mobile Ads SDK

### Android
1. **build.gradle**: Đã cấu hình dependencies
2. **AndroidManifest.xml**: Đã thêm quyền Internet
3. **strings.xml**: Cần thêm AdMob App ID

### Cần bổ sung cho Android
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<resources>
    <string name="app_name">RubikTime</string>
    <string name="admob_app_id">ca-app-pub-4926910693822363~9382841397</string>
</resources>
```

## Kiểm tra và gỡ lỗi

### 1. Test IDs
- Sử dụng Test IDs trong môi trường development
- Tự động chuyển sang Production IDs trong release

### 2. Logging
- Tất cả sự kiện quảng cáo được log đầy đủ
- Kiểm tra console để debug

### 3. AdMob Console
- Theo dõi hiệu suất quảng cáo
- Kiểm tra vi phạm chính sách
- Tối ưu hóa doanh thu

## Tối ưu hóa

### 1. Hiệu suất
- Preload quảng cáo khi app khởi động
- Cache quảng cáo để giảm độ trễ
- Tự động tải lại sau khi hiển thị

### 2. Trải nghiệm người dùng
- Không hiển thị quảng cáo quá thường xuyên
- Cho phép bỏ qua quảng cáo
- Thông báo rõ ràng về phần thưởng

### 3. Doanh thu
- Cân bằng giữa trải nghiệm người dùng và doanh thu
- A/B testing để tối ưu tần suất hiển thị
- Theo dõi metrics quan trọng

## Lưu ý quan trọng

1. **Tuân thủ chính sách**: Luôn tuân thủ chính sách AdMob để tránh bị từ chối
2. **Testing**: Sử dụng Test IDs trong development
3. **Monitoring**: Theo dõi hiệu suất và báo cáo vi phạm
4. **Updates**: Cập nhật SDK thường xuyên
5. **User Experience**: Ưu tiên trải nghiệm người dùng

## Hỗ trợ

- **Google AdMob Documentation**: https://developers.google.com/admob
- **React Native Google Mobile Ads**: https://github.com/react-native-admob/admob
- **AdMob Policies**: https://support.google.com/admob/answer/6129563

## Kết luận

Hệ thống quảng cáo AdMob đã được tích hợp thành công vào RubikTime với đầy đủ tính năng và tuân thủ chính sách. Hệ thống được thiết kế để cung cấp trải nghiệm người dùng tốt nhất trong khi vẫn đảm bảo doanh thu quảng cáo tối ưu.
