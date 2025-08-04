import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNav = ({ currentScreen = 'onehand', onScreenChange }) => {
    return (
        <View style={styles.container}>
            <View style={styles.navContainer}>
                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        currentScreen === 'onehand' && styles.activeButton
                    ]}
                    onPress={() => onScreenChange('onehand')}
                >
                    <Icon
                        name="hand-wave"
                        size={28}
                        color="#FFFFFF"
                    />
                    {currentScreen === 'onehand' && (
                        <Text style={styles.text}>One Hand</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        currentScreen === 'twohand' && styles.activeButton
                    ]}
                    onPress={() => onScreenChange('twohand')}
                >
                    <Icon
                        name="hand-clap"
                        size={28}
                        color="#FFFFFF"
                    />
                    {currentScreen === 'twohand' && (
                        <Text style={styles.text}>Two Hand</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        currentScreen === 'settings' && styles.activeButton
                    ]}
                    onPress={() => onScreenChange('settings')}
                >
                    <Icon
                        name="cog"
                        size={28}
                        color="#FFFFFF"
                    />
                    {currentScreen === 'settings' && (
                        <Text style={styles.text}>Settings</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginHorizontal: 10,
        marginBottom: 5,
    },
    navContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000000",
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    navButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    activeButton: {
        backgroundColor: "#4D4646",
        borderRadius: 50,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 18,
        marginLeft: 10,
        fontWeight: 'bold'
    }
});

export default BottomNav; 