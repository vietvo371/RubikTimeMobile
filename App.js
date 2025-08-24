import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';
import { preloadAds } from './src/utils/ads';
import { getCurrentEnvironment } from './src/utils/adConfig';
import { View, ActivityIndicator, Text } from 'react-native';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Log môi trường hiện tại
        const envInfo = getCurrentEnvironment();
        console.log('🚀 [App] Starting RubikTime with environment:', envInfo.environment);
        
        await initDatabase();
        console.log('Database initialized successfully');
        
        // Khởi tạo và preload quảng cáo
        try {
          await preloadAds();
          console.log('Ads preloaded successfully');
        } catch (adError) {
          console.warn('Ad preload failed, continuing without ads:', adError.message);
          // Không dừng app nếu ads fail
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setInitError(error.message);
      }
    };
    init();
  }, []);

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          Khởi tạo ứng dụng thất bại
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
          {initError}
        </Text>
      </View>
    );
  }

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