import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
    SafeAreaView, 
    View, 
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    ImageBackground,
    StatusBar,
    Alert,
    Dimensions,
    PanResponder,
    Linking
} from "react-native";
import LandscapeTimerDisplay from '../components/landscape/LandscapeTimerDisplay';
import LandscapeTimerBox from '../components/landscape/LandscapeTimerBox';
import { saveTime, getTimes, deleteTime, deleteAllTimes } from '../utils/database';
import { Platform } from 'react-native';
import SettingsScreen from './SettingsScreen';
import { wp, hp } from '../utils/responsive';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TimerProvider } from '../contexts/TimerContext';
import { LandscapeTimerDisplayProvider, useLandscapeTimerDisplay } from '../components/landscape/LandscapeTimerDisplayContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const InnerLandscapeTimerScreen = React.forwardRef(({ navigation, ...props }, ref) => {
    // Log navigation prop để debug
    console.log('Navigation prop in InnerLandscapeTimerScreen:', navigation);
    const [isScreenEnabled, setIsScreenEnabled] = useState(true);
    const [stopTimerFunc, setStopTimerFunc] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [bestTime, setBestTime] = useState('00:00,00');
    const [showSettings, setShowSettings] = useState(false);
    const [clearAllFunc, setClearAllFunc] = useState(null);
    const [touchCount, setTouchCount] = useState(0);
    const [leftTouched, setLeftTouched] = useState(false);
    const [rightTouched, setRightTouched] = useState(false);
    const [isStoppingTimer, setIsStoppingTimer] = useState(false);
    const [isStopDisabled, setIsStopDisabled] = useState(false);

    const gesture = Gesture.Manual()
        .onTouchesDown((event) => {
            if (isStoppingTimer || isStopDisabled) return;

            const touches = event.allTouches;
            let isLeftTouched = false;
            let isRightTouched = false;
            
            touches.forEach(touch => {
                const screenWidth = Dimensions.get('window').width;
                if (touch.x < screenWidth / 2) {
                    isLeftTouched = true;
                } else {
                    isRightTouched = true;
                }
            });

            setLeftTouched(isLeftTouched);
            setRightTouched(isRightTouched);

            if (isLeftTouched && isRightTouched && !isScreenEnabled && stopTimerFunc && !isStoppingTimer) {
                setIsStoppingTimer(true);
                setIsStopDisabled(true);
                const touchTime = performance.now();
                stopTimerFunc(touchTime);
                setIsScreenEnabled(true);

                setTimeout(() => {
                    setIsStopDisabled(false);
                }, 1000);
            }
        })
        .onTouchesUp(() => {
            setLeftTouched(false);
            setRightTouched(false);
            setIsStoppingTimer(false);
        })
        .enabled(!isScreenEnabled);

    const { isTimerStarted } = useLandscapeTimerDisplay();

    // Expose methods to parent
    React.useImperativeHandle(ref, () => ({
        handleTimerStart: () => {
            setIsScreenEnabled(false);
        },
        handleTimerStop: async (finalTime) => {
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
        },
        handleStopTimerReady: (stopTimer) => {
            console.log('handleStopTimerReady called with stopTimer:', !!stopTimer);
            if (stopTimer) {
                const wrappedStopTimer = () => {
                    console.log('Wrapped stopTimer called');
                    stopTimer();
                };
                setStopTimerFunc(() => wrappedStopTimer);
            }
        },
        handleBestTimeUpdate: (time) => {
            setBestTime(time);
        }
    }));

    useEffect(() => {
        StatusBar.setHidden(true);
        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const checkOrientation = () => {
                const { width, height } = Dimensions.get('window');
                if (width < height && navigation?.isFocused()) {
                    Alert.alert(
                        'Landscape Mode Required',
                        'Please rotate your device to landscape mode to use this feature.',
                        [
                            {
                                text: 'Switch to Portrait Mode',
                                // onPress: () => {
                                //     navigation?.replace('Timer');
                                // },
                                style: 'cancel'
                            }
                        ],
                        { cancelable: false }
                    );
                }
            };

            // Kiểm tra orientation ban đầu
            checkOrientation();

            // Sử dụng event subscription
            const subscription = Dimensions.addEventListener('change', () => {
                checkOrientation();
            });

            return () => {
                subscription.remove();
            };
        }
    }, [navigation]);

    useEffect(() => {
        console.log('isTimerStarted changed:', isTimerStarted);
        setIsScreenEnabled(!isTimerStarted);
    }, [isTimerStarted]);

    const handleScreenPress = () => {
        console.log('Single touch ignored');
    };

    const handleTimerStart = () => {
        console.log('handleTimerStart called, setting isScreenEnabled to false');
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

    const handleBestTimeUpdate = (time) => {
        setBestTime(time);
    };

    const handleSettingsPress = () => {
        if (navigation) {
            navigation.navigate('Settings');
        } else {
            console.error('Navigation prop is undefined');
        }
    };

    const handleOneHand = () => {
        navigation?.replace('Timer');
    };

    const handleTwoHand = () => {
        // Đã ở màn hình Two Hand nên không cần làm gì
    };

    const handleClearAll = async () => {
        try {
            Alert.alert(
                'Confirm delete',
                'Are you sure you want to delete all saved times?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                // Xóa tất cả dữ liệu từ SQLite
                                await deleteAllTimes();
                                
                                // Reset các state liên quan
                                setUpdateTrigger(prev => prev + 1);
                                setBestTime('00:00.000');
                                
                                Alert.alert('Success', 'All times have been deleted');
                            } catch (error) {
                                console.error('Error clearing times:', error);
                                Alert.alert('Error', 'Cannot delete times');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error in handleClearAll:', error);
            Alert.alert('Error', 'An error occurred while deleting times');
        }
    };

    const handleMenuPress = (action) => {
        console.log('Menu action:', action);
        switch(action) {
            case 'settings':
                handleSettingsPress();
                break;
            case 'clear':
                handleClearAll();
                break;
            case 'onehand':
                handleOneHand();
                break;
            case 'twohand':
                handleTwoHand();
                break;
        }
    };

    const handleStopTimerReady = useCallback((stopTimer) => {
        console.log('handleStopTimerReady called with stopTimer:', !!stopTimer);
        if (stopTimer) {
            const wrappedStopTimer = () => {
                console.log('Wrapped stopTimer called');
                stopTimer();
            };
            setStopTimerFunc(() => wrappedStopTimer);
        }
    }, []);

    const handleSetClearAllFunc = useCallback((func) => {
        console.log('Setting clearAllFunc');
        setClearAllFunc(() => func);
    }, []);

    const timerContextValue = {
        onTimerStart: handleTimerStart,
        onTimerStop: handleTimerStop,
        onStopTimerReady: handleStopTimerReady,
        onBestTimeUpdate: handleBestTimeUpdate,
        updateTrigger,
        onClearAll: handleSetClearAllFunc
    };

    return (
        <SafeAreaView style={styles.container}>
            {showSettings ? (
                <SettingsScreen />
            ) : (
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <GestureDetector gesture={gesture}>
                        <TouchableWithoutFeedback 
                            onPress={handleScreenPress}
                            disabled={isScreenEnabled}
                        >
                            <View style={styles.fullScreenTouchable}>
                                {!isScreenEnabled && (
                                    <View style={styles.touchZonesContainer}>
                                        <View style={[
                                            styles.touchZone, 
                                            styles.leftZone,
                                            leftTouched && styles.touchedZone
                                        ]} />
                                        <View style={[
                                            styles.touchZone, 
                                            styles.rightZone,
                                            rightTouched && styles.touchedZone
                                        ]} />
                                    </View>
                                )}
                                
                                <View style={styles.column}>
                                    <View style={styles.topBar}>
                                        <LandscapeTimerBox 
                                            bestTime={bestTime} 
                                            onMenuPress={handleMenuPress}
                                            disabled={!isScreenEnabled}
                                        />
                                    </View>
                                    
                                    <View style={styles.content}>
                                        <LandscapeTimerDisplay
                                            onTimerStart={handleTimerStart}
                                            onTimerStop={handleTimerStop}
                                            onStopTimerReady={handleStopTimerReady}
                                            onBestTimeUpdate={handleBestTimeUpdate}
                                            updateTrigger={updateTrigger}
                                            onClearAll={handleSetClearAllFunc}
                                            isScreenEnabled={isScreenEnabled}
                                        />
                                    </View>
                                </View>

                                {!isScreenEnabled && (
                                    <View 
                                        style={styles.overlay} 
                                        pointerEvents="none"
                                    >
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </GestureDetector>
                </GestureHandlerRootView>
            )}
        </SafeAreaView>
    );
});

const LandscapeTimerScreen = ({ navigation }) => {
    // Log navigation prop để debug
    console.log('Navigation prop in LandscapeTimerScreen:', navigation);
    const timerContextValue = {
        onTimerStart: () => {
            if (innerScreenRef.current) {
                innerScreenRef.current.handleTimerStart();
            }
        },
        onTimerStop: (finalTime) => {
            if (innerScreenRef.current) {
                innerScreenRef.current.handleTimerStop(finalTime);
            }
        },
        onStopTimerReady: (stopTimer) => {
            if (innerScreenRef.current) {
                innerScreenRef.current.handleStopTimerReady(stopTimer);
            }
        },
        onBestTimeUpdate: (time) => {
            if (innerScreenRef.current) {
                innerScreenRef.current.handleBestTimeUpdate(time);
            }
        },
    };

    const innerScreenRef = useRef();

    return (
        <TimerProvider value={timerContextValue}>
            <LandscapeTimerDisplayProvider>
                <InnerLandscapeTimerScreen 
                    ref={innerScreenRef} 
                    navigation={navigation} 
                />
            </LandscapeTimerDisplayProvider>
        </TimerProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: hp('4%'), // Thêm padding phía trên để tránh đè navbar
    },
    fullScreenTouchable: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    column: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: hp('2%'), // Thêm padding cho column
    },
    topBar: {
        height: hp('12%'), // Giảm chiều cao của topBar
        position: 'relative',
        paddingTop: hp('1%'),
        paddingBottom: hp('2%'),
        zIndex: 10, // Đảm bảo topBar hiển thị trên cùng
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('3%'),
    },
    bottomBar: {
        height: SCREEN_HEIGHT * 0.25,
        backgroundColor: '#F59321',
        borderTopLeftRadius: Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.04,
        borderTopRightRadius: Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.04,
        padding: Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.02,
    },
    controlsWrapper: {
        flex: 1,
        backgroundColor: '#000000',
        borderRadius: Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.02,
        padding: Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.015,
        justifyContent: 'center',
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
    touchZonesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 1000,
        pointerEvents: 'none',
    },
    touchZone: {
        flex: 1,
        height: '100%',
    },
    leftZone: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    rightZone: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    touchedZone: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
});

export default LandscapeTimerScreen; 