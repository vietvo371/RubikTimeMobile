import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import TimerScreen from '../screens/TimerScreen';
import LandscapeTimerScreen from '../screens/LandscapeTimerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Orientation from 'react-native-orientation-locker';
import { useEffect } from 'react';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Lock portrait by default when app starts
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: {
            backgroundColor: '#ed3126',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Timer" 
          component={TimerScreen}
          listeners={{
            focus: () => {
              Orientation.lockToPortrait();
            },
          }}
        />
        <Stack.Screen 
          name="TwoHand" 
          component={LandscapeTimerScreen}
          options={{
            gestureEnabled: false,
          }}
          listeners={{
            focus: () => {
              Orientation.lockToLandscape();
            },
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          listeners={{
            focus: () => {
              Orientation.lockToPortrait();
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 