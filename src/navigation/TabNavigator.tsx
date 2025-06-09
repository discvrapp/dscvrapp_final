import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

import HomeFeedScreen from '../screens/HomeFeedScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CreateScreen from '../screens/CreateScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          } else if (route.name === 'Explore') {
            return (
              <Image 
                source={require('../assets/images/dscvr-logo.png')}
                style={{ 
                  width: 28, 
                  height: 28,
                  opacity: focused ? 1 : 0.5
                }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Create') {
            return <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={size} color={color} />;
          } else if (route.name === 'Messages') {
            return <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
          }
        },
        headerShown: false,
        tabBarActiveTintColor: dscvrColors.electricMagenta,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: dscvrColors.pureWhite,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 34,
          paddingTop: 10,
          height: 94,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
