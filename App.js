import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';
import { initializeAdMob } from './src/utils/adMobManager';
import { View, ActivityIndicator } from 'react-native';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database
        await initDatabase();
        console.log('Database initialized successfully');
        
        // Initialize AdMob
        await initializeAdMob();
        console.log('AdMob initialized successfully');
        
        setIsReady(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        // Still set ready even if AdMob fails
        setIsReady(true);
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ed3126" />
      </View>
    );
  }

  return <AppNavigator />;
};

export default App; 