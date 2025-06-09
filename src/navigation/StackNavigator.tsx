import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import VideoRecordScreen from '../screens/VideoRecordScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import AllReviewsScreen from '../screens/AllReviewsScreen';
import SearchScreen from '../screens/SearchScreen';
import ReservationScreen from '../screens/ReservationScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import DiscoScreen from '../screens/DiscoScreen';
import FilterScreen from '../screens/FilterScreen';
import EventsScreen from '../screens/EventsScreen';
import LocationListScreen from '../screens/LocationListScreen';
import PlanMyNightScreen from '../screens/PlanMyNightScreen';
const Stack = createNativeStackNavigator();

function getTabBarVisibility(route: any) {
 const routeName = getFocusedRouteNameFromRoute(route);
 const hideOnScreens = ['VideoRecord'];
 
 if (hideOnScreens.includes(routeName ?? '')) {
   return 'none';
 }
 return 'flex';
}

export default function StackNavigator() {
 return (
   <Stack.Navigator 
     screenOptions={{ 
       headerShown: false,
       presentation: 'card',
     }}
   >
     <Stack.Screen 
       name="Tabs" 
       component={TabNavigator}
       options={({ route }) => ({
         tabBarStyle: { display: getTabBarVisibility(route) },
       })}
     />
     <Stack.Screen name="Search" component={SearchScreen} />
     <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
     <Stack.Screen name="LocationList" component={LocationListScreen} />
     <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
     <Stack.Screen name="Disco" component={DiscoScreen} />
     <Stack.Screen name="PlanMyNight" component={PlanMyNightScreen} />
     <Stack.Screen name="Filter" component={FilterScreen} />
     <Stack.Screen name="Events" component={EventsScreen} />
     <Stack.Screen name="NearbyPlacesScreen" component={NearbyPlacesScreen} />
     <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
     <Stack.Screen name="VideoRecord" component={VideoRecordScreen} options={{ headerShown: false }} />
     <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
     <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
     <Stack.Screen name="Reservation" component={ReservationScreen} />
   </Stack.Navigator>
 );
}
