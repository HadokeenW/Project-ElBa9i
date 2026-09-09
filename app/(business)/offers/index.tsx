import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../../src/constants/theme';
import { AvailabilityBadge } from '../../../src/components/AvailabilityBadge';
import { MOCK_OFFERS } from '../../../src/lib/mockData';
import { Offer } from '../../../src/types/database';

export default function BusinessOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS.slice(0, 3));

  const markAsSoldOut = (offerId: string) => {
    Alert.alert(
      'Marquer comme épuisé',
      'Confirmez-vous que ce panier n\'est plus disponible ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: () => {
            setOffers(offers.map(o => o.id === offerId ? { ...o, available_quantity: 0, status: 'sold_out' } : o));
          }
        }
      ]
    );
  };

  const deleteOffer = (offerId: string) => {
    Alert.alert(
      'Supprimer le panier',
      'Voulez-vous vraiment supprimer cette offre ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => setOffers(offers.filter(o => o.id !== offerId))
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestion des Paniers</Text>
          <Text style={styles.headerSubtitle}>Contrôlez vos offres et vos stocks</Text>
        </View>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => router.push('/(business)/offers/create')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerName}>{offer.name}</Text>
                <Text style={styles.timeSlot}>
                  Créneau : {Format.time(offer.start_at)} → {Format.time(offer.end_at)}
                </Text>
              </View>
              <AvailabilityBadge quantity={offer.available_quantity} status={offer.status} />
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>{Format.currency(offer.price)}</Text>
                <Text style={styles.valEst}>Valeur : {Format.currency(offer.estimated_value)}</Text>
              </View>
              <View style={styles.stockInfo}>
                <Text style={styles.stockLabel}>Stock restant</Text>
                <Text style={styles.stockCount}>{offer.available_quantity} / {offer.initial_quantity}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              {offer.available_quantity > 0 && (
                <TouchableOpacity 
                  style={styles.actionBtnOutline}
                  onPress={() => markAsSoldOut(offer.id)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.actionTextDanger}>Marquer épuisé</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.deleteIconBtn}
                onPress={() => deleteOffer(offer.id)}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  offerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timeSlot: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  valEst: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  stockCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  deleteIconBtn: {
    padding: 6,
  },
});
