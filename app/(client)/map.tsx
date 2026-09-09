import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert 
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../src/constants/theme';
import { MOCK_OFFERS, MOCK_BUSINESSES } from '../../src/lib/mockData';
import { AvailabilityBadge } from '../../src/components/AvailabilityBadge';
import { Offer } from '../../src/types/database';

export default function MapScreen() {
  const router = useRouter();
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>(MOCK_OFFERS[0]);
  const [maxDistance, setMaxDistance] = useState<number>(5); // km

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        Alert.alert('Position obtenue', 'Votre position à Alger a été synchronisée avec succès.');
      } else {
        Alert.alert('Permission refusée', 'La position par défaut (Alger Centre) sera utilisée.');
      }
    } catch {
      Alert.alert('Info', 'Géolocalisation non disponible en mode actuel.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec filtres et permission */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Carte des commerces</Text>
          <Text style={styles.headerSubtitle}>Paniers surprise autour de vous</Text>
        </View>

        {!hasLocationPermission && (
          <TouchableOpacity style={styles.locateBtn} onPress={requestLocation}>
            <Ionicons name="locate" size={16} color={Colors.white} />
            <Text style={styles.locateBtnText}>Me localiser</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Visualisation interactive de la carte / radar */}
      <View style={styles.mapArea}>
        <View style={styles.radarBackground}>
          <View style={styles.radarRing1} />
          <View style={styles.radarRing2} />
          <View style={styles.radarRing3} />
          
          {/* Point central utilisateur */}
          <View style={styles.userPin}>
            <Ionicons name="person" size={14} color={Colors.white} />
          </View>

          {/* Marqueurs des commerces */}
          {MOCK_OFFERS.slice(0, 3).map((off, idx) => {
            const isSelected = selectedOffer.id === off.id;
            const offsets: Array<{ top: `${number}%`; left: `${number}%` }> = [
              { top: '28%', left: '32%' },
              { top: '48%', left: '68%' },
              { top: '65%', left: '26%' },
            ];
            const pos = offsets[idx % offsets.length];

            return (
              <TouchableOpacity
                key={off.id}
                onPress={() => setSelectedOffer(off)}
                style={[
                  styles.bizMarker,
                  pos,
                  isSelected && styles.bizMarkerSelected,
                ]}
              >
                <Ionicons 
                  name="basket" 
                  size={18} 
                  color={isSelected ? Colors.white : Colors.primaryDark} 
                />
                <Text style={[styles.markerPrice, isSelected && styles.markerPriceSelected]}>
                  {off.price} DA
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.mapOverlayHint}>
          <Ionicons name="compass-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.mapOverlayText}>Zone : Alger Centre & Environs (Rayon {maxDistance} km)</Text>
        </View>
      </View>

      {/* Carte flottante de l'offre sélectionnée */}
      <View style={styles.previewContainer}>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewBizName}>{selectedOffer.business?.name}</Text>
              <Text style={styles.previewOfferName}>{selectedOffer.name}</Text>
            </View>
            <AvailabilityBadge 
              quantity={selectedOffer.available_quantity} 
              status={selectedOffer.status} 
            />
          </View>

          <View style={styles.previewFooter}>
            <View>
              <Text style={styles.previewPrice}>{Format.currency(selectedOffer.price)}</Text>
              <Text style={styles.previewSavings}>
                Au lieu de {Format.currency(selectedOffer.estimated_value)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => router.push({
                pathname: '/(client)/offers/[id]',
                params: { id: selectedOffer.id },
              })}
            >
              <Text style={styles.viewDetailBtnText}>Voir le panier</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  locateBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  radarBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
  },
  radarRing2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  radarRing3: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  userPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    zIndex: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bizMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bizMarkerSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    transform: [{ scale: 1.08 }],
  },
  markerPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  markerPriceSelected: {
    color: Colors.white,
  },
  mapOverlayHint: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapOverlayText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewCard: {
    backgroundColor: Colors.surface,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewBizName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  previewOfferName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  previewSavings: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewDetailBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
