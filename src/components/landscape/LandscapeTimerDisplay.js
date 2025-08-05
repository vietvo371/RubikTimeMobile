import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal, TouchableOpacity, Alert } from 'react-native';
import { getTimes, saveTime, getSettings, deleteTime } from '../../utils/timeStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TIME_KEY } from '../../utils/timeStorage';
import { wp, hp } from '../../utils/responsive';
import { GestureHandlerRootView, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useTimer } from '../../contexts/TimerContext';
import { LandscapeTimerDisplayProvider, useLandscapeTimerDisplay } from './LandscapeTimerDisplayContext';

const formatTime = (ms) => {
    // Đảm bảo ms không âm
    if (ms < 0) {
        ms = 0;
    }
    
    // Làm tròn đến 3 chữ số thập phân để tránh số lẻ
    ms = Math.round(ms);
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    
    // Đảm bảo milliseconds luôn có 3 chữ số
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

const Timer = React.memo(({ onStart, onStop, displayTime, setDisplayTime }) => {
    const { 
        isRunning,
        isReadyToStart,
        isShowingResult,
        setTime,
        time,
        stopTime
    } = useLandscapeTimerDisplay();
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const frameRef = useRef();

    useEffect(() => {
        if (isReadyToStart) {
            setDisplayTime('00:00.000');
            setTime('00:00.000');
        }
    }, [isReadyToStart]);

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = performance.now(); // Sử dụng performance.now() cho độ chính xác cao hơn
            
            const updateTimer = () => {
                const elapsedTime = performance.now() - startTimeRef.current;
                const formattedTime = formatTime(elapsedTime);
                setDisplayTime(formattedTime);
                
                frameRef.current = requestAnimationFrame(updateTimer);
            };
            
            frameRef.current = requestAnimationFrame(updateTimer);
        } else if (startTimeRef.current > 0) {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            
            // Tính toán thời gian chính xác
            const currentTime = stopTime || performance.now();
            const elapsedTime = Math.max(0, currentTime - startTimeRef.current);
            const accurateTime = formatTime(elapsedTime);
            
            setDisplayTime(accurateTime);
            setTime(accurateTime);
            
            // Gọi onStop callback để thông báo timer đã dừng
            if (onStop) {
                onStop(accurateTime);
            }
        }

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [isRunning, stopTime]);

    return (
        <Text style={[
            styles.timeText,
            isReadyToStart && styles.readyTimeText,
            isShowingResult && styles.resultTimeText,
        ]}>
            {displayTime}
        </Text>
    );
});

const InnerLandscapeTimerDisplay = ({ onTimerStart, onTimerStop, onStopTimerReady, onBestTimeUpdate, updateTrigger, onClearAll, isScreenEnabled }) => {
    const {
        time,
        setTime,
        isRunning,
        setIsRunning,
        isReadyToStart,
        setIsReadyToStart,
        isShowingResult,
        setIsShowingResult,
        timeList,
        setTimeList,
        averageTime,
        setAverageTime,
        sub15Count,
        setSub15Count,
        sub20Times,
        setSub20Times,
        isTimerStarted,
        setIsTimerStarted,
        stopTime,
        setStopTime
    } = useLandscapeTimerDisplay();
    
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const currentTimeRef = useRef(time);
    const pressStartTimeRef = useRef(null);
    const pressTimerRef = useRef(null);
    const [displayTime, setDisplayTime] = useState('00:00.000');

    const [settings, setSettings] = useState({
        numAvg: 5,
        numSubCount: 15
    });

    const [leftPressed, setLeftPressed] = useState(false);
    const [rightPressed, setRightPressed] = useState(false);
    const bothPressTimer = useRef(null);

    useEffect(() => {
        currentTimeRef.current = time;
    }, [time]);

    const stopTimer = useCallback((touchTime) => {
        if (isRunning) {
            const currentTime = touchTime || performance.now();
            setStopTime(currentTime);
            setIsRunning(false);
            setIsShowingResult(true);
            setIsTimerStarted(false);
            
            // Đảm bảo thời gian được lưu ngay lập tức
            const elapsedTime = Math.max(0, currentTime - startTimeRef.current);
            const accurateTime = formatTime(elapsedTime);
            setTime(accurateTime);
            
            console.log('Timer stopped with time:', accurateTime);
        }
    }, [isRunning]);

    useEffect(() => {
        console.log('Registering stopTimer function');
        if (onStopTimerReady) {
            onStopTimerReady(stopTimer);
        }
    }, [stopTimer, onStopTimerReady]);

    useEffect(() => {
        loadSettings();
    }, [updateTrigger]);

    useEffect(() => {
        if (!isRunning && time !== '00:00.000' && time !== displayTime) {
            console.log('Timer stopped, saving time:', time);
            Promise.all([
                saveTime(time)
            ]).then(() => {
                loadData();
            }).catch((error) => {
                console.error('Error saving time:', error);
            });
        }
    }, [isRunning, time, displayTime]);

    // Thêm useEffect để theo dõi thời gian khi timer dừng
    useEffect(() => {
        if (!isRunning && time !== '00:00.000') {
            console.log('Timer stopped, saving time:', time);
            saveTime(time)
                .then(() => {
                    console.log('Time saved successfully:', time);
                    loadData();
                })
                .catch((error) => {
                    console.error('Error saving time:', error);
                });
        }
    }, [isRunning, time]);

    useEffect(() => {
        if (onClearAll) {
            onClearAll(handleClearAll);
        }
    }, [onClearAll]);

    const loadSettings = async () => {
        try {
            const savedSettings = await getSettings();
            if (savedSettings) {
                setSettings({
                    numAvg: parseInt(savedSettings.numAvg) || 5,
                    numSubCount: parseInt(savedSettings.numSubCount) || 15
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Nếu có lỗi, giữ nguyên giá trị mặc định trong state
        }
    };

    const loadData = async () => {
        try {
            const times = await getTimes();
            
            if (times.length === 0) {
                setTimeList([]);
                setAverageTime('00:00.000');
                setSub20Times([]);
                setSub15Count(0);
                if (onBestTimeUpdate) {
                    onBestTimeUpdate('00:00.000');
                }
                return;
            }

            setTimeList(times);

            // Tính trung bình của settings.numAvg lần gần nhất
            const latestForAvg = times.slice(0, settings.numAvg).map(t => t.time);
            if (latestForAvg.length > 0) {
                const sum = latestForAvg
                    .map(time => convertTimeToMs(time))
                    .reduce((a, b) => a + b, 0);
                setAverageTime(formatTime(sum / latestForAvg.length));
            }

            // Lọc và sắp xếp sub times
            const subTimes = times
                .filter(t => {
                    const timeInSeconds = convertTimeToMs(t.time) / 1000;
                    return timeInSeconds < settings.numSubCount;
                })
                .sort((a, b) => convertTimeToMs(a.time) - convertTimeToMs(b.time))
                .map(t => t.time);
            
            setSub20Times(subTimes);
            setSub15Count(subTimes.length);

            // Cập nhật best time
            if (times.length > 0) {
                const bestTimeValue = Math.min(...times.map(t => convertTimeToMs(t.time)));
                const formattedBestTime = formatTime(bestTimeValue);
                if (onBestTimeUpdate) {
                    onBestTimeUpdate(formattedBestTime);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, [settings, updateTrigger]);

    const convertTimeToMs = (timeString) => {
        try {
            const [minutesAndSeconds, milliseconds] = timeString.split('.');
            const [minutes, seconds] = minutesAndSeconds.split(':');
            
            const minutesNum = parseInt(minutes) || 0;
            const secondsNum = parseInt(seconds) || 0;
            const millisecondsNum = parseInt(milliseconds) || 0;
            
            return minutesNum * 60000 + secondsNum * 1000 + millisecondsNum;
        } catch (error) {
            console.error('Error converting time to ms:', error, timeString);
            return 0;
        }
    };

    const prepareTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        startTimeRef.current = 0;
        pressStartTimeRef.current = null;
        pressTimerRef.current = null;
        
        setTime('00:00.000');
        setDisplayTime('00:00.000');
        setIsRunning(false);
        setIsShowingResult(false);
        setStopTime(0);
        
        if (global.gc) {
            global.gc();
        }
    };

    const startTimer = () => {
        if (!isRunning) {
            console.log('Starting timer...');
            // Reset startTimeRef để đảm bảo tính toán chính xác
            startTimeRef.current = performance.now();
            setIsRunning(true);
            setIsTimerStarted(true);
            console.log('Before onTimerStart');
            onTimerStart?.();
            console.log('After onTimerStart');
        }
    };

    const onLongPress = (side, event) => {
        console.log('LongPress event:', side, event.nativeEvent.state, 'isRunning:', isRunning);
        
        if (event.nativeEvent.state === State.ACTIVE) {
            if (side === 'left') {
                setLeftPressed(true);
                console.log('Left hand pressed');
            } else {
                setRightPressed(true);
                console.log('Right hand pressed');
            }

            if ((side === 'left' && rightPressed) || (side === 'right' && leftPressed)) {
                console.log('Both hands detected, isRunning:', isRunning);
                if (!isRunning) {
                    // Bắt đầu timer
                    bothPressTimer.current = setTimeout(() => {
                        console.log('Starting timer with both hands...');
                        setIsShowingResult(false);
                        prepareTimer();
                        setIsReadyToStart(true);
                    }, 300);
                } else {
                    // Dừng timer nếu đang chạy
                    console.log('Stopping timer with both hands...');
                    stopTimer(performance.now());
                }
            }
        } else if (event.nativeEvent.state === State.END) {
            if (isReadyToStart) {
                console.log('Starting timer after preparation...');
                setLeftPressed(false);
                setRightPressed(false);
                startTimer();
                setIsReadyToStart(false);
            }
            if (side === 'left') {
                setLeftPressed(false);
            } else {
                setRightPressed(false);
            }

            if (bothPressTimer.current) {
                clearTimeout(bothPressTimer.current);
                bothPressTimer.current = null;
            }
        }
    };

    const handleDeleteTime = async (timeToDelete, timeList) => {
        try {
            const times = await getTimes();
            const timeItem = times.find(t => t.time === timeToDelete);
            if (timeItem) {
                await deleteTime(timeItem.id);
                loadData();
            }
        } catch (error) {
            console.error('Error deleting time:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            Alert.alert(
                'Confirm delete',
                'Are you sure you want to delete all saved times?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await AsyncStorage.setItem(TIME_KEY, JSON.stringify([]));
                                setTimeList([]);
                                setAverageTime('00:00.000');
                                setSub20Times([]);
                                setSub15Count(0);
                                
                                if (onBestTimeUpdate) {
                                    onBestTimeUpdate('00:00.000');
                                }
                                
                                Alert.alert('Success', 'All saved times have been deleted');
                            } catch (error) {
                                console.error('Error in clearing times:', error);
                                Alert.alert('Error', 'Unable to delete times');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error in handleClearAll:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa thời gian');
        }
    };

    const TimeItem = ({ time, index, totalItems, type, isAverage, onDelete, disabled }) => {
        const [modalVisible, setModalVisible] = useState(false);

        const getTimeItemStyle = () => {
            if (isAverage) {
                return styles.averageTimeItem;
            }
            const hue = (index / totalItems) * 360;
            switch (type) {
                case 'nearest':
                    return { backgroundColor: `hsl(${hue}, 100%, 50%)` };
                case 'sub20':
                    return { backgroundColor: `hsl(${hue}, 100%, 50%)` };
                default:
                    return { backgroundColor: "red" };
            }
        };

        const handleDelete = async () => {
            try {
                const times = await getTimes();
                const timeItem = times.find(t => t.time === time);
                if (timeItem) {
                    await deleteTime(timeItem.id);
                    await loadData();
                    setModalVisible(false);
                } else {
                    Alert.alert('Error', 'Time not found');
                }
            } catch (error) {
                Alert.alert('Error', 'Unable to delete time');
            }
        };

        return (
            <>
                <TouchableOpacity
                    style={[
                        styles.timeItem,
                        getTimeItemStyle(),
                        isAverage && styles.averageTimeItem
                    ]}
                    onPress={() => !isAverage && !disabled && setModalVisible(true)}
                    disabled={isAverage || disabled}
                >
                    <Text style={[
                        styles.timeItemText,
                        isAverage && styles.averageTimeText
                    ]}>
                        {time}
                    </Text>
                </TouchableOpacity>

                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Confirm delete</Text>
                            </View>
                            <View style={styles.modalBody}>
                                <Text style={styles.timeDetail}>Time: {time}</Text>
                            </View>
                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.closeButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.deleteButton]}
                                    onPress={handleDelete}
                                >
                                    <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </>
        );
    };

    const TimeList = React.memo(({ times, onDelete, isRunning }) => {
        return (
            <ScrollView 
                style={styles.timeList}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {times.slice(0, 20).map((timeObj, index) => (
                    <TimeItem
                        key={timeObj.id}
                        time={timeObj.time}
                        index={index}
                        totalItems={times.length}
                        type="nearest"
                        onDelete={() => onDelete(timeObj.time)}
                        disabled={isRunning}
                    />
                ))}
            </ScrollView>
        );
    });

    const getTotalTimes = () => {
        return timeList.length.toString();
    };

    useEffect(() => {
        return () => {
            prepareTimer();
        };
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.content} pointerEvents="box-none">
                <View style={styles.fingerprintColumn}>
                    <LongPressGestureHandler
                        onHandlerStateChange={(event) => onLongPress('left', event)}
                        minDurationMs={0}
                    >
                        <View style={[styles.fingerprint, {marginLeft: wp('15%')}]}>
                            <Image 
                                source={require('../../assets/images/1.png')} 
                                style={[styles.image, leftPressed && styles.imagePressed]}
                            />
                        </View>
                    </LongPressGestureHandler>
                </View>

                <View style={styles.column}>
                    <View style={styles.statsBoxContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.labelText}>Total</Text>
                            <View style={styles.averageTimeItem}>
                                <Text style={styles.averageTimeText}>{getTotalTimes()}</Text>
                            </View>
                        </View>
                        <TimeList 
                            times={timeList}
                            onDelete={handleDeleteTime}
                            isRunning={isRunning}
                        />
                    </View>
                </View>

                <View style={styles.timerSection}>
                    <View style={styles.timerContainer}>
                        <Timer
                            onStart={startTimer}
                            onStop={stopTimer}
                            displayTime={displayTime}
                            setDisplayTime={setDisplayTime}
                        />
                        <View style={styles.avgInfoBox}>
                            <Text style={styles.avgLabel}>Avg {settings.numAvg} Near</Text>
                            <View style={styles.avgTimeContainer}>
                                <Text style={styles.avgTimeText}>{averageTime}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.column}>
                    <View style={styles.statsBoxContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.labelText}>Count sub {settings.numSubCount}s</Text>
                            <View style={styles.averageTimeItem}>
                                <Text style={styles.averageTimeText}>{sub15Count}</Text>
                            </View>
                        </View>
                        <ScrollView 
                            style={styles.timeList}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            {sub20Times.map((time, index) => (
                                <TimeItem
                                    key={`sub20-${index}`}
                                    time={time}
                                    index={index}
                                    totalItems={sub20Times.length}
                                    type="sub20"
                                    onDelete={() => handleDeleteTime(time, 'sub20')}
                                    disabled={isRunning}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.fingerprintColumn}>
                    <LongPressGestureHandler
                        onHandlerStateChange={(event) => onLongPress('right', event)}
                        minDurationMs={0}
                    >
                        <View style={[styles.fingerprint, {marginRight: wp('15%')}]}>
                            <Image 
                                source={require('../../assets/images/2.png')} 
                                style={[styles.image, rightPressed && styles.imagePressed]}
                            />
                        </View>
                    </LongPressGestureHandler>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const LandscapeTimerDisplay = (props) => {
    return (
        <LandscapeTimerDisplayProvider>
            <InnerLandscapeTimerDisplay {...props} />
        </LandscapeTimerDisplayProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('10%'),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    fingerprintColumn: {
        width: wp('2%'),
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
        marginBottom: hp('5%'),
    },
    column: {
        width: wp('30%'),
        height: '100%',
        alignItems: 'center',
    },
    statsBoxContainer: {
        width: '100%',
        borderRadius: wp('2%'),
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: wp('1.3%'),
        height: hp('28%'),
        marginHorizontal: wp('0.5%'),
    },
    infoBox: {
        backgroundColor: "#D9D9D9",
        borderRadius: wp('2%'),
        paddingVertical: hp('0.6%'),
        paddingHorizontal: wp('1.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: hp('0.3%'),
    },
    labelText: {
        color: "#000000",
        fontSize: wp('2.8%'),
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: hp('2.1%'),
        opacity: 0.8,
    },
    averageTimeItem: {
        backgroundColor: '#FF6B00',
        marginTop: 3,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        width: '100%',
    },
    averageTimeText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    timeList: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 8,
        marginTop: 8,
        paddingVertical: 4,
    },
    timeItem: {
        padding: wp('1.2%'),
        marginVertical: hp('0.18%'),
        marginHorizontal: wp('0.2%'),
        borderRadius: wp('1%'),
        alignItems: 'center',
        marginBottom: hp('0.3%'),
    },
    timeItemText: {
        color: '#FFFFFF',
        fontSize: wp('3.2%'),
        fontWeight: '500',
        textAlign: 'center',
    },
    timerSection: {
        width: wp('36%'),
        marginTop: hp('1%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fingerprint: {
        width: wp('15%'),
        height: wp('15%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        opacity: 0.7,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    timeText: {
        fontSize: wp('12%'),
        marginBottom: hp('2%'),
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        width: '100%',
    },
    readyTimeText: {
        color: '#00FF00',
    },
    resultTimeText: {
        color: '#FF0000',
    },
    pressed: {
        opacity: 0.7,
    },
    bestTimeContainer: {
        position: 'absolute',
        top: -40,
        alignItems: 'center',
    },
    bestTimeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    disabledContainer: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '80%',
        maxWidth: 300,
        padding: 20,
    },
    modalHeader: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    modalBody: {
        marginBottom: 20,
    },
    timeDetail: {
        fontSize: 16,
        color: '#333',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#F5F5F5',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    deleteText: {
        color: '#FFF',
    },
    avgInfoBox: {
        backgroundColor: '#D9D9D9',
        borderRadius: wp('2%'),
        padding: wp('1%'),
        width: wp('50%'),
        alignItems: 'center',
    },
    avgLabel: {
        color: '#000000',
        fontSize: wp('2.8%'),
        fontWeight: '600',
        opacity: 0.8,
    },
    avgTimeContainer: {
        backgroundColor: '#FF6B00',
        borderRadius: wp('1%'),
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2%'),
        marginTop: hp('0.5%'),
        width: '100%',
        alignItems: 'center',
    },
    avgTimeText: {
        color: '#FFFFFF',
        fontSize: wp('3.2%'),
        fontWeight: 'bold',
    },
    imagePressed: {
        opacity: 0.7,
    },
});

export default LandscapeTimerDisplay; 