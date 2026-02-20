// Brier - Main App Entry
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import NewPredictionScreen from './screens/NewPredictionScreen';
import PredictionDetailScreen from './screens/PredictionDetailScreen';
import StatsScreen from './screens/StatsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#16213e' },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: '🎯 Brier' }}
          />
          <Stack.Screen 
            name="NewPrediction" 
            component={NewPredictionScreen}
            options={{ title: 'New Wager' }}
          />
          <Stack.Screen 
            name="PredictionDetail" 
            component={PredictionDetailScreen}
            options={{ title: 'Prediction' }}
          />
          <Stack.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{ title: '📊 Insights' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
