import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BottomMenu = () => {
  return (
    <View style={styles.row4}>
      <View style={styles.row5}>
        <Icon name="home" size={26} color="#FFF" />
      </View>
      <TouchableOpacity>
        <Icon name="settings" size={32} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Icon name="person" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 9,
    justifyContent: 'space-between',
  },
  row5: {
    width: 138,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D4646',
    borderRadius: 50,
    paddingHorizontal: 14,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 18,
  },
});

export default BottomMenu; 