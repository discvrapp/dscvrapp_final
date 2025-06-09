import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import AllReviewsScreen from '../screens/AllReviewsScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Nearby" component={NearbyPlacesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
    </Stack.Navigator>
  );
}
