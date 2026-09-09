import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { Colors } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [role, setRole] = useState<'client' | 'business'>('client');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
      setErrorMsg('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const { error } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Bouton retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.brandTitle}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez le mouvement anti-gaspillage en Algérie</Text>
        </View>

        {/* Sélecteur de Rôle (Client vs Entreprise) */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'client' && styles.roleTabActive]}
            onPress={() => setRole('client')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="person-outline" 
              size={18} 
              color={role === 'client' ? Colors.white : Colors.textSecondary} 
            />
            <Text style={[styles.roleTabText, role === 'client' && styles.roleTabTextActive]}>
              Client
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'business' && styles.roleTabActive]}
            onPress={() => setRole('business')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="storefront-outline" 
              size={18} 
              color={role === 'business' ? Colors.white : Colors.textSecondary} 
            />
            <Text style={[styles.roleTabText, role === 'business' && styles.roleTabTextActive]}>
              Commerçant
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          )}

          <Input
            label={role === 'business' ? "Nom du commerce ou du gérant" : "Nom complet"}
            placeholder={role === 'business' ? "Ex: Boulangerie El Baraka" : "Ex: Amina Benali"}
            value={fullName}
            onChangeText={(t) => { setFullName(t); setErrorMsg(null); }}
          />

          <Input
            label="Numéro de téléphone (Algérie)"
            placeholder="05 / 06 / 07 XX XX XX"
            value={phone}
            onChangeText={(t) => { setPhone(t); setErrorMsg(null); }}
            keyboardType="phone-pad"
          />

          <Input
            label="Adresse Email"
            placeholder="exemple@email.dz"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrorMsg(null); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Mot de passe"
            placeholder="Au moins 6 caractères"
            value={password}
            onChangeText={(t) => { setPassword(t); setErrorMsg(null); }}
            secureTextEntry
          />

          <Button
            title={role === 'business' ? "Créer mon compte commerçant" : "Créer mon compte client"}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={{ marginTop: 8 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: Colors.primary,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  form: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
