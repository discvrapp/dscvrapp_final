import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';

import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Filter'>;

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

export default function FilterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { onApply } = route.params;

  const [distance, setDistance] = useState(5);
  const [priceRange, setPriceRange] = useState([1, 3]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  const categories = [
    { id: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
    { id: 'bar', label: 'Bars', icon: 'wine' },
    { id: 'cafe', label: 'Cafes', icon: 'cafe' },
    { id: 'nightclub', label: 'Nightlife', icon: 'moon' },
    { id: 'music', label: 'Live Music', icon: 'musical-notes' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ];

  const features = [
    { id: 'outdoor', label: 'Outdoor Seating' },
    { id: 'wifi', label: 'Free WiFi' },
    { id: 'parking', label: 'Parking Available' },
    { id: 'reservations', label: 'Takes Reservations' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'petfriendly', label: 'Pet Friendly' },
  ];

  const sortOptions = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'distance', label: 'Nearest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const resetFilters = () => {
    setDistance(5);
    setPriceRange([1, 3]);
    setSelectedCategories([]);
    setSelectedFeatures([]);
    setSortBy('recommended');
  };

  const applyFilters = () => {
    const filters = {
      distance,
      priceRange,
      categories: selectedCategories,
      features: selectedFeatures,
      sortBy,
    };
    onApply(filters);
    navigation.goBack();
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedFeatures.length + 
    (distance !== 5 ? 1 : 0) + 
    (priceRange[0] !== 1 || priceRange[1] !== 3 ? 1 : 0) +
    (sortBy !== 'recommended' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{distance} miles</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              value={distance}
              onValueChange={setDistance}
              step={1}
              minimumTrackTintColor={dscvrColors.electricMagenta}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={dscvrColors.electricMagenta}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 mi</Text>
              <Text style={styles.sliderLabel}>20 mi</Text>
            </View>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceButtons}>
            {[1, 2, 3, 4].map((price) => (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceButton,
                  price >= priceRange[0] && price <= priceRange[1] && styles.priceButtonActive
                ]}
                onPress={() => {
                  if (price === priceRange[0] && price === priceRange[1]) {
                    setPriceRange([1, 4]);
                  } else {
                    setPriceRange([price, price]);
                  }
                }}
              >
                <Text style={[
                  styles.priceButtonText,
                  price >= priceRange[0] && price <= priceRange[1] && styles.priceButtonTextActive
                ]}>
                  {'$'.repeat(price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategories.includes(category.id) && styles.categoryCardActive
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={selectedCategories.includes(category.id) ? dscvrColors.electricMagenta : '#666'}
                />
                <Text style={[
                  styles.categoryLabel,
                  selectedCategories.includes(category.id) && styles.categoryLabelActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureChip,
                  selectedFeatures.includes(feature.id) && styles.featureChipActive
                ]}
                onPress={() => toggleFeature(feature.id)}
              >
                <Text style={[
                  styles.featureText,
                  selectedFeatures.includes(feature.id) && styles.featureTextActive
                ]}>
                  {feature.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.sortOption}
              onPress={() => setSortBy(option.id)}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
              <View style={[
                styles.radioButton,
                sortBy === option.id && styles.radioButtonActive
              ]}>
                {sortBy === option.id && <View style={styles.radioButtonDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>
            Show Results {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  resetText: {
    fontSize: 16,
    color: dscvrColors.electricMagenta,
    fontFamily: FONTS.medium,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 16,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderValue: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  priceButtonActive: {
    backgroundColor: dscvrColors.electricMagenta,
    borderColor: dscvrColors.electricMagenta,
  },
  priceButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#666',
  },
  priceButtonTextActive: {
    color: dscvrColors.pureWhite,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (screenWidth - 52) / 3,
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  categoryCardActive: {
    backgroundColor: dscvrColors.electricMagenta + '20',
    borderWidth: 2,
    borderColor: dscvrColors.electricMagenta,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#666',
  },
  categoryLabelActive: {
    color: dscvrColors.electricMagenta,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: dscvrColors.pureWhite,
  },
  featureChipActive: {
    backgroundColor: dscvrColors.electricMagenta,
    borderColor: dscvrColors.electricMagenta,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  featureTextActive: {
    color: dscvrColors.pureWhite,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sortOptionText: {
    fontSize: 16,
    color: dscvrColors.midnightNavy,
  },
  sortOptionTextActive: {
    fontFamily: FONTS.semiBold,
    color: dscvrColors.electricMagenta,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: dscvrColors.electricMagenta,
  },
  radioButtonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: dscvrColors.electricMagenta,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    backgroundColor: dscvrColors.electricMagenta,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.pureWhite,
  },
});