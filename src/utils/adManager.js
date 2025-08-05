// Ad Manager để quản lý các loại quảng cáo
export const adTypes = {
    PREMIUM_UPGRADE: 'premium_upgrade',
    FEATURE_PROMO: 'feature_promo',
    NEW_FEATURE: 'new_feature',
    REMOVE_ADS: 'remove_ads'
};

export const adData = {
    [adTypes.PREMIUM_UPGRADE]: {
        title: 'Premium Timer Pro',
        description: 'Unlock advanced features and remove ads',
        cta: 'Upgrade Now',
        color: '#4CAF50'
    },
    [adTypes.FEATURE_PROMO]: {
        title: 'New Features Available',
        description: 'Try advanced statistics and custom themes',
        cta: 'Learn More',
        color: '#2196F3'
    },
    [adTypes.NEW_FEATURE]: {
        title: 'Export Your Data',
        description: 'Backup and share your times with friends',
        cta: 'Try Now',
        color: '#FF9800'
    },
    [adTypes.REMOVE_ADS]: {
        title: 'Remove All Ads',
        description: 'Enjoy ad-free experience forever',
        cta: 'Remove Ads',
        color: '#E91E63'
    }
};

export const getRandomAd = () => {
    const adTypeKeys = Object.keys(adTypes);
    const randomType = adTypeKeys[Math.floor(Math.random() * adTypeKeys.length)];
    return {
        type: randomType,
        ...adData[randomType]
    };
};

export const getAdByType = (type) => {
    return {
        type,
        ...adData[type]
    };
};

// Analytics tracking
export const trackAdImpression = (adType) => {
    console.log('Ad impression:', adType);
    // Có thể thêm analytics service ở đây
};

export const trackAdClick = (adType) => {
    console.log('Ad click:', adType);
    // Có thể thêm analytics service ở đây
};

// Ad display logic
export const shouldShowAd = () => {
    // Có thể thêm logic để kiểm tra user đã mua premium chưa
    // Hoặc logic để hiển thị ad theo tỷ lệ nào đó
    return Math.random() > 0.3; // 70% chance hiển thị ad
};

export const getAdDisplayInterval = () => {
    // Có thể thêm logic để hiển thị ad theo thời gian
    return 30000; // 30 giây
}; 