import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DscvrLogo from '../components/DscvrLogo';
// Screens
import HomeFeedScreen from '../screens/HomeFeedScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MessageChatScreen from '../screens/MessageChatScreen';import ProfileScreen from '../screens/ProfileScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import AllReviewsScreen from '../screens/AllReviewsScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import ReservationScreen from '../screens/ReservationScreen';
import VideoRecordScreen from '../screens/VideoRecordScreen';
import VideoEditScreen from '../screens/VideoEditScreen';
import FilterScreen from '../screens/FilterScreen';
import EventsScreen from '../screens/EventsScreen';
import LocationListScreen from '../screens/LocationListScreen';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import CreateScreen from '../screens/CreateScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import DiscoScreen from '../screens/DiscoScreen';
import PlanMyNightScreen from '../screens/PlanMyNightScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import EventReservationScreen from '../screens/EventReservationScreen';const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};
// Stack Navigators
const HomeStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const CreateStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <HomeStack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <HomeStack.Screen name="AllReviews" component={AllReviewsScreen} />
      <HomeStack.Screen name="WriteReview" component={WriteReviewScreen} />
      <HomeStack.Screen name="Reservation" component={ReservationScreen} />
      <HomeStack.Screen name="VideoRecord" component={VideoRecordScreen} />
      <HomeStack.Screen name="VideoEdit" component={VideoEditScreen} />
    </HomeStack.Navigator>
  );
}
function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
      <ExploreStack.Screen name="Search" component={SearchScreen} />
      <ExploreStack.Screen name="SearchResults" component={SearchResultsScreen} />
      <ExploreStack.Screen name="LocationList" component={LocationListScreen} />
      <ExploreStack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
      <ExploreStack.Screen name="Disco" component={DiscoScreen} />
      <ExploreStack.Screen name="Events" component={EventsScreen} />
      <ExploreStack.Screen name="EventDetail" component={EventDetailScreen} />
      <ExploreStack.Screen name="EventReservation" component={EventReservationScreen} />
      <ExploreStack.Screen name="PlanMyNight" component={PlanMyNightScreen} />
      <ExploreStack.Screen name="NearbyPlacesScreen" component={NearbyPlacesScreen} />
      <ExploreStack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <ExploreStack.Screen name="AllReviews" component={AllReviewsScreen} />
      <ExploreStack.Screen name="WriteReview" component={WriteReviewScreen} />
      <ExploreStack.Screen name="Reservation" component={ReservationScreen} />
      <ExploreStack.Screen name="VideoRecord" component={VideoRecordScreen} />
    </ExploreStack.Navigator>
  );
}
function CreateStackScreen() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen name="CreateMain" component={CreateScreen} />
      <CreateStack.Screen name="VideoRecord" component={VideoRecordScreen} />
    </CreateStack.Navigator>
  );
}
function MessagesStackScreen() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="MessagesMain" component={MessagesScreen} />
      <MessagesStack.Screen name="MessageChat" component={MessageChatScreen} />
    </MessagesStack.Navigator>
  );
}
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <ProfileStack.Screen name="AllReviews" component={AllReviewsScreen} />
    </ProfileStack.Navigator>
  );
}
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') return <DscvrLogo size={size} />;
          else if (route.name === 'Create') iconName = 'add-circle';
          else if (route.name === 'Messages') iconName = 'chatbox';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: dscvrColors.electricMagenta,
        tabBarInactiveTintColor: '#999',
        tabBarSafeAreaInsets: {
          bottom: 0,
        },
        tabBarStyle: {
          backgroundColor: dscvrColors.pureWhite,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 34,
          paddingTop: 8,
          height: 85,
          position: 'absolute',
          marginBottom: 0,
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Explore" component={ExploreStackScreen} />
      <Tab.Screen name="Create" component={CreateStackScreen} />
      <Tab.Screen name="Messages" component={MessagesStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}
