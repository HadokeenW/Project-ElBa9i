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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../src/constants/theme';
import { AvailabilityBadge } from '../../src/components/AvailabilityBadge';
import { Button } from '../../src/components/Button';
import { MOCK_OFFERS } from '../../src/lib/mockData';
import { Offer } from '../../src/types/database';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default function BusinessSalesScreen() {
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [quantitiesToSell, setQuantitiesToSell] = useState<{ [id: string]: number }>({
    'off-1': 1,
    'off-2': 1,
    'off-3': 1,
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const incrementQty = (offerId: string, maxAvailable: number) => {
    const current = quantitiesToSell[offerId] || 1;
    if (current < maxAvailable) {
      setQuantitiesToSell({ ...quantitiesToSell, [offerId]: current + 1 });
    }
  };

  const decrementQty = (offerId: string) => {
    const current = quantitiesToSell[offerId] || 1;
    if (current > 1) {
      setQuantitiesToSell({ ...quantitiesToSell, [offerId]: current - 1 });
    }
  };

  const handleRecordSale = async (offer: Offer) => {
    const qty = quantitiesToSell[offer.id] || 1;

    if (offer.available_quantity < qty) {
      Alert.alert('Erreur', 'Quantité insuffisante en stock.');
      return;
    }

    setLoadingId(offer.id);

    // Tentative d'appel de la procédure stockée atomique Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('record_sale', {
          p_offer_id: offer.id,
          p_quantity: qty,
        });

        if (error) {
          console.warn('Erreur RPC record_sale:', error.message);
        }
      } catch (err) {
        console.warn('Exception RPC:', err);
      }
    }

    // Mise à jour de l'état réactif local
    const newQty = offer.available_quantity - qty;
    const newStatus = newQty === 0 ? 'sold_out' : 'available';

    setOffers(offers.map(o => 
      o.id === offer.id 
        ? { ...o, available_quantity: newQty, status: newStatus as any } 
        : o
    ));

    // Réinitialiser la quantité sélectionnée à 1 (ou 0 si épuisé)
    setQuantitiesToSell({
      ...quantitiesToSell,
      [offer.id]: newQty > 0 ? 1 : 0,
    });

    setLoadingId(null);

    const totalMoney = offer.price * qty;
    Alert.alert(
      'Vente Enregistrée ! 💰',
      `Vous avez vendu ${qty} panier(s) pour un montant de ${Format.currency(totalMoney)} payé sur place.\nStock restant : ${newQty} panier(s).`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Caisse & Enregistrement de Vente</Text>
        <Text style={styles.headerSubtitle}>
          Enregistrez les retraits clients pour actualiser les stocks en temps réel
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rappel du fonctionnement */}
        <View style={styles.cashNotice}>
          <Ionicons name="cash-outline" size={24} color="#065F46" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cashNoticeTitle}>Paiement en espèces sur place</Text>
            <Text style={styles.cashNoticeText}>
              Le client règle directement en boutique. Cliquez sur « Enregistrer la vente » pour décrémenter le stock instantanément.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Paniers en cours</Text>

        {offers.map((offer) => {
          const isSoldOut = offer.available_quantity <= 0;
          const sellQty = quantitiesToSell[offer.id] || 1;
          const totalPrice = offer.price * sellQty;

          return (
            <View key={offer.id} style={[styles.saleCard, isSoldOut && styles.saleCardDisabled]}>
              <View style={styles.saleHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>{offer.name}</Text>
                  <Text style={styles.unitPrice}>Prix unitaire : {Format.currency(offer.price)}</Text>
                </View>
                <AvailabilityBadge quantity={offer.available_quantity} status={offer.status} />
              </View>

              {!isSoldOut ? (
                <>
                  <View style={styles.stepperContainer}>
                    <Text style={styles.stepperLabel}>Quantité vendue :</Text>
                    
                    <View style={styles.stepperBox}>
                      <TouchableOpacity 
                        style={styles.stepperBtn}
                        onPress={() => decrementQty(offer.id)}
                        disabled={sellQty <= 1}
                      >
                        <Ionicons 
                          name="remove" 
                          size={18} 
                          color={sellQty <= 1 ? Colors.textMuted : Colors.text} 
                        />
                      </TouchableOpacity>

                      <Text style={styles.stepperValue}>{sellQty}</Text>

                      <TouchableOpacity 
                        style={styles.stepperBtn}
                        onPress={() => incrementQty(offer.id, offer.available_quantity)}
                        disabled={sellQty >= offer.available_quantity}
                      >
                        <Ionicons 
                          name="add" 
                          size={18} 
                          color={sellQty >= offer.available_quantity ? Colors.textMuted : Colors.text} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total à encaisser :</Text>
                    <Text style={styles.totalAmount}>{Format.currency(totalPrice)}</Text>
                  </View>

                  <Button
                    title={`Enregistrer la vente (${Format.currency(totalPrice)})`}
                    onPress={() => handleRecordSale(offer)}
                    loading={loadingId === offer.id}
                    icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />}
                    size="md"
                    style={{ marginTop: 12 }}
                  />
                </>
              ) : (
                <View style={styles.soldOutBanner}>
                  <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.soldOutText}>
                    Ce panier est épuisé (stock = 0). Il n'apparaît plus sur l'application client.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cashNotice: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
    gap: 12,
    alignItems: 'center',
  },
  cashNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  cashNoticeText: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 12,
  },
  saleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  saleCardDisabled: {
    opacity: 0.75,
    backgroundColor: '#F9FAFB',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  unitPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  soldOutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  soldOutText: {
    color: '#B91C1C',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
});
