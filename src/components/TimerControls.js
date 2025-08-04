import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Pressable, TouchableWithoutFeedback, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getTimes, saveTime, getSettings, deleteTime, deleteAllTimes } from '../utils/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeSettings from './TimeSettings';
import { wp, hp } from '../utils/responsive';

const TimeItem = ({ time, index, totalItems, type, isAverage, onDelete, disabled }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const getTimeItemStyle = () => {
        if (isAverage) {
            return styles.averageTimeItem;
        }
        const hue = (index / totalItems) * 360;
        switch (type) {
            case 'nearest':
                // const ratio = index / (totalItems - 1);
                // const r = Math.round(255 * (1 - ratio));
                // const g = Math.round(255 * ratio);
                // return { backgroundColor: `rgb(${r}, ${g}, 0)` };
                return { backgroundColor: `hsl(${hue}, 80%, 50%)` };
            case 'sub20':
                return { backgroundColor: `hsl(${hue}, 80%, 50%)` };
            case 'best':
                return { backgroundColor: '#00FF00' };
            default:
                return { backgroundColor: '#D9D9D9' };
        }
    };

    const handleDelete = async () => {
        if (onDelete) {
            await onDelete();
        }
        setModalVisible(false);
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
};

const ScrollViewWithGradient = ({ children }) => (
    <View style={styles.scrollViewContainer}>
        <ScrollView 
            style={styles.scrollList}
            contentContainerStyle={styles.scrollListContent}
        >
            {children}
        </ScrollView>
    </View>
);

const TimerControls = ({ disabled, updateTrigger, onScreenChange, onBestTimeUpdate }) => {
    const [nearestTimes, setNearestTimes] = useState([]);
    const [averageTimes, setAverageTimes] = useState([]);
    const [sub20Times, setSub20Times] = useState([]);
    const [bestTime, setBestTime] = useState('00:00.000');
    const [localSettings, setLocalSettings] = useState({
        numAvg: '5',
        numSubCount: '15',
        isSoundOn: true
    });

    useEffect(() => {
        loadSettings();
        loadData();
    }, [updateTrigger]);

    const loadSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings) {
                setLocalSettings({
                    numAvg: String(settings.numAvg || 5),
                    numSubCount: String(settings.numSubCount || 15),
                    isSoundOn: Boolean(settings.isSoundOn)
                });
            }
            return settings;
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
    };

    const loadData = async () => {
        try {
            const settings = await loadSettings();
            const times = await getTimes();
            
            if (times.length === 0) {
                setNearestTimes([]);
                setAverageTimes([]);
                setSub20Times([]);
                setBestTime('00:00.000');
                if (onBestTimeUpdate) {
                    onBestTimeUpdate('00:00.000');
                }
                return;
            }

            // Cập nhật nearest times
            setNearestTimes(times.map(t => t.time));

            // Cập nhật average times
            const latestForAvg = times.slice(0, settings.numAvg).map(t => t.time);
            setAverageTimes(latestForAvg);

            // Cập nhật sub times
            const subTimes = times
                .filter(t => convertTimeToSeconds(t.time) < settings.numSubCount)
                .sort((a, b) => convertTimeToSeconds(a.time) - convertTimeToSeconds(b.time))
                .map(t => t.time);
            setSub20Times(subTimes);

            // Cập nhật best time
            const bestTimeValue = times.reduce((min, current) => {
                const currentTime = convertTimeToSeconds(current.time);
                return currentTime < min ? currentTime : min;
            }, convertTimeToSeconds(times[0].time));
            
            const formattedBestTime = formatSeconds(bestTimeValue);
            setBestTime(formattedBestTime);
            if (onBestTimeUpdate) {
                onBestTimeUpdate(formattedBestTime);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // Các hàm utility giữ nguyên
    const convertTimeToSeconds = (timeString) => {
        const [minutesAndSeconds, milliseconds] = timeString.split('.');
        const [minutes, seconds] = minutesAndSeconds.split(':');
        return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
    };

    const formatSeconds = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    // Tính trung bình settings.numAvg lần gần nhất
    const calculateAverage = () => {
        if (averageTimes.length === 0) return '00:00,00';
        
        const sum = averageTimes
            .map(time => convertTimeToSeconds(time))
            .reduce((a, b) => a + b, 0);
        
        return formatSeconds(sum / averageTimes.length);
    };

    const handleDeleteTime = async (timeToDelete, timeList) => {
        try {
            const times = await getTimes();
            const timeItem = times.find(t => t.time === timeToDelete);
            if (timeItem) {
                await deleteTime(timeItem.id);
                // Reload data sau khi xóa
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

    // Thêm hàm để đếm tổng số time
    const getTotalTimes = () => {
        return nearestTimes.length.toString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.column}>
                    <View style={styles.infoBox}>
                        <Text style={styles.labelText}>Total</Text>
                        <TimeItem
                            time={getTotalTimes()}
                            type="nearest"
                            isAverage={true}
                        />
                    </View>
                    <ScrollViewWithGradient>
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
                            time={calculateAverage()}
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
                    <ScrollViewWithGradient>
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
});

export default TimerControls; 