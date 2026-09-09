import React from 'react';
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
import { Colors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/auth';

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de Baraka Food ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Utilisateur Baraka';
  const displayEmail = user?.email || 'compte@barakafood.dz';
  const displayPhone = profile?.phone || user?.user_metadata?.phone || '0550 00 00 00';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Carte Identité */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>Compte Client</Text>
            </View>
          </View>
        </View>

        {/* Section coordonnées */}
        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuItemLabel}>Téléphone</Text>
            <Text style={styles.menuItemValue}>{displayPhone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuItemLabel}>Pays / Devise</Text>
            <Text style={styles.menuItemValue}>Algérie (DA)</Text>
          </View>
        </View>

        {/* Liens rapides */}
        <Text style={styles.groupHeading}>Activité & Historique</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => router.push('/(client)/history')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
              <Text style={styles.actionLabel}>Mes achats & repas sauvés</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => router.push('/(client)/favorites')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
              <Text style={styles.actionLabel}>Mes commerces favoris</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Paramètres & Aide */}
        <Text style={styles.groupHeading}>Préférences</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Notifications', 'Les alertes push sont actives pour vos commerces favoris.')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.secondary} />
              <Text style={styles.actionLabel}>Notifications push</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Baraka Food Algérie', 'Version 1.0.0 (MVP)\nPlateforme anti-gaspillage solidaire.')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.actionLabel}>À propos de Baraka Food</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleTagText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  groupHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  menuItemValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
