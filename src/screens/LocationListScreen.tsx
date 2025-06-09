import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SafeAreaView from '../components/SafeAreaView';

export default function LocationListScreen() {
 const route = useRoute<any>();
 const { title, description } = route.params || {
   title: 'Nearby Places',
   description: 'Discover what\'s around you'
 };
 
 return (
   <SafeAreaView style={styles.container}>
     <Text style={styles.title}>{title}</Text>
     <Text style={styles.description}>{description}</Text>
   </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 20,
 },
 title: {
   fontSize: 24,
   fontWeight: 'bold',
   marginBottom: 10,
 },
 description: {
   fontSize: 16,
   color: '#666',
 },
});
