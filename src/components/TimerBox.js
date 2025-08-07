import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { wp, hp } from '../utils/responsive';
import { BannerAdComponent } from '../utils/ads';


const TimerBox = ({ bestTime = '00:00.000' }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: bestTime ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: bestTime ? 1 : 0.8,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [bestTime]);

    return (
        <View style={styles.view}>
            <View style={styles.box}>
                <BannerAdComponent />
            </View>
            <View style={styles.bestTryWrapper}>
                <View style={styles.circleBackground} />
                <View style={styles.bestTryContainer}>
                    <View style={styles.trophyContainer}>
                        <Image 
                            source={require('../assets/images/BestTry.png')}
                            style={styles.bestTryImage}
                            resizeMode="contain"
                        />
                        <View style={styles.timeContainer}>
                            <Text style={styles.bestTryTime}>{bestTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    view: {
        backgroundColor: "#ed3126",
        borderColor: "#5E27FD",
        paddingTop: '5%',
        paddingBottom: '10%',
        marginBottom: '10%',
        borderBottomLeftRadius: wp('8%'),
        borderBottomRightRadius: wp('8%'),
        position: 'relative',
    },
    bestTryWrapper: {
        position: 'absolute',
        bottom: hp('-7%'),
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
    circleBackground: {
        position: 'absolute',
        width: wp('50%'),
        height: hp('12%'),
        backgroundColor: '#ed3126',
        borderRadius: wp('25%'),
        top: hp('-1%'),
        zIndex: -1,
    },
    bestTryContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },
    trophyContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    timeContainer: {
        position: 'absolute',
        top: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    bestTryImage: {
        width: wp('45%'),
        height: hp('11%'),
    },
    bestTryTime: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    box: {
        height: hp('15%'),
        backgroundColor: "#000000",
        borderRadius: wp('4%'),
        marginHorizontal: '3%',
        marginVertical: hp('1%'),
        zIndex: 2,
        overflow: 'hidden',
    },
});

export default TimerBox; 