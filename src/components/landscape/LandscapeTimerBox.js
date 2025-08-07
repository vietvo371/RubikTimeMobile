import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { wp, hp } from '../../utils/responsive';
import { BannerAdComponent } from '../../utils/ads';

const LandscapeTimerBox = ({ bestTime = '00:00.000', onMenuPress, disabled }) => {
    const [showMenu, setShowMenu] = useState(false);

    const menuItems = [
        { icon: 'cog', label: 'Settings', action: 'settings', color: '#2196F3' },
        { icon: 'delete', label: 'Clear All', action: 'clear', color: '#FF3B30' },
        { icon: 'hand-wave', label: 'One Hand', action: 'onehand', color: '#F59321' },
        { icon: 'hand-clap', label: 'Two Hand', action: 'twohand', color: '#9C27B0' },
    ];

    const handleMenuPress = (action) => {
        onMenuPress(action);
        setShowMenu(false);
    };

    const closeMenu = () => {
        setShowMenu(false);
    };

    return (
        <View style={styles.view}>
            <TouchableOpacity 
                style={[
                    styles.menuButton,
                    disabled && styles.disabledButton
                ]}
                onPress={() => !disabled && setShowMenu(!showMenu)}
                disabled={disabled}
            >
                <Icon name="menu" size={28} color="#000000" />
            </TouchableOpacity>
            {showMenu && !disabled && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.menuOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.menuContainer}>
                                {menuItems.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.menuItem, { backgroundColor: item.color }]}
                                        onPress={() => handleMenuPress(item.action)}
                                        disabled={disabled}
                                    >
                                        <Icon name={item.icon} size={20} color="#FFFFFF" style={styles.menuIcon} />
                                        <Text style={styles.menuText}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
            <View style={styles.box}>
                <BannerAdComponent />
            </View>
            <View style={styles.bestTryWrapper}>
                <View style={styles.circleBackground} />
                <View style={styles.bestTryContainer}>
                    <View style={styles.trophyContainer}>
                        <Image 
                            source={require('../../assets/images/BestTry.png')}
                            style={styles.bestTryImage}
                            resizeMode="contain"
                        />
                        <View style={styles.timeContainer}>
                            <Text style={styles.bestTryTime}>{bestTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    view: {
        backgroundColor: "#ed3126",
        borderColor: "#5E27FD",
        paddingTop: 0,
        paddingBottom: hp('3%'),
        marginBottom: hp('3%'),
        position: 'relative',
    },
    bestTryWrapper: {
        position: 'absolute',
        bottom: hp('-7%'),
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
    circleBackground: {
        position: 'absolute',
        width: wp('50%'),
        height: hp('12%'),
        backgroundColor: '#ed3126',
        borderRadius: wp('25%'),
        top: hp('-1%'),
        zIndex: -1,
    },
    bestTryContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },
    trophyContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    timeContainer: {
        position: 'absolute',
        top: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    bestTryImage: {
        width: wp('45%'),
        height: hp('11%'),
    },
    bestTryTime: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    box: {
        height: hp('8%'),
        backgroundColor: "#0C0C0C",
        borderBottomEndRadius: wp('1%'),
        borderBottomStartRadius: wp('1%'),
        marginBottom: hp('0.5%'),
        marginHorizontal: wp('18%'),
        zIndex: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666666',
        marginBottom: 2,
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F59321',
    },
    menuButton: {
        position: 'absolute',
        left: wp('4%'),
        top: hp('2%'),
        padding: wp('2%'),
        zIndex: 10,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'box-none',
    },
    menuContainer: {
        position: 'absolute',
        top: hp('7%'),
        left: wp('4%'),
        backgroundColor: '#FFFFFF',
        borderRadius: wp('2%'),
        width: wp('40%'),
        zIndex: 1001,
        paddingVertical: hp('0.5%'),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxHeight: hp('60%'),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp('2.5%'),
        marginHorizontal: wp('1%'),
        marginVertical: hp('0.25%'),
        borderRadius: wp('1.5%'),
    },
    menuIcon: {
        width: wp('6%'),
        marginRight: wp('2.5%'),
    },
    menuText: {
        color: '#FFFFFF',
        fontSize: wp('3.5%'),
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default LandscapeTimerBox; 