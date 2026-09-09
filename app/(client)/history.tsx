import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/context/auth';

interface HistoryItem {
  id: string;
  businessName: string;
  offerName: string;
  pricePaid: number;
  estimatedValue: number;
  date: string;
  hasReview: boolean;
}

export default function HistoryScreen() {
  const { user } = useAuth();

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'sale-1',
      businessName: "Boulangerie L'Artisan d'Alger",
      offerName: "Panier Pains & Viennoiseries",
      pricePaid: 250,
      estimatedValue: 800,
      date: "Hier à 19:15",
      hasReview: false,
    },
    {
      id: 'sale-2',
      businessName: "Burger & Co Sidi Yahia",
      offerName: "Panier Fast-Food du Soir",
      pricePaid: 400,
      estimatedValue: 1100,
      date: "Il y a 3 jours",
      hasReview: true,
    }
  ]);

  // Modal Avis
  const [selectedSale, setSelectedSale] = useState<HistoryItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const totalSpent = history.reduce((acc, curr) => acc + curr.pricePaid, 0);
  const totalValue = history.reduce((acc, curr) => acc + curr.estimatedValue, 0);
  const totalSaved = Math.max(0, totalValue - totalSpent);
  const totalBaskets = history.length;
  const foodSavedKg = (totalBaskets * 1.2).toFixed(1); // 1.2 kg de moyenne par panier

  const openReviewModal = (item: HistoryItem) => {
    setSelectedSale(item);
    setRating(5);
    setComment('');
  };

  const submitReview = () => {
    if (!selectedSale) return;
    setHistory(history.map(item => 
      item.id === selectedSale.id ? { ...item, hasReview: true } : item
    ));
    setSelectedSale(null);
    Alert.alert('Merci !', 'Votre avis a été enregistré pour cet achat.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon historique d'achats</Text>
        <Text style={styles.headerSubtitle}>Retrouvez tous vos paniers sauvés sur place</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Résumé de l'impact personnel */}
        <View style={styles.impactCard}>
          <Text style={styles.impactCardTitle}>Mon impact écologique & économique</Text>
          <View style={styles.impactStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalBaskets}</Text>
              <Text style={styles.statLabel}>Paniers sauvés</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.primaryDark }]}>
                {Format.currency(totalSaved)}
              </Text>
              <Text style={styles.statLabel}>Économisés</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {foodSavedKg} kg
              </Text>
              <Text style={styles.statLabel}>Nourriture préservée</Text>
            </View>
          </View>
        </View>

        {/* Liste des achats réels */}
        <Text style={styles.listHeading}>Achats effectués</Text>
        {history.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bizName}>{item.businessName}</Text>
                <Text style={styles.offerName}>{item.offerName}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.priceText}>{Format.currency(item.pricePaid)}</Text>
                <Text style={styles.savedTag}>
                  Économie : {Format.currency(item.estimatedValue - item.pricePaid)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.statusPill}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.statusPillText}>Payé & récupéré au commerce</Text>
              </View>

              {item.hasReview ? (
                <View style={styles.reviewedBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.reviewedText}>Avis laissé</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.reviewActionBtn}
                  onPress={() => openReviewModal(item)}
                >
                  <Ionicons name="star-outline" size={14} color={Colors.primary} />
                  <Text style={styles.reviewActionText}>Laisser un avis</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Laisser un Avis */}
      <Modal visible={!!selectedSale} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Donner votre avis</Text>
              <TouchableOpacity onPress={() => setSelectedSale(null)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {selectedSale?.businessName} — {selectedSale?.offerName}
            </Text>

            {/* Sélecteur d'étoiles (1 à 5) */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons 
                    name={s <= rating ? "star" : "star-outline"} 
                    size={36} 
                    color="#F59E0B" 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Comment s'est passée votre récupération ? (qualité, accueil, fraîcheur)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <Button
              title="Publier mon avis"
              onPress={submitReview}
              size="lg"
            />
          </View>
        </View>
      </Modal>
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  impactCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  impactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 12,
  },
  impactStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#A7F3D0',
  },
  listHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bizName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  offerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  savedTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  reviewActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewedText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 14,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 20,
  },
});
