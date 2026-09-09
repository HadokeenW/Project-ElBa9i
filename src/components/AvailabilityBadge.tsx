import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface AvailabilityBadgeProps {
  quantity: number;
  status?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ quantity, status }) => {
  const isSoldOut = quantity <= 0 || status === 'sold_out';
  const isLowStock = !isSoldOut && quantity <= 2;

  const backgroundColor = isSoldOut 
    ? '#FEE2E2' 
    : isLowStock 
    ? '#FEF3C7' 
    : '#D1FAE5';

  const textColor = isSoldOut 
    ? '#DC2626' 
    : isLowStock 
    ? '#D97706' 
    : '#059669';

  const dotColor = isSoldOut 
    ? '#EF4444' 
    : isLowStock 
    ? '#F59E0B' 
    : '#10B981';

  const label = isSoldOut 
    ? 'Épuisé' 
    : `${quantity} restant${quantity > 1 ? 's' : ''}`;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
