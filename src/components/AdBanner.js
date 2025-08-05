import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { wp, hp } from '../utils/responsive';
import { getRandomAd, trackAdImpression, trackAdClick, shouldShowAd, getAdByType } from '../utils/adManager';

const AdBanner = ({ onAdPress, adType = null }) => {
    const [adData, setAdData] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Kiểm tra xem có nên hiển thị ad không
        if (shouldShowAd()) {
            const ad = adType ? getAdByType(adType) : getRandomAd();
            setAdData(ad);
            setIsVisible(true);
            trackAdImpression(ad.type);
        }
    }, [adType]);

    const handleAdPress = () => {
        if (onAdPress && adData) {
            onAdPress(adData);
            trackAdClick(adData.type);
        }
        console.log('Ad clicked:', adData?.title);
    };

    const handleCloseAd = () => {
        setIsVisible(false);
    };

    if (!isVisible || !adData) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.adContainer} 
                onPress={handleAdPress}
                activeOpacity={0.8}
            >
                <View style={styles.adContent}>
                    <View style={styles.adTextContainer}>
                        <Text style={styles.adTitle}>{adData.title}</Text>
                        <Text style={styles.adDescription}>{adData.description}</Text>
                        <View style={[styles.ctaContainer, { backgroundColor: adData.color }]}>
                            <Text style={styles.ctaText}>{adData.cta}</Text>
                        </View>
                    </View>
                    
                    {adData.image && (
                        <Image 
                            source={adData.image}
                            style={styles.adImage}
                            resizeMode="cover"
                        />
                    )}
                </View>
                
                <View style={styles.adBadge}>
                    <Text style={styles.adBadgeText}>AD</Text>
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleCloseAd}
            >
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    adContainer: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        borderRadius: wp('4%'),
        marginHorizontal: '3%',
        overflow: 'hidden',
        position: 'relative',
    },
    adContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('2%'),
    },
    adTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    adTitle: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: hp('0.5%'),
    },
    adDescription: {
        fontSize: wp('3%'),
        color: '#CCCCCC',
        marginBottom: hp('1%'),
        lineHeight: wp('4%'),
    },
    ctaContainer: {
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.5%'),
        borderRadius: wp('2%'),
        alignSelf: 'flex-start',
    },
    ctaText: {
        fontSize: wp('3%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    adImage: {
        width: wp('20%'),
        height: wp('20%'),
        borderRadius: wp('2%'),
        marginLeft: wp('2%'),
    },
    adBadge: {
        position: 'absolute',
        top: hp('1%'),
        right: wp('2%'),
        backgroundColor: '#FF6B35',
        paddingHorizontal: wp('1%'),
        paddingVertical: hp('0.2%'),
        borderRadius: wp('1%'),
    },
    adBadgeText: {
        fontSize: wp('2%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        position: 'absolute',
        top: hp('0.5%'),
        right: wp('1%'),
        width: wp('6%'),
        height: wp('6%'),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        fontSize: wp('4%'),
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default AdBanner; 