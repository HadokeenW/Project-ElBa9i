import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { OfferCard } from '../../src/components/OfferCard';
import { INITIAL_CATEGORIES, MOCK_OFFERS } from '../../src/lib/mockData';
import { Offer } from '../../src/types/database';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default function ClientHomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('cat-1');
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

  const fetchOffers = async () => {
    if (!isSupabaseConfigured) {
      setOffers(MOCK_OFFERS);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          business:businesses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erreur chargement offres:', error.message);
        setOffers(MOCK_OFFERS);
      } else if (data && data.length > 0) {
        setOffers(data as Offer[]);
      } else {
        setOffers(MOCK_OFFERS);
      }
    } catch {
      setOffers(MOCK_OFFERS);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  // Filtrage selon catégorie, disponibilité et recherche
  const filteredOffers = offers.filter((offer) => {
    if (filterAvailableOnly && (offer.available_quantity <= 0 || offer.status === 'sold_out')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = offer.name.toLowerCase().includes(q);
      const matchBiz = offer.business?.name.toLowerCase().includes(q);
      if (!matchName && !matchBiz) return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec position et recherche */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.locationLabel}>Localisation actuelle</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationCity}>Alger Centre, Algérie</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.mapIconButton}
          onPress={() => router.push('/(client)/map')}
        >
          <Ionicons name="map-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Rechercher un panier, une boulangerie..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Catégories défilantes horizontales */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesList}
        >
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filtre disponibilité rapide */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Paniers disponibles</Text>
          <TouchableOpacity 
            style={[styles.filterToggle, filterAvailableOnly && styles.filterToggleActive]}
            onPress={() => setFilterAvailableOnly(!filterAvailableOnly)}
          >
            <View style={[styles.statusDot, { backgroundColor: filterAvailableOnly ? Colors.white : Colors.available }]} />
            <Text style={[styles.filterToggleText, filterAvailableOnly && styles.filterToggleTextActive]}>
              En stock uniquement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste des cartes d'offres */}
        {filteredOffers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune offre trouvée</Text>
            <Text style={styles.emptySubtitle}>Revenez plus tard ou modifiez vos filtres.</Text>
          </View>
        ) : (
          filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              distanceKm={1.2}
              onPress={() => router.push({
                pathname: '/(client)/offers/[id]',
                params: { id: offer.id },
              })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  mapIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  categoriesList: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterToggleTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
