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
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function BusinessProfileScreen() {
  const { profile, user, signOut } = useAuth();

  const [bizName, setBizName] = useState(profile?.full_name || "Boulangerie L'Artisan d'Alger");
  const [phone, setPhone] = useState(profile?.phone || "0550 12 34 56");
  const [address, setAddress] = useState("14 Rue Didouche Mourad, Alger Centre");
  const [hours, setHours] = useState("07:00 - 21:00");
  const [wilaya, setWilaya] = useState("Alger");

  const handleSave = () => {
    Alert.alert('Succès', 'Les informations de votre commerce ont été mises à jour.');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter de votre espace partenaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fiche Établissement</Text>
        <Text style={styles.headerSubtitle}>Gérez les coordonnées publiques de votre commerce</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encadré Abonnement (2000 DA/mois) */}
        <View style={styles.subscriptionBox}>
          <View style={styles.subHeader}>
            <View style={styles.subLeft}>
              <Ionicons name="shield-checkmark" size={24} color="#059669" />
              <View>
                <Text style={styles.subTitle}>Abonnement Baraka Partenaire</Text>
                <Text style={styles.subStatus}>Statut : ACTIF (Jusqu'au 09/10/2026)</Text>
              </View>
            </View>
            <View style={styles.pillActive}>
              <Text style={styles.pillText}>2 000 DA / mois</Text>
            </View>
          </View>
          <Text style={styles.subDetails}>
            Votre abonnement vous permet de publier des offres en illimité sans aucune commission sur vos ventes.
          </Text>
        </View>

        {/* Formulaire profil entreprise */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Informations de l'entreprise</Text>

          <Input
            label="Nom commercial"
            value={bizName}
            onChangeText={setBizName}
          />

          <Input
            label="Téléphone professionnel"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Adresse complète"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Wilaya"
                value={wilaya}
                onChangeText={setWilaya}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Horaires"
                value={hours}
                onChangeText={setHours}
              />
            </View>
          </View>

          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            size="md"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Déconnexion de l'espace partenaire</Text>
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
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  subscriptionBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  subStatus: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  pillActive: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  subDetails: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
