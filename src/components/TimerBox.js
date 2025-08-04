import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { wp, hp } from '../utils/responsive';

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
            </View>
            <Animated.View style={[
                styles.bestTryWrapper,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
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
            </Animated.View>
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
        bottom: -45,
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
    circleBackground: {
        position: 'absolute',
        width: 200,
        height: 100,
        backgroundColor: '#ed3126',
        borderRadius: "60%",
        top: -5,
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
        top: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    bestTryImage: {
        width: wp('45%'),
        height: hp('12%'),
    },
    bestTryTime: {
        marginTop: hp('0.5%'),
        fontSize: wp('5.5%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    box: {
        height: hp('15%'),
        backgroundColor: "#0C0C0C",
        borderRadius: wp('4%'),
        marginHorizontal: '3%',
        zIndex: 2,
    },
});

export default TimerBox; 