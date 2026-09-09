import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Linking, 
  Share, 
  Platform,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../../src/constants/theme';
import { AvailabilityBadge } from '../../../src/components/AvailabilityBadge';
import { Button } from '../../../src/components/Button';
import { MOCK_OFFERS } from '../../../src/lib/mockData';
import { Offer } from '../../../src/types/database';
import { supabase, isSupabaseConfigured } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/context/auth';

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffer() {
      if (!id) return;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('offers')
            .select(`
              *,
              business:businesses(*)
            `)
            .eq('id', id)
            .single();

          if (!error && data) {
            setOffer(data as Offer);
            setLoading(false);
            return;
          }
        } catch {
          // fallback mock
        }
      }

      // Recherche dans mock data
      const found = MOCK_OFFERS.find((o) => o.id === id);
      setOffer(found || MOCK_OFFERS[0]);
      setLoading(false);
    }

    loadOffer();
  }, [id]);

  const handleOpenMaps = () => {
    if (!offer?.business) return;
    const { latitude, longitude, address, name } = offer.business;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Itinéraire', `Adresse : ${address}`);
      });
    }
  };

  const handleShare = async () => {
    if (!offer) return;
    try {
      await Share.share({
        message: `Découvrez le panier anti-gaspillage "${offer.name}" chez ${offer.business?.name} à seulement ${Format.currency(offer.price)} sur Baraka Food ! Premier arrivé, premier servi 🚀`,
      });
    } catch {
      // Ignorer
    }
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    if (isSupabaseConfigured && user && offer?.business_id) {
      try {
        if (!isFavorite) {
          await supabase.from('favorites').insert({
            user_id: user.id,
            business_id: offer.business_id,
          });
        } else {
          await supabase.from('favorites').delete().match({
            user_id: user.id,
            business_id: offer.business_id,
          });
        }
      } catch (err) {
        console.warn('Erreur favoris:', err);
      }
    }
  };

  if (loading || !offer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Chargement de l'offre...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const savings = Format.savingsPercent(offer.price, offer.estimated_value);
  const startTime = Format.time(offer.start_at);
  const endTime = Format.time(offer.end_at);

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre supérieure avec bouton retour et actions */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navCircleBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.navRightActions}>
          <TouchableOpacity style={styles.navCircleBtn} onPress={toggleFavorite}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#EF4444" : Colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navCircleBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* En-tête visuel */}
        <View style={styles.heroBanner}>
          <Ionicons name="basket" size={64} color={Colors.primary} />
          {savings > 0 && (
            <View style={styles.savingsTag}>
              <Text style={styles.savingsTagText}>Économie de {savings}%</Text>
            </View>
          )}
        </View>

        {/* Bloc information principal */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.offerTitle}>{offer.name}</Text>
            <AvailabilityBadge quantity={offer.available_quantity} status={offer.status} />
          </View>

          {/* Lien vers fiche entreprise */}
          <TouchableOpacity 
            style={styles.businessLink}
            onPress={() => router.push({
              pathname: '/(client)/business/[id]',
              params: { id: offer.business?.id || 'biz-1' }
            })}
          >
            <Ionicons name="storefront-outline" size={16} color={Colors.primary} />
            <Text style={styles.businessName}>{offer.business?.name || 'Commerce Partenaire'}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Tarification */}
          <View style={styles.pricingCard}>
            <View>
              <Text style={styles.priceLabel}>Prix sur place (en espèces)</Text>
              <Text style={styles.mainPrice}>{Format.currency(offer.price)}</Text>
            </View>
            <View style={styles.valCol}>
              <Text style={styles.valLabel}>Valeur estimée</Text>
              <Text style={styles.oldPrice}>{Format.currency(offer.estimated_value)}</Text>
            </View>
          </View>

          {/* CRITÈRE FONDAMENTAL DU MVP : Pas de réservation ! */}
          <View style={styles.alertBanner}>
            <Ionicons name="warning-outline" size={22} color="#92400E" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertBannerTitle}>
                ⚠️ Premier arrivé, premier servi
              </Text>
              <Text style={styles.alertBannerText}>
                Il n'y a pas de réservation en ligne. Rendez-vous directement au commerce pendant le créneau pour acheter et récupérer votre panier.
              </Text>
            </View>
          </View>

          {/* Horaires de collecte */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>Créneau de récupération</Text>
            <View style={styles.scheduleRow}>
              <Ionicons name="time-outline" size={20} color={Colors.secondary} />
              <Text style={styles.scheduleText}>
                Aujourd'hui de {startTime} à {endTime}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>Ce que peut contenir ce panier</Text>
            <Text style={styles.descriptionText}>
              {offer.description || "Le contenu de ce panier varie selon les invendus du jour. C'est toujours une bonne surprise et des produits frais de qualité !"}
            </Text>
          </View>

          {/* Adresse & Localisation */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>Adresse du commerce</Text>
            <View style={styles.addressBox}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText}>{offer.business?.address}</Text>
                <Text style={styles.wilayaText}>{offer.business?.wilaya || 'Alger'}, Algérie</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barre d'action inférieure : Voir l'itinéraire (PAS de bouton Réserver) */}
      <View style={styles.bottomBar}>
        <Button
          title="Voir l'itinéraire vers le commerce"
          onPress={handleOpenMaps}
          icon={<Ionicons name="navigate-outline" size={18} color={Colors.white} />}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  navRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  navCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroBanner: {
    height: 160,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 20,
    position: 'relative',
  },
  savingsTag: {
    position: 'absolute',
    bottom: 14,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  savingsTagText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  mainInfo: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  businessLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mainPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  valCol: {
    alignItems: 'flex-end',
  },
  valLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  oldPrice: {
    fontSize: 16,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  alertBannerText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  addressBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  wilayaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
