import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Pressable, TouchableWithoutFeedback, TextInput, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getTimes, saveTime, getSettings, deleteTime, deleteAllTimes, getTimesCount, optimizeDatabase } from '../utils/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeSettings from './TimeSettings';
import { wp, hp } from '../utils/responsive';

// Loading component
const LoadingIndicator = ({ visible, text = "Loading..." }) => {
    if (!visible) return null;
    
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>{text}</Text>
        </View>
    );
};

// Performance info component
const PerformanceInfo = ({ totalCount, isLoading, loadedCount }) => {
    if (totalCount === 0) return null;
    
    return (
        <View style={styles.performanceInfo}>
            <Text style={styles.performanceText}>
                {totalCount > 1000 ? `Large dataset (${totalCount} records)` : `${totalCount} records`}
            </Text>
            {loadedCount < totalCount && (
                <Text style={styles.loadedText}>
                    Loaded: {loadedCount}/{totalCount}
                </Text>
            )}
            {isLoading && (
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.performanceLoader} />
            )}
        </View>
    );
};

// Test data info component
const TestDataInfo = ({ totalCount }) => {
    if (totalCount === 0) return null;
    
    const isTestData = totalCount >= 500;
    
    return (
        <View style={styles.testDataInfo}>
            <Icon 
                name={isTestData ? "database-check" : "database"} 
                size={16} 
                color={isTestData ? "#4CAF50" : "#666666"} 
            />
            <Text style={[
                styles.testDataText,
                isTestData && styles.testDataTextSuccess
            ]}>
                {isTestData ? `${totalCount} records (including test data)` : `${totalCount} records`}
            </Text>
        </View>
    );
};

// Tách TimeItem thành component riêng để tối ưu re-render
const TimeItem = React.memo(({ time, index, totalItems, type, isAverage, onDelete, disabled }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const getTimeItemStyle = useMemo(() => {
        if (isAverage) {
            return styles.averageTimeItem;
        }
        const hue = (index / totalItems) * 360;
        switch (type) {
            case 'nearest':
                return { backgroundColor: `hsl(${hue}, 80%, 50%)` };
            case 'sub20':
                return { backgroundColor: `hsl(${hue}, 80%, 50%)` };
            case 'best':
                return { backgroundColor: '#00FF00' };
            default:
                return { backgroundColor: '#D9D9D9' };
        }
    }, [index, totalItems, type, isAverage]);

    const handleDelete = useCallback(async () => {
        if (onDelete) {
            await onDelete();
        }
        setModalVisible(false);
    }, [onDelete]);

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.timeItem,
                    getTimeItemStyle,
                    isAverage && styles.averageTimeItem
                ]}
                onPress={() => !isAverage && !disabled && setModalVisible(true)}
                disabled={isAverage || disabled}
            >
                <Text style={[
                    styles.timeText,
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
                                <Text style={[styles.buttonText, {color: '#000000'}]}>Cancel</Text>
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
});

// Tối ưu ScrollView với pagination
const ScrollViewWithGradient = React.memo(({ children, onEndReached, hasMoreData }) => {
    const handleScroll = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (hasMoreData && onEndReached) {
                onEndReached();
            }
        }
    }, [hasMoreData, onEndReached]);

    return (
        <View style={styles.scrollViewContainer}>
            <ScrollView 
                style={styles.scrollList}
                contentContainerStyle={styles.scrollListContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </View>
    );
});

const TimerControls = ({ disabled, updateTrigger, onScreenChange, onBestTimeUpdate, navigation }) => {
    const [nearestTimes, setNearestTimes] = useState([]);
    const [averageTimes, setAverageTimes] = useState([]);
    const [sub20Times, setSub20Times] = useState([]);
    const [bestTime, setBestTime] = useState('00:00.000');
    const [localSettings, setLocalSettings] = useState({
        numAvg: '5',
        numSubCount: '15',
        isSoundOn: true
    });
    
    // State cho total count và loaded count
    const [totalCount, setTotalCount] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);
    
    // Thêm state cho pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [allTimes, setAllTimes] = useState([]);
    
    // Cache cho các tính toán
    const [cachedCalculations, setCachedCalculations] = useState({});

    // Tối ưu load settings với useCallback
    const loadSettings = useCallback(async () => {
        try {
            const settings = await getSettings();
            if (settings) {
                const newSettings = {
                    numAvg: String(settings.numAvg || 5),
                    numSubCount: String(settings.numSubCount || 15),
                    isSoundOn: Boolean(settings.isSoundOn)
                };
                setLocalSettings(newSettings);
                return settings;
            }
            return {
                numAvg: 5,
                numSubCount: 15,
                isSoundOn: true
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            const defaultSettings = {
                numAvg: 5,
                numSubCount: 15,
                isSoundOn: true
            };
            setLocalSettings({
                numAvg: String(defaultSettings.numAvg),
                numSubCount: String(defaultSettings.numSubCount),
                isSoundOn: defaultSettings.isSoundOn
            });
            return defaultSettings;
        }
    }, []);

    // Tối ưu load data với pagination
    const loadData = useCallback(async (page = 0, append = false) => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            const settings = await loadSettings();
            
            // Load data theo batch để tránh lag
            const batchSize = 50;
            const offset = page * batchSize;
            
            // Sử dụng pagination từ database
            const times = await getTimes(batchSize, offset);
            const totalCountResult = await getTimesCount();
            
            if (totalCountResult === 0) {
                setNearestTimes([]);
                setAverageTimes([]);
                setSub20Times([]);
                setBestTime('00:00.000');
                setAllTimes([]);
                setHasMoreData(false);
                setTotalCount(0);
                setLoadedCount(0);
                if (onBestTimeUpdate) {
                    onBestTimeUpdate('00:00.000');
                }
                return;
            }

            // Cập nhật allTimes
            if (append) {
                setAllTimes(prev => [...prev, ...times]);
                setLoadedCount(prev => prev + times.length);
            } else {
                setAllTimes(times);
                setLoadedCount(times.length);
            }

            // Chỉ tính toán cho dữ liệu hiện tại
            const currentTimes = append ? 
                [...allTimes, ...times] : 
                times;

            // Cập nhật nearest times (hiển thị tất cả đã load)
            const displayTimes = currentTimes.map(t => t.time);
            setNearestTimes(displayTimes);

            // Cập nhật average times (chỉ tính cho settings.numAvg items đầu)
            const latestForAvg = currentTimes.slice(0, settings.numAvg).map(t => t.time);
            setAverageTimes(latestForAvg);

            // Cập nhật sub times (tính cho tất cả đã load)
            const subTimes = currentTimes
                .filter(t => convertTimeToSeconds(t.time) < settings.numSubCount)
                .sort((a, b) => convertTimeToSeconds(a.time) - convertTimeToSeconds(b.time))
                .map(t => t.time);
            setSub20Times(subTimes);

            // Cập nhật best time (từ toàn bộ dữ liệu - chỉ load khi cần)
            if (page === 0) {
                const allTimesForBest = await getTimes(1000, 0); // Load 1000 records đầu để tìm best
                const bestTimeValue = allTimesForBest.reduce((min, current) => {
                    const currentTime = convertTimeToSeconds(current.time);
                    return currentTime < min ? currentTime : min;
                }, convertTimeToSeconds(allTimesForBest[0].time));
                
                const formattedBestTime = formatSeconds(bestTimeValue);
                setBestTime(formattedBestTime);
                if (onBestTimeUpdate) {
                    onBestTimeUpdate(formattedBestTime);
                }
            }

            // Cập nhật pagination state
            setHasMoreData(offset + batchSize < totalCountResult);
            setCurrentPage(page);
            setTotalCount(totalCountResult);
            console.log('Updated totalCount:', totalCountResult, 'loadedCount:', times.length);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, allTimes, onBestTimeUpdate, loadSettings, convertTimeToSeconds, formatSeconds]);

    // Load thêm data khi scroll
    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMoreData) {
            loadData(currentPage + 1, true);
        }
    }, [isLoading, hasMoreData, currentPage, loadData]);

    useEffect(() => {
        loadData(0, false);
        
        // Tối ưu database định kỳ khi có nhiều dữ liệu
        const optimizeIfNeeded = async () => {
            try {
                const totalCountResult = await getTimesCount();
                if (totalCountResult > 1000) {
                    await optimizeDatabase();
                }
            } catch (error) {
                console.error('Error optimizing database:', error);
            }
        };
        
        optimizeIfNeeded();
    }, [updateTrigger]);

    // Debug useEffect để theo dõi state changes
    useEffect(() => {
        console.log('State changed - totalCount:', totalCount, 'loadedCount:', loadedCount);
    }, [totalCount, loadedCount]);

    // Thêm listener để refresh data khi quay lại từ Settings
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh data khi quay lại từ Settings (có thể đã generate test data)
            loadData(0, false);
        });

        return unsubscribe;
    }, [navigation, loadData]);

    // Các hàm utility được memoize
    const convertTimeToSeconds = useCallback((timeString) => {
        const [minutesAndSeconds, milliseconds] = timeString.split('.');
        const [minutes, seconds] = minutesAndSeconds.split(':');
        return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
    }, []);

    const formatSeconds = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }, []);

    // Tối ưu tính average với useMemo
    const calculateAverage = useMemo(() => {
        if (averageTimes.length === 0) return '00:00,00';
        
        const sum = averageTimes
            .map(time => convertTimeToSeconds(time))
            .reduce((a, b) => a + b, 0);
        
        return formatSeconds(sum / averageTimes.length);
    }, [averageTimes, convertTimeToSeconds, formatSeconds]);

    const handleDeleteTime = useCallback(async (timeToDelete, timeList) => {
        try {
            const times = await getTimes();
            const timeItem = times.find(t => t.time === timeToDelete);
            if (timeItem) {
                await deleteTime(timeItem.id);
                // Reload data sau khi xóa
                loadData(0, false);
            }
        } catch (error) {
            console.error('Error deleting time:', error);
        }
    }, [loadData]);

    const handleClearAll = useCallback(async () => {
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
                                await deleteAllTimes();
                                
                                // Reset state
                                setNearestTimes([]);
                                setAverageTimes([]);
                                setSub20Times([]);
                                setBestTime('00:00.000');
                                setAllTimes([]);
                                setCurrentPage(0);
                                setHasMoreData(false);
                                setTotalCount(0);
                                setLoadedCount(0);
                                
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
    }, []);

    // Tối ưu getTotalTimes với useMemo - hiển thị phân trang
    const getTotalTimes = useMemo(() => {
        console.log('getTotalTimes - loadedCount:', loadedCount, 'totalCount:', totalCount);
        // Fallback để tránh undefined
        const safeLoadedCount = loadedCount || 0;
        const safeTotalCount = totalCount || 0;
        
        if (safeTotalCount === 0) return '0';
        if (safeLoadedCount >= safeTotalCount) return safeTotalCount.toString();
        return `${safeLoadedCount}/${safeTotalCount}`;
    }, [loadedCount, totalCount]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.column}>
                    <View style={styles.infoBox}>
                        <Text style={styles.labelText}>Total</Text>
                        <TimeItem
                            time={getTotalTimes || '0'}
                            type="nearest"
                            isAverage={true}
                        />
                    </View>
                    <ScrollViewWithGradient 
                        hasMoreData={hasMoreData}
                        onEndReached={handleLoadMore}
                    >
                        {nearestTimes.map((time, index) => (
                            <TimeItem
                                key={`nearest-${index}`}
                                time={time}
                                index={index}
                                totalItems={nearestTimes.length}
                                type="nearest"
                                onDelete={() => handleDeleteTime(time, 'nearest')}
                                disabled={disabled}
                            />
                        ))}
                    </ScrollViewWithGradient>
                </View>

                <View style={styles.column}>
                    <View style={styles.infoBox}>
                        <Text style={styles.labelText}>Avg {localSettings.numAvg} Near</Text>
                        <TimeItem
                            time={calculateAverage}
                            type="nearest"
                            isAverage={true}
                        />
                    </View>
                    <View style={styles.settingsContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.settingButton]}
                            onPress={() => onScreenChange('settings')}
                            disabled={disabled}
                        >
                            <View style={styles.buttonContent}>
                                <Icon name="cog" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}></Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.clearButton]}
                            onPress={handleClearAll}
                            disabled={disabled}
                        >
                            <View style={styles.buttonContent}>
                                <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}></Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.twoHandButton]}
                            onPress={() => onScreenChange('twohand')}
                            disabled={disabled}
                        >
                            <View style={styles.buttonContent}>
                                <Icon name="hand-clap" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}></Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.oneHandButton]}
                            onPress={() => onScreenChange('onehand')}
                            disabled={disabled}
                        >
                            <View style={styles.buttonContent}>
                                <Icon name="hand-wave" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}></Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.column}>
                    <View style={styles.infoBox}>
                        <Text style={styles.labelText}>Sub {localSettings.numSubCount}s</Text>
                        <TimeItem
                            time={sub20Times.length.toString()}
                            type="nearest"
                            isAverage={true}
                        />
                    </View>
                    <ScrollViewWithGradient 
                        hasMoreData={false}
                    >
                        {sub20Times.map((time, index) => (
                            <TimeItem
                                key={`sub20-${index}`}
                                time={time}
                                index={index}
                                totalItems={sub20Times.length}
                                type="sub20"
                                onDelete={() => handleDeleteTime(time, 'sub20')}
                                disabled={disabled}
                            />
                        ))}
                    </ScrollViewWithGradient>
                </View>

                
            </View>
            {/* <LoadingIndicator visible={isLoading} text="Loading times..." /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '2%',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: wp('3%'),
        paddingHorizontal: 0,
    },
    column: {
        alignItems: 'center',
        flex: 1,
        width: '33%',
    },
    infoBox: {
        backgroundColor: '#D9D9D9',
        borderRadius: wp('2%'),
        paddingVertical: '2%',
        paddingHorizontal: '2%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelText: {
        fontSize: wp('3%'),
        fontWeight: '600',
        textAlign: 'center',
    },
    averageTime: {
        color: "#000000",
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 2,
        letterSpacing: 1,
    },
    scrollViewContainer: {
        position: 'relative',
        width: wp('28%'),
        height: hp('28%'),
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: wp('2%'),
        marginTop: hp('1%'),

    },
    scrollList: {   
        padding: wp('1%'),
        width: '100%',
    },
    scrollListContent: {
        alignItems: 'center',
        paddingVertical: hp('1%'),
        width: '100%',
    },
    timeItem: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('2%'),
        borderRadius: wp('1.5%'),
        width: '96%',
        marginBottom: hp('0.5%'),
        marginHorizontal: '2%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: wp('3.5%'),
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    averageTimeText: {
        fontSize: wp('3%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        textAlign: 'center',
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
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        marginBottom: 20,
    },
    timeDetail: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
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
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    deleteButton: {
        shadowOffset: {
            width: 0,
            height: 1,
        },
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    deleteText: {
        color: '#FFF',
    },
    averageTimeItem: {
        backgroundColor: '#FF6B00',
        marginTop: hp('1%'),
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2%'),
        width: '96%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    settingsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: hp('1.5%'),
        width: '100%',
        flex: 1,
        paddingVertical: hp('1.5%'),
        marginTop: hp('1%'),
    },
    button: {
        width: '65%',
        height: hp('4.5%'),
        borderRadius: wp('1.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: wp('1%'),
        height: '100%',
        width: '100%',
    },
    settingButton: {
        backgroundColor: '#2196F3',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    twoHandButton: {
        backgroundColor: '#9C27B0',
    },
    oneHandButton: {
        backgroundColor: '#F59321',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: wp('4%'),
    },
    performanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp('1%'),
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2%'),
        backgroundColor: '#D9D9D9',
        borderRadius: wp('1.5%'),
        width: '100%',
    },
    performanceText: {
        fontSize: wp('3.5%'),
        fontWeight: '600',
        color: '#333',
    },
    loadedText: {
        fontSize: wp('3%'),
        color: '#666',
        marginTop: hp('0.5%'),
    },
    performanceLoader: {
        marginLeft: wp('1%'),
    },
    testDataInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp('1%'),
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2%'),
        backgroundColor: '#D9D9D9',
        borderRadius: wp('1.5%'),
        width: '100%',
    },
    testDataText: {
        fontSize: wp('3.5%'),
        fontWeight: '600',
        color: '#666666',
        marginLeft: wp('1%'),
    },
    testDataTextSuccess: {
        color: '#4CAF50',
    },
});

export default TimerControls; 