import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wp, hp } from '../../utils/responsive';

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

const ScrambleDisplay = ({ onNewScramble, isTimerRunning, onTimerStop }) => {
  const [scramble, setScramble] = useState('');
  const [scrambleNumber, setScrambleNumber] = useState(1);
  const [prevTimerRunning, setPrevTimerRunning] = useState(isTimerRunning);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    generateNewScramble();
    setPrevTimerRunning(isTimerRunning);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && prevTimerRunning !== undefined) {
      if (isTimerRunning && !prevTimerRunning) {
        // Timer vừa bắt đầu
      }
      else if (!isTimerRunning && prevTimerRunning) {
        // Timer vừa kết thúc, tạo scramble mới
        generateNewScramble();
        if (onTimerStop) {
          onTimerStop();
        }
      }
    }
    
    setPrevTimerRunning(isTimerRunning);
  }, [isTimerRunning, prevTimerRunning, onTimerStop, isInitialized]);

  const generateNewScramble = () => {
    const newScramble = generateScramble(20);
    setScramble(newScramble);
    setScrambleNumber(prev => prev + 1);
    if (onNewScramble) {
      onNewScramble(newScramble);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrambleContainer}>
        <Text style={styles.scrambleText}>{scramble}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: wp('2%'),
    padding: wp('1.5%'),
    margin: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    width: wp('50%'),
    alignSelf: 'center',
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
    justifyContent: 'center',
  },
  scrambleText: {
    fontSize: wp('2.5%'),
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: hp('2%'),
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
});

export default ScrambleDisplay;
