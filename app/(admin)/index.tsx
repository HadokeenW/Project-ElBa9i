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
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/auth';

interface PendingBusiness {
  id: string;
  name: string;
  category: string;
  wilaya: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended';
}

export default function AdminDashboardScreen() {
  const { signOut } = useAuth();
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([
    { id: 'b1', name: 'Boulangerie Moderne Kouba', category: 'Boulangeries', wilaya: 'Alger', phone: '0551 22 33 44', status: 'pending' },
    { id: 'b2', name: 'Snack El Bahdja', category: 'Fast-food', wilaya: 'Alger', phone: '0662 33 44 55', status: 'pending' },
    { id: 'b3', name: 'Pâtisserie Orientale Oran', category: 'Pâtisseries', wilaya: 'Oran', phone: '0773 44 55 66', status: 'active' },
  ]);

  const [activeTab, setActiveTab] = useState<'businesses' | 'reports' | 'stats'>('businesses');

  const validateBusiness = (id: string) => {
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status: 'active' } : b));
    Alert.alert('Succès', 'Commerce validé ! Il peut désormais publier des paniers.');
  };

  const suspendBusiness = (id: string) => {
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status: 'suspended' } : b));
    Alert.alert('Attention', 'Commerce suspendu temporairement.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Baraka Admin</Text>
          <Text style={styles.subtitle}>Supervision de la marketplace Algérie</Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Onglets Admin */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'businesses' && styles.tabActive]}
          onPress={() => setActiveTab('businesses')}
        >
          <Text style={[styles.tabText, activeTab === 'businesses' && styles.tabTextActive]}>
            Commerces ({businesses.filter(b => b.status === 'pending').length} en attente)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
            Signalements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            Stats Nationales
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'businesses' && (
          <>
            <Text style={styles.sectionTitle}>Validation des commerces partenaires</Text>
            {businesses.map((biz) => (
              <View key={biz.id} style={styles.bizCard}>
                <View style={styles.bizHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bizName}>{biz.name}</Text>
                    <Text style={styles.bizMeta}>{biz.category} • {biz.wilaya} • {biz.phone}</Text>
                  </View>
                  <View style={[
                    styles.statusPill,
                    biz.status === 'active' ? styles.statusActive : biz.status === 'pending' ? styles.statusPending : styles.statusSuspended
                  ]}>
                    <Text style={styles.statusText}>
                      {biz.status === 'active' ? 'Validé' : biz.status === 'pending' ? 'En attente' : 'Suspendu'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  {biz.status === 'pending' && (
                    <TouchableOpacity 
                      style={styles.validateBtn}
                      onPress={() => validateBusiness(biz.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
                      <Text style={styles.btnTextWhite}>Valider le commerce</Text>
                    </TouchableOpacity>
                  )}

                  {biz.status === 'active' && (
                    <TouchableOpacity 
                      style={styles.suspendBtn}
                      onPress={() => suspendBusiness(biz.id)}
                    >
                      <Ionicons name="ban-outline" size={16} color="#DC2626" />
                      <Text style={styles.btnTextRed}>Suspendre</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'reports' && (
          <View style={styles.card}>
            <View style={styles.reportRow}>
              <Ionicons name="alert-circle-outline" size={24} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.reportTitle}>Aucun signalement urgent</Text>
                <Text style={styles.reportSub}>Tous les signalements précédents ont été traités avec succès.</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            <View style={styles.statTile}>
              <Text style={styles.statVal}>128</Text>
              <Text style={styles.statLbl}>Commerces actifs</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statVal}>1,420</Text>
              <Text style={styles.statLbl}>Paniers sauvés ce mois</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statVal}>355 000 DA</Text>
              <Text style={styles.statLbl}>Économies citoyennes</Text>
            </View>
          </View>
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  bizCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  bizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bizName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  bizMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusSuspended: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  validateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  btnTextWhite: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  suspendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  btnTextRed: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  reportSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    gap: 12,
  },
  statTile: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  statLbl: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
