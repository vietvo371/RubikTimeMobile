import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { wp, hp } from '../utils/responsive';

const AdMobBanner = ({ adUnitId = null, onAdLoaded, onAdFailedToLoad }) => {
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [adError, setAdError] = useState(null);

    // Sử dụng test ID cho development, real ID cho production
    const adUnitIdToUse = __DEV__ 
        ? TestIds.BANNER 
        : adUnitId || 'ca-app-pub-3940256099942544/6300978111'; // Default test ID

    const handleAdLoaded = () => {
        console.log('AdMob Banner loaded successfully');
        setIsAdLoaded(true);
        setAdError(null);
        if (onAdLoaded) {
            onAdLoaded();
        }
    };

    const handleAdFailedToLoad = (error) => {
        console.log('AdMob Banner failed to load:', error);
        setIsAdLoaded(false);
        setAdError(error);
        if (onAdFailedToLoad) {
            onAdFailedToLoad(error);
        }
    };

    const handleAdOpened = () => {
        console.log('AdMob Banner opened');
    };

    const handleAdClosed = () => {
        console.log('AdMob Banner closed');
    };

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={adUnitIdToUse}
                size={BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={handleAdLoaded}
                onAdFailedToLoad={handleAdFailedToLoad}
                onAdOpened={handleAdOpened}
                onAdClosed={handleAdClosed}
            />
            {adError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Ad failed to load
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    errorContainer: {
        padding: wp('2%'),
        backgroundColor: '#FFE0E0',
        borderRadius: wp('2%'),
        marginTop: hp('1%'),
    },
    errorText: {
        fontSize: wp('3%'),
        color: '#D32F2F',
        textAlign: 'center',
    },
});

export default AdMobBanner; 