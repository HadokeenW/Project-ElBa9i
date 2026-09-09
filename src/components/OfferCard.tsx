import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../constants/theme';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Offer } from '../types/database';

interface OfferCardProps {
  offer: Offer;
  onPress: () => void;
  distanceKm?: number | null;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onPress, distanceKm }) => {
  const savings = Format.savingsPercent(offer.price, offer.estimated_value);
  const startTime = Format.time(offer.start_at);
  const endTime = Format.time(offer.end_at);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {/* En-tête de la carte avec catégorie / icône */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="fast-food-outline" size={40} color={Colors.primary} />
        {savings > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>-{savings}%</Text>
          </View>
        )}
        <View style={styles.badgeWrapper}>
          <AvailabilityBadge 
            quantity={offer.available_quantity} 
            status={offer.status} 
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Nom du commerce & distance */}
        <View style={styles.headerRow}>
          <Text style={styles.businessName} numberOfLines={1}>
            {offer.business?.name || 'Commerce Partenaire'}
          </Text>
          {distanceKm !== undefined && distanceKm !== null && (
            <View style={styles.distanceTag}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.distanceText}>{distanceKm.toFixed(1)} km</Text>
            </View>
          )}
        </View>

        {/* Nom de l'offre */}
        <Text style={styles.offerName} numberOfLines={1}>
          {offer.name}
        </Text>

        {/* Créneau horaire de récupération */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={Colors.secondary} />
          <Text style={styles.timeText}>
            {startTime} → {endTime}
          </Text>
        </View>

        {/* Prix & Valeur estimée */}
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>{Format.currency(offer.price)}</Text>
            <Text style={styles.estimatedValue}>
              Val. {Format.currency(offer.estimated_value)}
            </Text>
          </View>

          <View style={styles.actionPrompt}>
            <Text style={styles.actionText}>Voir</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  offerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  estimatedValue: {
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
