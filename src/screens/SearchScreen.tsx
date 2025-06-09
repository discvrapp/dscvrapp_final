import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';
import * as Location from 'expo-location';
import { searchNearbyPlaces } from '../services/googlePlaces';

const { width } = Dimensions.get('window');

const dscvrColors = {
  electricMagenta: '#E500A4',  // Pulse Pink
  vividBlue: '#375BDD',         // Vibe Blue
  royalPurple: '#6D4DAD',       // Culture Violet
  seafoamTeal: '#66B8BC',       // Fresh Mint
  midnightNavy: '#0D2D4F',      // Deep, immersive
  pureWhite: '#FFFFFF',         // Blank Canvas
};

interface SearchResult {
  id: string;
  type: 'location' | 'user' | 'hashtag' | 'event';
  title: string;
  subtitle?: string;
  icon: string;
  data?: any;
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [trendingSearches] = useState([
    { id: '1', text: 'Coffee shops in Brooklyn', type: 'location' },
    { id: '2', text: 'Rooftop bars near me', type: 'location' },
    { id: '3', text: 'Live music tonight', type: 'event' },
    { id: '4', text: 'Brunch spots Williamsburg', type: 'location' },
  ]);

  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([
    {
      id: 'r1',
      type: 'location',
      title: 'Blue Bottle Coffee',
      subtitle: 'Williamsburg',
      icon: 'location',
    },
    {
      id: 'r2',
      type: 'location',
      title: 'Westlight',
      subtitle: 'Rooftop Bar • Brooklyn',
      icon: 'location',
    },
  ]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        
        const places = await searchNearbyPlaces(
          location.coords.latitude,
          location.coords.longitude,
          5000,
          searchQuery
        );

        const formattedResults: SearchResult[] = places.slice(0, 8).map((place: any) => ({
          id: place.place_id,
          type: 'location' as const,
          title: place.name,
          subtitle: place.vicinity,
          icon: 'location',
          data: place,
        }));

        if (searchQuery.startsWith('@')) {
          formattedResults.unshift({
            id: 'user_search',
            type: 'user',
            title: searchQuery,
            subtitle: 'User',
            icon: 'person',
          });
        }

        if (searchQuery.startsWith('#')) {
          formattedResults.unshift({
            id: 'hashtag_search',
            type: 'hashtag',
            title: searchQuery,
            subtitle: 'Hashtag',
            icon: 'pricetag',
          });
        }

        setSearchResults(formattedResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    setRecentSearches(prev => [result, ...prev.filter(item => item.id !== result.id)].slice(0, 8));
    
    switch (result.type) {
      case 'location':
        navigation.navigate('PlaceDetail', { placeId: result.data?.place_id || result.id });
        break;
      case 'user':
        console.log('Navigate to user:', result.title);
        break;
      case 'hashtag':
        console.log('Navigate to hashtag:', result.title);
        break;
      case 'event':
        navigation.navigate('Explore', { screen: 'Events' });
        break;
    }
  };

  const handleTrendingPress = (item: any) => {
    setSearchQuery(item.text);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultIconContainer}>
        <Ionicons 
          name={item.icon as any} 
          size={18} 
          color={dscvrColors.midnightNavy} 
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.resultSubtitle}>{item.subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C0C0C0" />
    </TouchableOpacity>
  );

  const renderCategoryCard = (
    title: string, 
    subtitle: string,
    iconName: string,
    color: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.categoryIconContainer, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons 
          name={iconName as any} 
          size={28} 
          color={color}
        />
      </View>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categorySubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="tune-variant" size={22} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations, venues, people..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle-outline" size={22} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showResults ? (
          /* Search Results */
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <ActivityIndicator size="large" color={dscvrColors.electricMagenta} style={styles.loader} />
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.resultsList}
                ListEmptyComponent={
                  <View style={styles.emptyResults}>
                    <MaterialCommunityIcons name="magnify-close" size={48} color="#E0E0E0" />
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubtext}>Try searching for something else</Text>
                  </View>
                }
              />
            )}
          </View>
        ) : (
          /* Default View */
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending searches</Text>
              <View style={styles.trendingList}>
                {trendingSearches.map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.trendingItem}
                    onPress={() => handleTrendingPress(item)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="trending-up" 
                      size={16} 
                      color={dscvrColors.electricMagenta} 
                      style={styles.trendingIcon}
                    />
                    <Text style={styles.trendingText}>{item.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Grid */}
            <View style={styles.categorySection}>
              <View style={styles.categoryGrid}>
                {renderCategoryCard(
                  'Locations',
                  'Discover nearby',
                  'map-marker',
                  dscvrColors.electricMagenta,
                  () => navigation.navigate('Explore', { screen: 'NearbyPlacesScreen' })
                )}
                {renderCategoryCard(
                  'Events',
                  'What\'s happening',
                  'calendar-star',
                  dscvrColors.vividBlue,
                  () => navigation.navigate('Explore', { screen: 'Events' })
                )}
                {renderCategoryCard(
                  'Users',
                  'Find people',
                  'account-group',
                  dscvrColors.royalPurple,
                  () => console.log('Navigate to users search')
                )}
                {renderCategoryCard(
                  'Hashtags',
                  'Trending topics',
                  'pound',
                  dscvrColors.seafoamTeal,
                  () => console.log('Navigate to hashtags search')
                )}
              </View>
            </View>

            {/* Disco Card */}
            <TouchableOpacity 
              style={styles.discoCard}
              onPress={() => navigation.navigate('Explore', { screen: 'Disco' })}
              activeOpacity={0.8}
            >
              <View style={styles.discoContent}>
                <View style={styles.discoLeft}>
                  <View style={styles.discoIconContainer}>
                    <MaterialCommunityIcons 
                      name="music-note-eighth" 
                      size={32} 
                      color={dscvrColors.pureWhite}
                    />
                  </View>
                  <View>
                    <Text style={styles.discoTitle}>Disco Mode</Text>
                    <Text style={styles.discoSubtitle}>Discover nightlife & music venues</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={24} color={dscvrColors.pureWhite} />
              </View>
            </TouchableOpacity>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearButton}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentList}>
                  {recentSearches.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentItem}
                      onPress={() => handleResultPress(item)}
                    >
                      <MaterialCommunityIcons 
                        name="history" 
                        size={20} 
                        color="#999" 
                        style={styles.recentIcon}
                      />
                      <View style={styles.recentContent}>
                        <Text style={styles.recentTitle}>{item.title}</Text>
                        {item.subtitle && (
                          <Text style={styles.recentSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loader: {
    marginTop: 60,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: dscvrColors.pureWhite,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  resultSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
  emptyResults: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  clearButton: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  trendingList: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  trendingIcon: {
    marginRight: 12,
  },
  trendingText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
  },
  categorySection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 2,
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#666',
  },
  discoCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: dscvrColors.midnightNavy,
    borderRadius: 20,
    padding: 24,
    shadowColor: dscvrColors.midnightNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  discoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  discoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: dscvrColors.electricMagenta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: dscvrColors.pureWhite,
    marginBottom: 4,
  },
  discoSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.pureWhite,
    opacity: 0.8,
  },
  recentList: {
    backgroundColor: dscvrColors.pureWhite,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  recentIcon: {
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
  },
  recentSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#666',
    marginTop: 2,
  },
});
