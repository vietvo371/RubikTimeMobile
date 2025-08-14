import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { wp, hp } from '../utils/responsive';

// Các ký hiệu Rubik cơ bản
const RUBIK_MOVES = [
  'U', 'U\'', 'U2', 'D', 'D\'', 'D2',
  'L', 'L\'', 'L2', 'R', 'R\'', 'R2',
  'F', 'F\'', 'F2', 'B', 'B\'', 'B2'
];

// Tạo scramble ngẫu nhiên
const generateScramble = (length = 20) => {
  let scramble = [];
  let lastMove = '';
  
  for (let i = 0; i < length; i++) {
    let availableMoves = RUBIK_MOVES.filter(move => {
      // Tránh lặp lại cùng một mặt
      const currentFace = move.charAt(0);
      const lastFace = lastMove.charAt(0);
      return currentFace !== lastFace;
    });
    
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    scramble.push(randomMove);
    lastMove = randomMove;
  }
  
  return scramble.join(' ');
};

const ScrambleDisplay = ({ onNewScramble, isTimerRunning }) => {
  const [scramble, setScramble] = useState('');
  const [scrambleNumber, setScrambleNumber] = useState(1);

  useEffect(() => {
    generateNewScramble();
  }, []);

  const generateNewScramble = () => {
    const newScramble = generateScramble(20);
    setScramble(newScramble);
    setScrambleNumber(prev => prev + 1);
    if (onNewScramble) {
      onNewScramble(newScramble);
    }
  };

  const handleRefresh = () => {
    if (!isTimerRunning) {
      generateNewScramble();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrambleContainer}>
        <Text style={styles.scrambleText}>{scramble}</Text>
        <TouchableOpacity 
          style={[styles.refreshButton, isTimerRunning && styles.disabledButton]} 
          onPress={handleRefresh}
          disabled={isTimerRunning}
        >
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('2%'),
    margin: 0,
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  scrambleLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#495057',
  },
  refreshButton: {
    padding: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#e9ecef',
  },
  disabledButton: {
    opacity: 0.5,
  },
  refreshText: {
    fontSize: wp('4%'),
  },
  scrambleContainer: {
    backgroundColor: '#ffffff',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrambleText: {
    fontSize: wp('2.8%'),
    fontFamily: 'monospace',
    textAlign: 'left',
    lineHeight: hp('2.5%'),
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    marginRight: wp('2%'),
  },
});

export default ScrambleDisplay;
