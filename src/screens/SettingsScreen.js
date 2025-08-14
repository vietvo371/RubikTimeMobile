import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert, 
    KeyboardAvoidingView, 
    TouchableWithoutFeedback, 
    Platform,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import * as DatabaseUtils from '../utils/database';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { wp, hp } from '../utils/responsive';

const SettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState({
        numAvg: '5',
        numSubCount: '15',
        isSoundOn: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingData, setIsGeneratingData] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Thử khởi tạo database trước
            console.log('Initializing database...');
            try {
                await DatabaseUtils.initDatabase();
                console.log('Database initialized successfully');
            } catch (dbError) {
                console.error('Database initialization error:', dbError);
                throw new Error(`Database initialization failed: ${dbError.message}`);
            }
            
            // Lấy settings
            console.log('Loading settings...');
            const savedSettings = await DatabaseUtils.getSettings();
            console.log('Loaded settings:', savedSettings);
            
            if (!savedSettings) {
                throw new Error('Settings returned null or undefined');
            }
            
            setSettings({
                numAvg: (savedSettings.numAvg || 5).toString(),
                numSubCount: (savedSettings.numSubCount || 15).toString(),
                isSoundOn: Boolean(savedSettings.isSoundOn)
            });
            console.log('Settings updated successfully');
            
        } catch (error) {
            console.error('Error loading settings:', error);
            const errorMessage = error.message || 'Could not load settings. Please try again.';
            setError(errorMessage);
            
            // Sử dụng giá trị mặc định an toàn
            console.log('Using default settings due to error');
            setSettings({
                numAvg: '5',
                numSubCount: '15',
                isSoundOn: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const numAvg = parseInt(settings.numAvg);
            const numSubCount = parseInt(settings.numSubCount);

            // Chỉ validate numAvg và các giá trị âm
            if (isNaN(numAvg) || numAvg <= 0 || isNaN(numSubCount) || numSubCount <= 0) {
                Alert.alert('Error', 'Please enter valid numbers greater than 0');
                return;
            }

            if (numAvg > 12) {
                Alert.alert('Error', 'Average count cannot exceed 12');
                return;
            }

            // Bỏ validation cho numSubCount

            await DatabaseUtils.saveSettings({
                numAvg,
                numSubCount,
                isSoundOn: settings.isSoundOn
            });

            Alert.alert('Success', 'Settings saved successfully', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Could not save settings');
        }
    };

    const handleGenerateTestData = async () => {
        Alert.alert(
            'Generate Test Data',
            'This will create 500 sample time records. This may take a few seconds. Continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Generate',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsGeneratingData(true);
                            await DatabaseUtils.generateTestData(500);
                            Alert.alert(
                                'Success', 
                                '500 test records have been generated successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.goBack();
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error generating test data:', error);
                            Alert.alert('Error', 'Could not generate test data');
                        } finally {
                            setIsGeneratingData(false);
                        }
                    }
                }
            ]
        );
    };

    // Hiển thị loading hoặc error state
    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Icon name="arrow-left" size={24} color="#FFFFFF" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={loadSettings}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.content}>
                        <View style={styles.settingItem}>
                            <Text style={styles.label}>Average Count</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.numAvg}
                                onChangeText={(text) => setSettings(prev => ({ ...prev, numAvg: text }))}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.hint}>Max: 12</Text>
                        </View>

                        <View style={styles.settingItem}>
                            <Text style={styles.label}>Sub Count</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.numSubCount}
                                onChangeText={(text) => setSettings(prev => ({ ...prev, numSubCount: text }))}
                                keyboardType="numeric"
                                maxLength={100}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save Settings</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <View style={styles.testDataSection}>
                            <Text style={styles.sectionTitle}>Test Data</Text>
                            <Text style={styles.sectionDescription}>
                                Generate 500 sample time records to test app performance with large datasets.
                            </Text>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.generateButton,
                                    isGeneratingData && styles.generateButtonDisabled
                                ]}
                                onPress={handleGenerateTestData}
                                disabled={isGeneratingData}
                            >
                                {isGeneratingData ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.generateButtonText}>Generating...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Icon name="database-plus" size={20} color="#FFFFFF" />
                                        <Text style={styles.generateButtonText}>Generate 500 Test Records</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ed3126'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: wp('4%'),
        marginTop: hp('2%')
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        margin: wp('4%'),
        padding: wp('4%'),
        borderRadius: wp('2%'),
        alignItems: 'center'
    },
    errorText: {
        color: '#D32F2F',
        fontSize: wp('3.5%'),
        textAlign: 'center',
        marginBottom: hp('1%')
    },
    retryButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
        borderRadius: wp('1%'),
        marginTop: hp('1%')
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: wp('3.5%'),
        fontWeight: 'bold'
    },
    inner: {
        flex: 1
    },
    header: {
        padding: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
        zIndex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: Platform.OS === 'ios' ? wp('2%') : wp('4%'),
    },
    backText: {
        color: '#FFFFFF',
        fontSize: wp('4.5%'),
        marginLeft: wp('2%'),
        fontWeight: 'bold'
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        margin: wp('4%'),
        borderRadius: wp('4%'),
        padding: wp('4%')
    },
    settingItem: {
        marginBottom: hp('3%')
    },
    label: {
        fontSize: wp('4%'),
        marginBottom: hp('1%'),
        color: '#333333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: wp('2%'),
        padding: wp('3%'),
        fontSize: wp('4%')
    },
    hint: {
        color: '#666666',
        fontSize: wp('3%'),
        marginTop: hp('0.5%')
    },
    saveButton: {
        backgroundColor: '#ed3126',
        padding: wp('4%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        marginBottom: hp('3%')
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: wp('4%'),
        fontWeight: 'bold'
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: hp('3%')
    },
    testDataSection: {
        marginTop: hp('2%')
    },
    sectionTitle: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: hp('1%')
    },
    sectionDescription: {
        fontSize: wp('3.5%'),
        color: '#666666',
        marginBottom: hp('3%'),
        lineHeight: wp('5%')
    },
    generateButton: {
        backgroundColor: '#4CAF50',
        padding: wp('4%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    generateButtonDisabled: {
        backgroundColor: '#A5D6A7',
        opacity: 0.7
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: wp('4%'),
        fontWeight: 'bold',
        marginLeft: wp('2%')
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default SettingsScreen; 