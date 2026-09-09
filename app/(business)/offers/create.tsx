import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/constants/theme';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { supabase, isSupabaseConfigured } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/context/auth';

export default function CreateOfferScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('Panier Surprise');
  const [description, setDescription] = useState('Assortiment de produits frais invendus du jour.');
  const [price, setPrice] = useState('250');
  const [estimatedValue, setEstimatedValue] = useState('800');
  const [quantity, setQuantity] = useState('5');
  const [startHour, setStartHour] = useState('18:00');
  const [endHour, setEndHour] = useState('20:00');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const numPrice = parseFloat(price);
    const numValue = parseFloat(estimatedValue);
    const numQuantity = parseInt(quantity, 10);

    if (isNaN(numPrice) || isNaN(numValue) || isNaN(numQuantity) || numQuantity <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir des montants et une quantité valides.');
      return;
    }

    if (numPrice > numValue) {
      Alert.alert('Attention', 'Le prix du panier doit être inférieur à la valeur estimée.');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && user) {
      try {
        // Recherche de l'entreprise du commerçant
        const { data: biz } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (biz) {
          const now = new Date();
          const [sH, sM] = startHour.split(':').map(Number);
          const [eH, eM] = endHour.split(':').map(Number);
          
          const startDate = new Date(now);
          startDate.setHours(sH || 18, sM || 0, 0, 0);

          const endDate = new Date(now);
          endDate.setHours(eH || 20, eM || 0, 0, 0);

          await supabase.from('offers').insert({
            business_id: biz.id,
            name,
            description,
            price: numPrice,
            estimated_value: numValue,
            initial_quantity: numQuantity,
            available_quantity: numQuantity,
            start_at: startDate.toISOString(),
            end_at: endDate.toISOString(),
            status: 'available',
          });
        }
      } catch (err) {
        console.warn('Erreur création offre:', err);
      }
    }

    setLoading(false);
    Alert.alert(
      'Offre publiée avec succès ! 🎉',
      `Votre panier "${name}" (${numQuantity} disponibles à ${numPrice} DA) est maintenant visible par les clients.`,
      [{ text: 'Super !', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un panier surprise</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.banner}>
            <Ionicons name="flash-outline" size={20} color="#059669" />
            <Text style={styles.bannerText}>
              Rapide : Publiez en 30 secondes pour sauver vos invendus du jour.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Nom du panier"
              value={name}
              onChangeText={setName}
              placeholder="Ex: Panier Viennoiseries & Pains"
            />

            <Input
              label="Description (optionnelle)"
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Assortiment de baguettes et croissants..."
              multiline
              numberOfLines={2}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Prix de vente (DA)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="250"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Valeur estimée (DA)"
                  value={estimatedValue}
                  onChangeText={setEstimatedValue}
                  keyboardType="numeric"
                  placeholder="800"
                />
              </View>
            </View>

            <Input
              label="Quantité de paniers à vendre"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="Ex: 5"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Heure de début"
                  value={startHour}
                  onChangeText={setStartHour}
                  placeholder="18:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Heure de fin"
                  value={endHour}
                  onChangeText={setEndHour}
                  placeholder="20:00"
                />
              </View>
            </View>

            <Button
              title="Publier l'offre maintenant"
              onPress={handleCreate}
              loading={loading}
              size="lg"
              style={{ marginTop: 10 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  bannerText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
