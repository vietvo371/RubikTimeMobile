import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LandscapeTimerControls = ({ onSettingsPress, onClearAll, onOneHand, onTwoHand }) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.button, styles.settingButton]} onPress={onSettingsPress}>
                    <Icon name="cog" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Setting</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={onClearAll}>
                    <Icon name="trash-can-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.button, styles.oneHandButton]} onPress={onOneHand}>
                    <Icon name="hand-wave" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>One Hand</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.button, styles.twoHandButton]} onPress={onTwoHand}>
                    <Icon name="hand-clap" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Two Hand</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 130,
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    settingButton: {
        backgroundColor: '#2196F3',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    oneHandButton: {
        backgroundColor: '#F59321',
    },
    twoHandButton: {
        backgroundColor: '#9C27B0',
    },
});

export default LandscapeTimerControls; 