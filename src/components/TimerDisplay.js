import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { wp, hp } from '../utils/responsive';

const TimerDisplay = ({ onTimerStart, onTimerStop, onStopTimerReady, isSettingsScreen }) => {
    const [time, setTime] = useState('00:00.000');
    const [isRunning, setIsRunning] = useState(false);
    const [isReadyToStart, setIsReadyToStart] = useState(false);
    const [isShowingResult, setIsShowingResult] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const currentTimeRef = useRef(time);
    const pressTimerRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    useEffect(() => {
        currentTimeRef.current = time;
    }, [time]);

    const startTimer = () => {
        if (!isRunning) {
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                const elapsedTime = Date.now() - startTimeRef.current;
                setTime(formatTime(elapsedTime));
            }, 10);
            setIsRunning(true);
            onTimerStart?.();
        }
    };

    const stopTimer = () => {
        if (isRunning) {
            clearInterval(timerRef.current);
            const finalTime = currentTimeRef.current;
            setIsRunning(false);
            setIsShowingResult(true);
            
            const endTime = Date.now();
            const elapsedTime = endTime - startTimeRef.current;
            const accurateTime = formatTime(elapsedTime);
            setTime(accurateTime);
            
            onTimerStop?.(accurateTime);
        }
    };

    useEffect(() => {
        if (onStopTimerReady) {
            onStopTimerReady(stopTimer);
        }
    }, [isRunning]);

    const handlePressIn = () => {
        if (!isRunning) {
            pressTimerRef.current = setTimeout(() => {
                setIsShowingResult(false);
                setTime('00:00.000');
                setIsReadyToStart(true);
            }, 300);
        }
    };

    const handlePressOut = () => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
        }

        if (!isRunning && isReadyToStart) {
            startTimer();
            setIsReadyToStart(false);
        } else if (isRunning) {
            stopTimer();
        }
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: isSettingsScreen ? 0 : 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: isSettingsScreen ? 0.8 : 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [isSettingsScreen]);

    return (
        <View style={styles.container}>
            <Pressable 
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed
                ]}
                disabled={isSettingsScreen}
            >
                <Animated.Text style={[
                    styles.timeText,
                    isReadyToStart && styles.readyTimeText,
                    isShowingResult && styles.resultTimeText,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    {time}
                </Animated.Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5%',
        height: '15%',
    },
    pressable: {
        opacity: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    pressed: {
        opacity: 0.7,
    },
    timeText: {
        fontSize: wp('12%'),
        fontWeight: 'bold',
        color: '#000000',
    },
    readyTimeText: {
        color: '#00FF00',
    },
    resultTimeText: {
        color: '#FF0000',
    },
    hiddenTimeText: {
        opacity: 0,
    },
});

export default TimerDisplay; 