import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import SafeAreaView from '../components/SafeAreaView';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const renderTrendingItem = () => (
    <View style={styles.trendingItem}>
      <View style={styles.trendingDot} />
      <View style={styles.trendingBar} />
    </View>
  );

  const renderCategoryCard = (title, iconName = 'image-outline', accentColor = dscvrColors.electricMagenta, onPress = () => {} ) => (
    <TouchableOpacity onPress={onPress} style={styles.categoryCard}>
      <Ionicons name={iconName} size={40} color={accentColor} style={styles.categoryIcon} />
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderLargeCard = (title, iconName = 'image-outline') => (
    <TouchableOpacity style={styles.largeCard}>
      <Ionicons name={iconName} size={50} color={dscvrColors.pureWhite} style={styles.largeCardIcon} />
      <Text style={styles.largeCardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={dscvrColors.midnightNavy} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for locations, venues, users..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color={dscvrColors.electricMagenta} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>TRENDING SEARCHES</Text>
            <View style={styles.trendingContent}>
              {renderTrendingItem()}
              {renderTrendingItem()}
              {renderTrendingItem()}
            </View>
          </View>

          <View style={styles.categoryGrid}>
            <View style={styles.gridRow}>
              {renderCategoryCard("LOCATIONS", "location-outline", dscvrColors.electricMagenta, () => navigation.navigate("Nearby"))}
              {renderCategoryCard('EVENTS', 'calendar-outline', dscvrColors.vividBlue)}
            </View>
            <View style={styles.gridRow}>
              {renderCategoryCard('USERS', 'person-outline', dscvrColors.royalPurple)}
              {renderCategoryCard('HASHTAGS', 'pricetag-outline', dscvrColors.seafoamTeal)}
            </View>
          </View>

          {renderLargeCard('DISCO', 'musical-notes-outline')}

          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: dscvrColors.midnightNavy,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trendingSection: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: dscvrColors.midnightNavy,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  trendingContent: {
    gap: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
  },
  trendingBar: {
    height: 4,
    flex: 1,
    backgroundColor: dscvrColors.seafoamTeal,
    borderRadius: 2,
    maxWidth: 180,
    opacity: 0.4,
  },
  categoryGrid: {
    gap: 16,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: dscvrColors.midnightNavy,
    letterSpacing: 0.5,
  },
  largeCard: {
    backgroundColor: dscvrColors.vividBlue,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  largeCardIcon: {
    marginBottom: 16,
  },
  largeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: dscvrColors.pureWhite,
    letterSpacing: 0.5,
  },
  recentSection: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
