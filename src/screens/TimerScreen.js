import React, { useState, useEffect } from "react";
import { 
    SafeAreaView, 
    View, 
    ScrollView, 
    ImageBackground, 
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    useWindowDimensions,
    Dimensions,
    Keyboard,
    Alert
} from "react-native";
import TimerBox from '../components/TimerBox';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import BottomNav from '../components/BottomNav';
import { saveTime } from '../utils/database';
import { wp, hp } from '../utils/responsive';
import { useOrientation } from '../hooks/useOrientation';

const TimerScreen = ({ navigation }) => {
    const { width, height } = useWindowDimensions();
    const [isScreenEnabled, setIsScreenEnabled] = useState(true);
    const [stopTimerFunc, setStopTimerFunc] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [bestTime, setBestTime] = useState('00:00,00');
    const orientation = useOrientation();

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            const { width, height } = window;
            console.log('New dimensions:', width, height);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setUpdateTrigger(prev => prev + 1);
        });

        return unsubscribe;
    }, [navigation]);

    const handleScreenPress = () => {
        if (!isScreenEnabled && stopTimerFunc) {
            stopTimerFunc();
        }
    };

    const handleTimerStart = () => {
        setIsScreenEnabled(false);
    };

    const handleTimerStop = async (finalTime) => {
        setIsScreenEnabled(true);
        if (finalTime) {
            try {
                const savedTime = await saveTime(finalTime);
                console.log('Time saved successfully:', savedTime);
                setUpdateTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Error saving time:', error.message);
                Alert.alert(
                    'Error',
                    'Could not save time. Please try again.'
                );
            }
        }
    };

    const handleStopTimerReady = (stopTimer) => {
        setStopTimerFunc(() => stopTimer);
    };

    const handleBestTimeUpdate = (time) => {
        setBestTime(time);
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "ios" ? 0 : 20 }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[
                        styles.container,
                        orientation === 'LANDSCAPE' && styles.landscapeContainer
                    ]}>
                        <TouchableWithoutFeedback 
                            onPress={handleScreenPress}
                            disabled={isScreenEnabled}
                        >
                            <View style={styles.fullScreenTouchable}>
                                <View style={styles.container}>
                                    <TimerBox bestTime={bestTime} />
                                    <TimerDisplay
                                        onTimerStart={handleTimerStart}
                                        onTimerStop={handleTimerStop}
                                        onStopTimerReady={handleStopTimerReady}
                                        isSettingsScreen={false}
                                    />
                                    <View style={styles.column3}>
                                        <TimerControls 
                                            disabled={!isScreenEnabled} 
                                            updateTrigger={updateTrigger}
                                            onScreenChange={(screen) => {
                                                if (screen === 'twohand') {
                                                    navigation.navigate('TwoHand');
                                                } else if (screen === 'settings') {
                                                    navigation.navigate('Settings');
                                                }
                                            }}
                                            onBestTimeUpdate={handleBestTimeUpdate}
                                            navigation={navigation}
                                        />
                                    </View>
                                </View>
                                {!isScreenEnabled && (
                                    <View 
                                        style={styles.overlay} 
                                        pointerEvents="none"
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    fullScreenTouchable: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    column3: {
        flex: 1,
        backgroundColor: "#ed3126",
        borderTopLeftRadius: wp('8%'),
        borderTopRightRadius: wp('8%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1%'),
    },
    landscapeContainer: {
        flexDirection: 'row',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: 999,
    },
});

export default TimerScreen;