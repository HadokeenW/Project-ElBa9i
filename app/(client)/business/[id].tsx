import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Linking, 
  Platform,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { OfferCard } from '../../../src/components/OfferCard';
import { MOCK_BUSINESSES, MOCK_OFFERS } from '../../../src/lib/mockData';
import { Business, Offer } from '../../../src/types/database';
import { supabase, isSupabaseConfigured } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/context/auth';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      if (!id) return;

      if (isSupabaseConfigured) {
        try {
          const { data: bData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', id)
            .single();

          if (bData) {
            setBusiness(bData as Business);
            const { data: oData } = await supabase
              .from('offers')
              .select('*')
              .eq('business_id', id)
              .eq('status', 'available');
            if (oData) setOffers(oData as Offer[]);
            setLoading(false);
            return;
          }
        } catch {
          // fallback mock
        }
      }

      const found = MOCK_BUSINESSES.find((b) => b.id === id) || MOCK_BUSINESSES[0];
      setBusiness(found);
      setOffers(MOCK_OFFERS.filter((o) => o.business_id === found.id));
      setLoading(false);
    }

    loadBusiness();
  }, [id]);

  const handleOpenMaps = () => {
    if (!business) return;
    const { latitude, longitude, address, name } = business;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url).catch(() => Alert.alert('Adresse', address));
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler cet établissement',
      'Merci d\'indiquer tout problème à notre équipe de modération.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer le signalement', 
          style: 'destructive',
          onPress: () => Alert.alert('Signalement envoyé', 'Votre signalement sera traité par les administrateurs.') 
        }
      ]
    );
  };

  if (loading || !business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Chargement du commerce...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#EF4444" : Colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* En-tête commerce */}
        <View style={styles.bizProfileCard}>
          <View style={styles.bizAvatar}>
            <Ionicons name="storefront" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.bizName}>{business.name}</Text>
          <Text style={styles.bizWilaya}>{business.wilaya}, Algérie</Text>

          {/* Note et avis */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingScore}>4.8</Text>
            <Text style={styles.ratingCount}>(24 avis)</Text>
          </View>
        </View>

        {/* Coordonnées & Horaires */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{business.address}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color={Colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Horaires d'ouverture</Text>
              <Text style={styles.infoValue}>{business.opening_hours || '08:00 - 21:00'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{business.phone}</Text>
            </View>
          </View>
        </View>

        {/* Bouton Itinéraire */}
        <Button
          title="Voir l'itinéraire vers ce commerce"
          onPress={handleOpenMaps}
          icon={<Ionicons name="navigate-outline" size={18} color={Colors.white} />}
          style={{ marginBottom: 24 }}
        />

        {/* Offres disponibles */}
        <Text style={styles.sectionHeading}>Paniers disponibles en ce moment</Text>
        {offers.length === 0 ? (
          <View style={styles.noOffers}>
            <Ionicons name="basket-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.noOffersText}>Aucun panier disponible actuellement chez ce commerce.</Text>
          </View>
        ) : (
          offers.map((off) => (
            <OfferCard
              key={off.id}
              offer={off}
              onPress={() => router.push({
                pathname: '/(client)/offers/[id]',
                params: { id: off.id },
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bizProfileCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  bizAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bizName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  bizWilaya: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  ratingCount: {
    fontSize: 12,
    color: '#B45309',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },
  noOffers: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noOffersText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
});
