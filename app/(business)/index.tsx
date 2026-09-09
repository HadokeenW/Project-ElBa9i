import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Format } from '../../src/constants/theme';
import { useAuth } from '../../src/context/auth';
import { Button } from '../../src/components/Button';

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();

  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const bizName = profile?.full_name || 'Boulangerie L\'Artisan d\'Alger';

  // Métriques de démonstration synchronisées
  const stats = {
    today: { sold: 18, revenue: 4500, available: 3, savedKg: 21.6 },
    week: { sold: 94, revenue: 24800, available: 3, savedKg: 112.8 },
    month: { sold: 380, revenue: 98000, available: 3, savedKg: 456.0 },
  }[period];

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête commerçant */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Espace Partenaire</Text>
          <Text style={styles.businessTitle}>Bonjour, {bizName} 👋</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.statusBadgeText}>Abonnement Actif</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filtre de période */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'today' && styles.periodBtnActive]}
            onPress={() => setPeriod('today')}
          >
            <Text style={[styles.periodText, period === 'today' && styles.periodTextActive]}>
              Aujourd'hui
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'week' && styles.periodBtnActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
              Cette semaine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
              Ce mois
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grille des statistiques clés */}
        <View style={styles.statsGrid}>
          {/* Ventes */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="basket" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statVal}>{stats.sold}</Text>
            <Text style={styles.statDesc}>Paniers vendus</Text>
          </View>

          {/* Revenus en DA */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={[styles.statVal, { color: Colors.primaryDark }]}>
              {Format.currency(stats.revenue)}
            </Text>
            <Text style={styles.statDesc}>Revenus générés</Text>
          </View>

          {/* Stock disponible */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="time-outline" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.statVal}>{stats.available}</Text>
            <Text style={styles.statDesc}>Paniers restants</Text>
          </View>

          {/* Nourriture sauvée */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="leaf-outline" size={24} color="#DC2626" />
            </View>
            <Text style={styles.statVal}>{stats.savedKg} kg</Text>
            <Text style={styles.statDesc}>Nourriture sauvée</Text>
          </View>
        </View>

        {/* Boutons d'actions rapides */}
        <Text style={styles.sectionHeading}>Actions rapides</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryActionCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(business)/offers/create')}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="add" size={28} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryActionTitle}>Publier un panier</Text>
              <Text style={styles.primaryActionDesc}>
                Créer une nouvelle offre en moins de 30 secondes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(business)/sales')}
          >
            <View style={styles.secondaryIconCircle}>
              <Ionicons name="cart" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.secondaryActionTitle}>Enregistrer une vente</Text>
              <Text style={styles.secondaryActionDesc}>
                Diminuer le stock lorsqu'un client paie en boutique
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Note et satisfaction */}
        <View style={styles.satisfactionBox}>
          <View style={styles.satLeft}>
            <Ionicons name="star" size={32} color="#F59E0B" />
            <View>
              <Text style={styles.satScore}>4.9 / 5.0</Text>
              <Text style={styles.satSub}>Basé sur 38 avis clients vérifiés</Text>
            </View>
          </View>
        </View>
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  businessTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginVertical: 14,
  },
  periodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: Colors.white,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statVal: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.text,
  },
  statDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  primaryActionDesc: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
  },
  secondaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    gap: 14,
  },
  secondaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  secondaryActionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  satisfactionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  satLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  satScore: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  satSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
