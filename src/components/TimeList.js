import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TimeList = () => {
  const renderTimeRow = (index) => (
    <View key={`row-${index}`} style={styles.row2}>
      <TouchableOpacity style={styles.button2} onPress={() => alert('Pressed!')}>
        <Text style={styles.text2}>{"19:02,34"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button3} onPress={() => alert('Pressed!')}>
        <Text style={styles.text2}>{"19:02,34"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button4} onPress={() => alert('Pressed!')}>
        <Text style={styles.text2}>{"19:02,34"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.column3}>
      {[1, 2, 3, 4, 5].map((_, index) => renderTimeRow(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  column3: {
    height: 255,
    paddingTop: 62,
    paddingBottom: 20,
    paddingHorizontal: 43,
    marginBottom: 13,
  },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  button2: {
    width: 83,
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    paddingVertical: 7,
    marginRight: 14,
  },
  button3: {
    width: 83,
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    paddingVertical: 7,
    marginRight: 13,
  },
  button4: {
    width: 83,
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 6,
    paddingVertical: 7,
  },
  text2: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TimeList; 