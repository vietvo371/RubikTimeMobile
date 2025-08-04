import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Platform } from 'react-native';
import { getSettings, saveSettings } from '../utils/database';
import { Keyboard } from 'react-native';

const TimeSettings = ({ disabled, onClose }) => {
    const [average, setAverage] = useState('5');
    const [subCount, setSubCount] = useState('15');
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentValue, setCurrentValue] = useState('');
    const [currentField, setCurrentField] = useState('');
    const [tempValue, setTempValue] = useState('');

    // Load settings khi component mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await getSettings();
        setAverage(settings.numAvg.toString());
        setSubCount(settings.numSubCount.toString());
    };

    const openModal = (field, value) => {
        setCurrentField(field);
        setCurrentValue(value);
        setTempValue(value);
        setModalVisible(true);
    };

    const saveValue = async () => {
        const newValue = parseInt(tempValue);
        
        // Kiểm tra giá trị hợp lệ
        if (isNaN(newValue) || newValue <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ lớn hơn 0');
            return;
        }

        // Chỉ giới hạn cho average
        if (currentField === 'average' && newValue > 12) {
            Alert.alert('Lỗi', 'Số lượt tính trung bình không được vượt quá 12');
            return;
        }
        // Bỏ validation cho subCount

        // Cập nhật state
        if (currentField === 'average') {
            setAverage(tempValue);
        } else if (currentField === 'subCount') {
            setSubCount(tempValue);
        }

        // Lưu vào AsyncStorage
        const success = await saveSettings({
            numAvg: currentField === 'average' ? newValue : parseInt(average),
            numSubCount: currentField === 'subCount' ? newValue : parseInt(subCount)
        });

        if (!success) {
            Alert.alert('Lỗi', 'Không thể lưu cài đặt');
        }

        setModalVisible(false);

        if (success) {
            onClose?.();
        }
    };

    return (
        <View style={[
            styles.container,
            disabled && styles.disabledContainer
        ]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[
                    styles.container,
                    disabled && styles.disabledContainer
                ]}>
                    <View style={styles.settingRow}>
                        <Text style={[
                            styles.label,
                            disabled && styles.disabledText
                        ]}>Set Average</Text>
                        <TouchableOpacity 
                            style={[
                                styles.valueContainer,
                                disabled && styles.disabledButton
                            ]}
                            onPress={() => !disabled && openModal('average', average)}
                            disabled={disabled}
                        >
                            <Text style={[
                                styles.valueText,
                                disabled && styles.disabledText
                            ]}>{average}</Text>
                            <Text style={[
                                styles.maxValue,
                                disabled && styles.disabledText
                            ]}>12</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={[
                            styles.label,
                            disabled && styles.disabledText
                        ]}>Sub Count</Text>
                        <TouchableOpacity 
                            style={[
                                styles.valueContainer,
                                disabled && styles.disabledButton
                            ]}
                            onPress={() => !disabled && openModal('subCount', subCount)}
                            disabled={disabled}
                        >
                            <Text style={[
                                styles.valueText,
                                disabled && styles.disabledText
                            ]}>{subCount}</Text>
                            <Text style={[
                                styles.maxValue,
                                disabled && styles.disabledText
                            ]}>20</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingRow}>
                        <Text style={[
                            styles.label,
                            disabled && styles.disabledText
                        ]}>Master Volume</Text>
                        <View style={[
                            styles.toggleContainer,
                            disabled && styles.disabledButton
                        ]}>
                            <TouchableOpacity 
                                style={[
                                    styles.toggleButton,
                                    isSoundOn && styles.activeToggle,
                                    disabled && styles.disabledToggle
                                ]}
                                onPress={() => !disabled && setIsSoundOn(true)}
                                disabled={disabled}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    isSoundOn && styles.activeText,
                                    disabled && styles.disabledText
                                ]}>On</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.toggleButton,
                                    !isSoundOn && styles.activeToggle,
                                    disabled && styles.disabledToggle
                                ]}
                                onPress={() => !disabled && setIsSoundOn(false)}
                                disabled={disabled}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    !isSoundOn && styles.activeText,
                                    disabled && styles.disabledText
                                ]}>Off</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Modal
                        visible={modalVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.modalContainer}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={tempValue}
                                        onChangeText={setTempValue}
                                        keyboardType="numeric"
                                        autoFocus={true}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity 
                                            style={styles.modalButton}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.modalButtonText}>Huỷ</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.modalButton, styles.saveButton]}
                                            onPress={saveValue}
                                        >
                                            <Text style={styles.modalButtonText}>Lưu</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 15,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    valueBox: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 18,
    },
    activeValue: {
        backgroundColor: '#666',
    },
    valueText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    maxValue: {
        color: '#666',
        marginLeft: 10,
        fontSize: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 20,
        padding: 2,
    },
    toggleButton: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 18,
    },
    activeToggle: {
        backgroundColor: '#666',
    },
    toggleText: {
        color: '#666',
        fontSize: 16,
    },
    activeText: {
        color: '#FFFFFF',
    },
    modalContainer: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
    },
    modalInput: {
        backgroundColor: '#444',
        color: '#FFFFFF',
        fontSize: 24,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        backgroundColor: '#666',
    },
    saveButton: {
        backgroundColor: '#5E27FD',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledContainer: {
        opacity: 0.7,
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.5,
    },
    disabledToggle: {
        backgroundColor: '#444',
    }
});

export default TimeSettings; 