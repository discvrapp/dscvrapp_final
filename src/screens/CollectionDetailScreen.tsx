import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'CollectionDetail'>;

interface CollectionItem {
  id: string;
  place_id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  tags: string[];
}

const mockCollections: Record<string, {
  title: string;
  description: string;
  color: string;
  icon: string;
  items: CollectionItem[];
}> = {
  'date-night': {
    title: 'Date Night',
    description: 'Romantic spots perfect for a special evening',
    color: '#E500A4',
    icon: 'wine-outline',
    items: [
      {
        id: '1',
        place_id: 'sample_1',
        name: 'The Rooftop Garden',
        description: 'Intimate rooftop dining with city views',
        image: 'https://via.placeholder.com/400x300',
        rating: 4.8,
        price: '$$$',
        tags: ['Romantic', 'Rooftop', 'Fine Dining'],
      },
      {
        id: '2',
        place_id: 'sample_2',
        name: 'Candlelight Bistro',
        description: 'Cozy French restaurant with live jazz',
        image: 'https://via.placeholder.com/400x300',
        rating: 4.7,
        price: '$',
        tags: ['French', 'Live Music', 'Wine Bar'],
      },
    ],
  },
  'coffee-work': {
    title: 'Coffee & Work',
    description: 'Best cafes with WiFi and great coffee',
    color: '#375BDD',
    icon: 'cafe-outline',
    items: [
      {
        id: '3',
        place_id: 'sample_3',
        name: 'The Daily Grind',
        description: 'Spacious cafe with fast WiFi and quiet corners',
        image: 'https://via.placeholder.com/400x300',
        rating: 4.5,
        price: '$',
        tags: ['WiFi', 'Laptop Friendly', 'Quiet'],
      },
    ],
  },
  'vegan-eats': {
    title: 'Vegan Eats',
    description: 'Plant-based dining at its finest',
    color: '#66B8BC',
    icon: 'leaf-outline',
    items: [
      {
        id: '4',
        place_id: 'sample_4',
        name: 'Green Garden Kitchen',
        description: 'Farm-to-table vegan cuisine',
        image: 'https://via.placeholder.com/400x300',
        rating: 4.6,
        price: '$',
        tags: ['Vegan', 'Organic', 'Gluten-Free Options'],
      },
    ],
  },
};

export default function CollectionDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { collectionId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const collection = mockCollections[collectionId] || mockCollections['date-night'];

  const handlePlacePress = (placeId: string) => {
    navigation.navigate('PlaceDetail', { placeId });
  };

  const renderCollectionItem = (item: CollectionItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemCard}
      onPress={() => handlePlacePress(item.place_id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
        
        <Text style={styles.itemDescription}>{item.description}</Text>
        
        <View style={styles.itemFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={dscvrColors.electricMagenta} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: collection.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.pureWhite} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={collection.icon as any} size={48} color={dscvrColors.pureWhite} />
          </View>
          <Text style={styles.collectionTitle}>{collection.title}</Text>
          <Text style={styles.collectionDescription}>{collection.description}</Text>
          <Text style={styles.spotsCount}>{collection.items.length} curated spots</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.itemsContainer}>
          {collection.items.map(renderCollectionItem)}
        </View>

        {/* Save Collection Button */}
        <TouchableOpacity style={styles.saveCollectionButton}>
          <Ionicons name="bookmark-outline" size={20} color={dscvrColors.electricMagenta} />
          <Text style={styles.saveCollectionText}>Save Collection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: dscvrColors.pureWhite,
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 16,
    color: dscvrColors.pureWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  spotsCount: {
    fontSize: 14,
    color: dscvrColors.pureWhite,
    opacity: 0.8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  itemsContainer: {
    padding: 20,
  },
  itemCard: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  saveCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: dscvrColors.electricMagenta,
  },
  saveCollectionText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
});